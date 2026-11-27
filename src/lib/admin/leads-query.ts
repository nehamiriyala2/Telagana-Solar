import "server-only";
import { q } from "./db";
import { BILL_RANGES, LOST_REASONS, ROOFS, SOURCES, STATUSES, SYSTEMS, USES } from "./labels";
import { can, ownLeadsOnly, type Role } from "./roles";
import { istRange, type RangeKey } from "./time";

/**
 * One filter definition shared by the Leads list, CSV export and Previous/Next,
 * so all three always agree. Filters come from the URL (shareable links).
 */
export interface LeadFilter {
  q: string; tab: "all" | "nocontact";
  status: string; source: string; district: string; discom: string; use: string; place: string; lang: string;
  system: string; cuts: string; roof: string; bill: string; scheme: string; owner: string;
  range: RangeKey; from: string; to: string; test: boolean; deleted: boolean; page: number;
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const pickIn = (v: string, list: readonly string[]) => (list.includes(v) ? v : "");

export function parseFilter(sp: Record<string, string | string[] | undefined>): LeadFilter {
  const range = one(sp.range);
  return {
    q: one(sp.q).trim().slice(0, 80),
    tab: one(sp.tab) === "nocontact" ? "nocontact" : "all",
    status: pickIn(one(sp.status), STATUSES),
    source: pickIn(one(sp.source), SOURCES),
    district: /^[a-z-]{2,60}$/.test(one(sp.district)) ? one(sp.district) : "",
    discom: pickIn(one(sp.discom), ["TGSPDCL", "TGNPDCL"]),
    use: pickIn(one(sp.use), USES),
    place: one(sp.place).slice(0, 160),
    lang: pickIn(one(sp.lang), ["en", "te"]),
    system: pickIn(one(sp.system), SYSTEMS),
    cuts: pickIn(one(sp.cuts), ["yes", "no"]),
    roof: pickIn(one(sp.roof), ROOFS),
    bill: pickIn(one(sp.bill), BILL_RANGES.map((b) => b.key)),
    scheme: /^[a-z-]{2,60}$/.test(one(sp.scheme)) ? one(sp.scheme) : "",
    owner: /^(\d+|none|me)$/.test(one(sp.owner)) ? one(sp.owner) : "",
    range: (["today", "7d", "30d", "year", "custom"].includes(range) ? range : "all") as RangeKey,
    from: one(sp.from), to: one(sp.to),
    test: one(sp.test) === "1",
    deleted: one(sp.deleted) === "1",
    page: Math.max(1, Math.min(10_000, Number.parseInt(one(sp.page), 10) || 1)),
  };
}

/** Back to URL params (only non-defaults), for links that keep the current filter. */
export function filterToParams(f: LeadFilter, overrides: Partial<Record<keyof LeadFilter, string | number | boolean>> = {}): URLSearchParams {
  const merged = { ...f, ...overrides } as Record<string, unknown>;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === "" || v === false || v === null || v === undefined) continue;
    if (k === "tab" && v === "all") continue;
    if (k === "range" && v === "all") continue;
    if (k === "page" && Number(v) <= 1) continue;
    if (k === "from" || k === "to") { if (merged.range !== "custom") continue; }
    p.set(k, v === true ? "1" : String(v));
  }
  return p;
}

const likeEsc = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Parameterized WHERE for a filter. `alias` is the leads table alias. */
export function buildWhere(f: LeadFilter, staff: { id: number; role: Role }, alias = "l"): { sql: string; params: (string | number | Date)[] } {
  const w: string[] = [];
  const p: (string | number | Date)[] = [];
  const a = alias;

  // Sales only ever see leads assigned to them; this applies to every list, count and export built here.
  if (ownLeadsOnly(staff.role)) { w.push(`${a}.assigned_to = ?`); p.push(staff.id); }
  if (!(f.deleted && can(staff.role, "leads.delete"))) w.push(`${a}.deleted_at IS NULL`);
  if (!f.test) w.push(`${a}.is_test = 0`);
  const noContact = `(${a}.phone_normalized IS NULL AND ${a}.anonymized_at IS NULL)`;
  w.push(f.tab === "nocontact" ? noContact : `NOT ${noContact}`);

  if (f.q) {
    const qs = f.q.trim();
    const ts = /^ts-?0*(\d{1,9})$/i.exec(qs);
    const digits = qs.replace(/\D/g, "");
    if (ts) { w.push(`${a}.id = ?`); p.push(Number(ts[1])); }
    else if (digits.length >= 4 && digits.length === qs.replace(/[\s+()-]/g, "").length) {
      const d = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits;
      w.push(`(${a}.phone_normalized LIKE ? OR ${a}.alt_phone_normalized LIKE ?)`); p.push(`%${likeEsc(d)}%`, `%${likeEsc(d)}%`);
    } else {
      const like = `%${likeEsc(qs)}%`;
      w.push(`(${a}.name LIKE ? OR ${a}.area LIKE ? OR ${a}.place LIKE ? OR ${a}.lead_no LIKE ? OR ${a}.email LIKE ?)`); p.push(like, like, like, like, like);
    }
  }
  if (f.status) { w.push(`${a}.status = ?`); p.push(f.status); }
  if (f.source) { w.push(`${a}.source = ?`); p.push(f.source); }
  if (f.district) { w.push(`${a}.district_id = (SELECT id FROM districts WHERE slug = ?)`); p.push(f.district); }
  if (f.discom) { w.push(`${a}.district_id IN (SELECT id FROM districts WHERE discom = ?)`); p.push(f.discom); }
  if (f.use) { w.push(`${a}.use_type = ?`); p.push(f.use); }
  if (f.place) { w.push(`${a}.place = ?`); p.push(f.place); }
  if (f.lang) { w.push(`${a}.lang = ?`); p.push(f.lang); }
  if (f.system) { w.push(`${a}.system_type = ?`); p.push(f.system); }
  if (f.cuts) { w.push(`${a}.power_cuts = ?`); p.push(f.cuts === "yes" ? 1 : 0); }
  if (f.roof) { w.push(`${a}.roof = ?`); p.push(f.roof); }
  if (f.bill) {
    const b = BILL_RANGES.find((r) => r.key === f.bill)!;
    w.push(`${a}.bill >= ?`); p.push(b.min);
    if (b.max !== null) { w.push(`${a}.bill <= ?`); p.push(b.max); }
  }
  if (f.scheme) { w.push(`JSON_CONTAINS(${a}.schemes, JSON_QUOTE(?))`); p.push(f.scheme); }
  if (f.owner === "none") w.push(`${a}.assigned_to IS NULL`);
  else if (f.owner === "me") { w.push(`${a}.assigned_to = ?`); p.push(staff.id); }
  else if (f.owner) { w.push(`${a}.assigned_to = ?`); p.push(Number(f.owner)); }

  const r = istRange(f.range, new Date(), f.from, f.to);
  if (r.from) { w.push(`${a}.created_at >= ?`); p.push(r.from); }
  if (r.to) { w.push(`${a}.created_at < ?`); p.push(r.to); }

  return { sql: w.length ? `WHERE ${w.join(" AND ")}` : "", params: p };
}

export const PAGE_SIZE = 50;

export interface LeadRow {
  id: number; lead_no: string | null; created_at: Date; submitted_at: Date | null; source: string | null; kind: string | null;
  name: string | null; phone: string | null; phone_normalized: string | null; area: string | null; place: string | null;
  use_type: string | null; bill: number | null; units: number | null; power_cuts: number | null; roof: string | null;
  kw: string | null; system_type: string | null; monthly_saving: number | null; schemes: string | string[] | null;
  message: string | null; lang: string | null; page: string | null; status: string; assigned_to: number | null;
  next_follow_up: Date | null; site_visit_at: Date | null; final_kw: string | null; quote_amount: number | null; final_amount: number | null;
  subsidy_applied: number | null; loan_needed: number | null; won_at: Date | null; install_date: string | Date | null;
  lost_reason: string | null; utm_source: string | null; utm_campaign: string | null; referrer: string | null;
  is_test: number; deleted_at: Date | null; district_id: number | null;
  alt_phone: string | null; alt_phone_normalized: string | null; email: string | null; address: string | null;
  roof_area_sqft: number | null; created_by: number | null;
  district_slug: string | null; district_en: string | null; district_te: string | null; discom: string | null;
  owner_name: string | null; owner_active: number | null; repeat_count: number;
}

export const LEAD_SELECT = `
  SELECT l.*, d.slug AS district_slug, d.name_en AS district_en, d.name_te AS district_te, d.discom,
         s.name AS owner_name, s.active AS owner_active,
         (SELECT COUNT(*) FROM leads r WHERE r.phone_normalized = l.phone_normalized AND r.id <> l.id AND r.deleted_at IS NULL) AS repeat_count
  FROM leads l
  LEFT JOIN districts d ON d.id = l.district_id
  LEFT JOIN staff s ON s.id = l.assigned_to`;

export async function listLeads(f: LeadFilter, staff: { id: number; role: Role }, opts: { all?: boolean } = {}) {
  const { sql, params } = buildWhere(f, staff);
  const [{ total }] = await q<{ total: number }>(`SELECT COUNT(*) AS total FROM leads l ${sql}`, params);
  // LIMIT/OFFSET are integers computed here (never from raw input), so they are safe to inline.
  const limit = opts.all ? 50_000 : PAGE_SIZE;
  const offset = opts.all ? 0 : (f.page - 1) * PAGE_SIZE;
  const rows = await q<LeadRow>(`${LEAD_SELECT} ${sql} ORDER BY l.created_at DESC, l.id DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`, params);
  return { rows, total: Number(total) };
}

/** Neighbours of a lead inside the same filtered, newest-first list. prev = newer, next = older. */
export async function neighbours(id: number, createdAt: Date, f: LeadFilter, staff: { id: number; role: Role }) {
  const { sql, params } = buildWhere(f, staff);
  const and = sql ? `${sql} AND` : "WHERE";
  const [prev] = await q<{ id: number }>(`SELECT l.id FROM leads l ${and} (l.created_at > ? OR (l.created_at = ? AND l.id > ?)) ORDER BY l.created_at ASC, l.id ASC LIMIT 1`, [...params, createdAt, createdAt, id]);
  const [next] = await q<{ id: number }>(`SELECT l.id FROM leads l ${and} (l.created_at < ? OR (l.created_at = ? AND l.id < ?)) ORDER BY l.created_at DESC, l.id DESC LIMIT 1`, [...params, createdAt, createdAt, id]);
  return { prev: prev?.id ?? null, next: next?.id ?? null };
}

export function parseSchemes(v: LeadRow["schemes"]): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  try { const a = JSON.parse(v); return Array.isArray(a) ? a.map(String) : []; } catch { return []; }
}

export { LOST_REASONS };
