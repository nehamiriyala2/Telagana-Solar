import "server-only";
import { z } from "zod";
import type { PoolConnection } from "mysql2/promise";
import { exec, one, q, tx } from "./db";
import { LOST_REASONS, MANUAL_SOURCES, ROOFS, SOURCES, STATUSES, USES } from "./labels";
import { LEAD_SELECT, type LeadRow } from "./leads-query";
import { mergeUpdates, type MergeField, type Pick as MergePick } from "./merge";
import { phone10 } from "./phone";
import { ownLeadsOnly } from "./roles";
import { istLocalToUtc } from "./time";
import { audit } from "./audit";
import { cancelOpenFollowUps, syncNextFollowUp } from "./follow-ups-core";
import type { Staff } from "./auth";

export class HttpError extends Error {
  constructor(public status: number, public code: string, message?: string) { super(message ?? code); }
}

export function errorResponse(e: unknown) {
  if (e instanceof DuplicateError) {
    const matches = e.matches.map((m) => ({ id: m.id, leadNo: m.lead_no, name: m.name, status: m.status, owner: m.owner }));
    return Response.json({ error: e.code, message: e.message, matches }, { status: e.status });
  }
  if (e instanceof HttpError) return Response.json({ error: e.code, message: e.message }, { status: e.status });
  if (e instanceof z.ZodError) return Response.json({ error: "invalid", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 400 });
  console.error("[admin] lead api error:", (e as Error).message);
  return Response.json({ error: "server_error" }, { status: 500 });
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, "not_found");
  return id;
}

export type FullLead = LeadRow & { anonymized_at: Date | null; first_contacted_at: Date | null };

/** One lead, or 404 when it is deleted (non-admin) or, for sales, not assigned to them. */
export async function getLead(id: number, staff: Pick<Staff, "role" | "id">): Promise<FullLead> {
  const lead = await one<FullLead>(`${LEAD_SELECT} WHERE l.id = ?`, [id]);
  if (!lead || (lead.deleted_at && staff.role !== "admin")) throw new HttpError(404, "not_found");
  if (ownLeadsOnly(staff.role) && lead.assigned_to !== staff.id) throw new HttpError(404, "not_found");
  return lead;
}

/** Other live leads with the same main or alternate phone (duplicate detection). */
export async function duplicatesFor(phones: (string | null | undefined)[], excludeId: number | null, staff: Pick<Staff, "role" | "id">) {
  const list = [...new Set(phones.filter((p): p is string => !!p))];
  if (!list.length) return [];
  const own = ownLeadsOnly(staff.role);
  const marks = list.map(() => "?").join(", ");
  return q<{ id: number; lead_no: string; name: string | null; status: string; created_at: Date; owner: string | null }>(
    `SELECT l.id, l.lead_no, l.name, l.status, l.created_at, s.name AS owner FROM leads l LEFT JOIN staff s ON s.id = l.assigned_to
     WHERE l.deleted_at IS NULL AND (l.phone_normalized IN (${marks}) OR l.alt_phone_normalized IN (${marks}))
       ${excludeId ? "AND l.id <> ?" : ""} ${own ? "AND l.assigned_to = ?" : ""}
     ORDER BY l.created_at DESC LIMIT 10`,
    [...list, ...list, ...(excludeId ? [excludeId] : []), ...(own ? [staff.id] : [])],
  );
}

async function log(conn: PoolConnection | null, leadId: number, staffId: number | null, action: string, details: Record<string, unknown> | null) {
  const sql = "INSERT INTO lead_activity (lead_id, staff_id, action, details) VALUES (?, ?, ?, ?)";
  const params = [leadId, staffId, action, details ? JSON.stringify(details) : null];
  if (conn) await conn.execute(sql, params); else await exec(sql, params);
}

/* ───────── PATCH: status + deal fields ───────── */

const dt = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).nullable();
/** Trimmed text; "" becomes null. Control characters are stripped. */
const text = (max: number) => z.string().max(max * 2).transform((s) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max)).transform((s) => s || null).nullable();
const phoneField = z.string().max(20).nullable().transform((v, ctx) => {
  if (v === null || v.trim() === "") return null;
  const ten = phone10(v);
  if (!ten) { ctx.addIssue({ code: "custom", message: "Enter a 10-digit mobile number starting with 6, 7, 8 or 9." }); return z.NEVER; }
  return ten;
});
const emailField = z.string().max(190).nullable().transform((v, ctx) => {
  const s = v?.trim().toLowerCase() ?? "";
  if (!s) return null;
  if (!z.email().safeParse(s).success) { ctx.addIssue({ code: "custom", message: "Enter a valid email address." }); return z.NEVER; }
  return s;
});
const slug = z.string().regex(/^[a-z][a-z-]{1,58}$/);
const money = z.number().int().min(0).max(10_000_000).nullable();

/** Customer details staff can edit. Kept separate so creating a lead can reuse it. */
const ContactShape = {
  name: text(120).optional(),
  phone: phoneField.optional(),
  alt_phone: phoneField.optional(),
  email: emailField.optional(),
  district: slug.nullable().optional(),
  area: text(160).optional(),
  address: text(255).optional(),
  use_type: z.enum(USES).nullable().optional(),
  bill: money.optional(),
  units: z.number().int().min(0).max(1_000_000).nullable().optional(),
  roof: z.enum(ROOFS).nullable().optional(),
  roof_area_sqft: z.number().int().min(0).max(1_000_000).nullable().optional(),
  schemes: z.array(slug).max(10).optional(),
  is_test: z.boolean().optional(),
};

export const PatchSchema = z.object({
  status: z.enum(STATUSES).optional(),
  lost_reason: z.enum(LOST_REASONS).nullable().optional(),
  assigned_to: z.number().int().positive().nullable().optional(),
  site_visit_at: dt.optional(),
  final_kw: z.number().min(0).max(10_000).nullable().optional(),
  quote_amount: z.number().int().min(0).max(1_000_000_000).nullable().optional(),
  final_amount: z.number().int().min(0).max(1_000_000_000).nullable().optional(),
  subsidy_applied: z.boolean().nullable().optional(),
  loan_needed: z.boolean().nullable().optional(),
  install_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  ...ContactShape,
  source: z.enum(SOURCES).optional(),
  /** Save even though another lead has this phone number. */
  allow_duplicate: z.boolean().optional(),
}).strict();

const DEAL_FIELDS = ["site_visit_at", "final_kw", "quote_amount", "final_amount", "subsidy_applied", "loan_needed", "install_date"] as const;

/**
 * A deal can only be marked Won with its system size, final amount and whether subsidy was applied.
 * Values can come in the same request or already be on the lead. Returns the missing field names.
 */
export function missingWonDetails(cur: Record<string, unknown>, input: { final_kw?: number | null; final_amount?: number | null; subsidy_applied?: boolean | null }): string[] {
  const pick = <T,>(v: T | undefined, c: unknown) => (v !== undefined ? v : c);
  const kw = Number(pick(input.final_kw, cur.final_kw) ?? 0);
  const amount = pick(input.final_amount, cur.final_amount);
  const subsidy = pick(input.subsidy_applied, cur.subsidy_applied);
  const miss: string[] = [];
  if (!(kw > 0)) miss.push("system size (kW)");
  if (amount === null || amount === undefined || amount === "") miss.push("final amount");
  if (subsidy === null || subsidy === undefined) miss.push("whether subsidy was applied");
  return miss;
}
/** Customer fields: the timeline records that they changed, never the personal values themselves. */
const PRIVATE_FIELDS = ["name", "phone", "alt_phone", "email", "area", "address"] as const;
const PLAIN_FIELDS = ["use_type", "bill", "units", "roof", "roof_area_sqft", "source"] as const;

/** DB column updates for the customer-detail part of a patch, compared with the current row. */
async function contactUpdates(cur: Record<string, unknown>, input: z.infer<typeof PatchSchema>, conn: PoolConnection) {
  const set: Record<string, unknown> = {};
  const logs: { field: string; from: unknown; to: unknown }[] = [];
  for (const f of PRIVATE_FIELDS) {
    const v = input[f];
    if (v === undefined) continue;
    const col = f === "phone" ? "phone_normalized" : f === "alt_phone" ? "alt_phone_normalized" : f;
    if (norm(cur[col]) === norm(v)) continue;
    if (f === "phone") { if (v === null) throw new HttpError(400, "phone_required", "A lead needs a phone number. Use “Anonymize” to remove it."); set.phone = v; set.phone_normalized = v; }
    else if (f === "alt_phone") { set.alt_phone = v; set.alt_phone_normalized = v; }
    else set[f] = v;
    logs.push({ field: f, from: cur[col] ? "set" : null, to: v ? "changed" : null });
  }
  for (const f of PLAIN_FIELDS) {
    const v = input[f];
    if (v === undefined || norm(cur[f]) === norm(v)) continue;
    set[f] = v;
    logs.push({ field: f, from: norm(cur[f]), to: norm(v) });
  }
  if (input.district !== undefined) {
    let districtId: number | null = null;
    if (input.district) {
      const [d] = await conn.execute("SELECT id FROM districts WHERE slug = ?", [input.district]);
      districtId = (d as { id: number }[])[0]?.id ?? null;
      if (!districtId) throw new HttpError(400, "invalid_district", "Pick a district from the list.");
    }
    if (norm(cur.district_id) !== norm(districtId)) { set.district_id = districtId; logs.push({ field: "district", from: null, to: input.district }); }
  }
  if (input.schemes !== undefined) {
    const before = (typeof cur.schemes === "string" ? JSON.parse(cur.schemes) : cur.schemes ?? []) as string[];
    if (JSON.stringify([...before].sort()) !== JSON.stringify([...input.schemes].sort())) {
      set.schemes = JSON.stringify(input.schemes);
      logs.push({ field: "schemes", from: before.join(", ") || null, to: input.schemes.join(", ") || null });
    }
  }
  if (input.is_test !== undefined && Boolean(cur.is_test) !== input.is_test) {
    set.is_test = input.is_test ? 1 : 0;
    logs.push({ field: "is_test", from: Boolean(cur.is_test), to: input.is_test });
  }
  return { set, logs };
}

/** Comparable form of a DB or input value (for old → new logs). */
function norm(v: unknown): string | number | boolean | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string" && /^\d+(\.\d+)?$/.test(v)) return Number(v);
  return v as string | number | boolean;
}
function dateOnly(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

export async function patchLead(id: number, input: z.infer<typeof PatchSchema>, staff: Staff) {
  await getLead(id, staff); // 404 for leads this person can't see
  if (input.phone || input.alt_phone) {
    const dups = await duplicatesFor([input.phone, input.alt_phone], id, { role: "admin", id: staff.id });
    if (dups.length && !input.allow_duplicate) throw new DuplicateError(dups);
  }
  return tx(async (conn) => {
    const [rows] = await conn.execute("SELECT * FROM leads WHERE id = ? FOR UPDATE", [id]);
    const cur = (rows as Record<string, unknown>[])[0];
    if (!cur) throw new HttpError(404, "not_found");
    if (cur.deleted_at) throw new HttpError(409, "deleted", "This lead is deleted. Restore it first.");

    const contact = await contactUpdates(cur, input, conn);
    const set: Record<string, unknown> = { ...contact.set };

    if (input.status !== undefined && input.status !== cur.status) {
      if (input.status === "lost" && !input.lost_reason) throw new HttpError(400, "lost_reason_required", "Pick a reason before marking the lead lost.");
      if (input.status === "won") {
        const miss = missingWonDetails(cur, input);
        if (miss.length) throw new HttpError(400, "won_details_required", `To mark this lead won, add the ${miss.join(", ")}.`);
      }
      set.status = input.status;
      set.lost_reason = input.status === "lost" ? input.lost_reason : null;
      if (input.status === "won" && !cur.won_at) set.won_at = new Date();
      if (cur.status === "new" && !cur.first_contacted_at) set.first_contacted_at = new Date();
    } else if (input.lost_reason !== undefined && cur.status === "lost" && input.lost_reason !== cur.lost_reason) {
      if (!input.lost_reason) throw new HttpError(400, "lost_reason_required");
      set.lost_reason = input.lost_reason;
    }

    if (input.assigned_to !== undefined && input.assigned_to !== cur.assigned_to) {
      if (input.assigned_to !== null) {
        const [s] = await conn.execute("SELECT id FROM staff WHERE id = ? AND active = 1", [input.assigned_to]);
        if (!(s as unknown[]).length) throw new HttpError(400, "invalid_owner", "That staff member is not active.");
      }
      set.assigned_to = input.assigned_to;
    }

    for (const f of DEAL_FIELDS) {
      const v = input[f];
      if (v === undefined) continue;
      let next: unknown = v;
      if (f === "site_visit_at") {
        next = v === null ? null : istLocalToUtc(v as string);
        if (v !== null && !next) throw new HttpError(400, "invalid_date");
      }
      if (f === "subsidy_applied" || f === "loan_needed") next = v === null ? null : v ? 1 : 0;
      const same = f === "install_date" ? dateOnly(cur[f]) === dateOnly(next)
        : f === "site_visit_at" ? norm(cur[f]) === norm(next)
        : norm(cur[f]) === norm(next);
      if (!same) set[f] = next;
    }

    const keys = Object.keys(set);
    if (!keys.length) return { changed: [] as string[] };
    // Column names come from the fixed lists above, never from input.
    await conn.execute(`UPDATE leads SET ${keys.map((k) => `\`${k}\` = ?`).join(", ")} WHERE id = ?`, [...keys.map((k) => set[k] as never), id]);

    if ("status" in set) await log(conn, id, staff.id, "status_changed", { from: cur.status, to: set.status, ...(set.lost_reason ? { lost_reason: set.lost_reason } : {}) });
    if (set.status === "lost") await cancelOpenFollowUps(conn, id, staff.id);
    if ("assigned_to" in set) {
      const names = await staffNames(conn, [cur.assigned_to as number | null, set.assigned_to as number | null]);
      await log(conn, id, staff.id, "assigned", { from: names[0], to: names[1] });
    }
    for (const f of DEAL_FIELDS) {
      if (!(f in set)) continue;
      const fmt = (v: unknown) => (f === "install_date" ? dateOnly(v) : norm(v));
      await log(conn, id, staff.id, "field_edited", { field: f, from: fmt(cur[f]), to: fmt(set[f]) });
    }
    for (const l of contact.logs) await log(conn, id, staff.id, "field_edited", l);
    return { changed: keys };
  });
}

/** 409 with the matching leads, so the UI can say "TS-0012 has this number" and offer to save anyway. */
export class DuplicateError extends HttpError {
  constructor(public matches: Awaited<ReturnType<typeof duplicatesFor>>) {
    super(409, "duplicate", `Another lead already has this phone number (${matches.map((m) => m.lead_no).join(", ")}).`);
  }
}

/* ───────── Create (staff adds a call / WhatsApp / referral / walk-in lead) ───────── */

export const CreateSchema = z.object({
  ...ContactShape,
  name: z.string().trim().min(2, "Enter the customer’s name.").max(120),
  phone: z.string().max(20).transform((v, ctx) => {
    const ten = phone10(v);
    if (!ten) { ctx.addIssue({ code: "custom", message: "Enter a 10-digit mobile number starting with 6, 7, 8 or 9." }); return z.NEVER; }
    return ten;
  }),
  source: z.enum(MANUAL_SOURCES),
  status: z.enum(["new", "contacted"]).default("new"),
  assigned_to: z.number().int().positive().nullable().optional(),
  note: text(2000).optional(),
  allow_duplicate: z.boolean().optional(),
}).strict();

export async function createLead(input: z.infer<typeof CreateSchema>, staff: Staff): Promise<{ id: number; leadNo: string }> {
  const dups = await duplicatesFor([input.phone, input.alt_phone], null, { role: "admin", id: staff.id });
  if (dups.length && !input.allow_duplicate) throw new DuplicateError(dups);
  // Sales can only create leads for themselves (they would not see anyone else's).
  const owner = ownLeadsOnly(staff.role) ? staff.id : input.assigned_to ?? null;

  return tx(async (conn) => {
    if (owner) {
      const [s] = await conn.execute("SELECT id FROM staff WHERE id = ? AND active = 1 AND role IN ('admin','sales')", [owner]);
      if (!(s as unknown[]).length) throw new HttpError(400, "invalid_owner", "That staff member is not active.");
    }
    let districtId: number | null = null;
    if (input.district) {
      const [d] = await conn.execute("SELECT id FROM districts WHERE slug = ?", [input.district]);
      districtId = (d as { id: number }[])[0]?.id ?? null;
      if (!districtId) throw new HttpError(400, "invalid_district", "Pick a district from the list.");
    }
    const now = new Date();
    const [res] = await conn.execute(
      `INSERT INTO leads (submitted_at, source, kind, name, phone, phone_normalized, alt_phone, alt_phone_normalized, email, area, address,
         use_type, bill, units, roof, roof_area_sqft, schemes, district_id, status, assigned_to, first_contacted_at, is_test, created_by)
       VALUES (?, ?, 'manual', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        now, input.source, input.name, input.phone, input.phone, input.alt_phone ?? null, input.alt_phone ?? null, input.email ?? null,
        input.area ?? null, input.address ?? null, input.use_type ?? null, input.bill ?? null, input.units ?? null, input.roof ?? null,
        input.roof_area_sqft ?? null, input.schemes?.length ? JSON.stringify(input.schemes) : null, districtId, input.status, owner,
        input.status === "contacted" ? now : null, input.is_test ? 1 : 0, staff.id,
      ],
    );
    const id = (res as { insertId: number }).insertId;
    const leadNo = `TS-${String(id).padStart(4, "0")}`;
    await conn.execute("UPDATE leads SET lead_no = ? WHERE id = ?", [leadNo, id]);
    await log(conn, id, staff.id, "created", { source: input.source, manual: true });
    if (owner) {
      const [n] = await staffNames(conn, [owner]);
      await log(conn, id, staff.id, "assigned", { from: null, to: n });
    }
    if (input.note) {
      const [nr] = await conn.execute("INSERT INTO lead_notes (lead_id, staff_id, body) VALUES (?, ?, ?)", [id, staff.id, input.note]);
      await log(conn, id, staff.id, "note_added", { note_id: (nr as { insertId: number }).insertId });
    }
    return { id, leadNo };
  });
}

/* ───────── Bulk assign / status ───────── */

export const BulkSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign"), ids: z.array(z.number().int().positive()).min(1).max(500), assigned_to: z.number().int().positive().nullable() }),
  z.object({
    action: z.literal("status"), ids: z.array(z.number().int().positive()).min(1).max(500),
    status: z.enum(STATUSES), lost_reason: z.enum(LOST_REASONS).nullable().optional(),
  }),
]);

/** Applies the same change to each lead through patchLead, so every lead gets its own timeline entry. */
export async function bulkUpdate(input: z.infer<typeof BulkSchema>, staff: Staff) {
  if (input.action === "status" && input.status === "lost" && !input.lost_reason) throw new HttpError(400, "lost_reason_required", "Pick a reason before marking leads lost.");
  const ids = [...new Set(input.ids)];
  let updated = 0, unchanged = 0;
  const failed: { id: number; message: string }[] = [];
  for (const id of ids) {
    try {
      const patch = input.action === "assign" ? { assigned_to: input.assigned_to } : { status: input.status, lost_reason: input.lost_reason ?? null };
      const r = await patchLead(id, patch, staff);
      if (r.changed.length) updated++; else unchanged++;
    } catch (e) {
      failed.push({ id, message: e instanceof HttpError ? e.message : "Could not update." });
    }
  }
  await audit(staff.id, input.action === "assign" ? "leads_bulk_assigned" : "leads_bulk_status", `leads:${ids.length}`,
    input.action === "assign" ? { to: input.assigned_to, updated, failed: failed.length } : { to: input.status, updated, failed: failed.length });
  return { updated, unchanged, failed };
}

/* ───────── Call / WhatsApp taps ───────── */

export const ContactLogSchema = z.object({ channel: z.enum(["call", "whatsapp"]), template: z.string().max(40).optional() });

/** Records a Call / WhatsApp tap on the timeline and sets the first-contact time (used for response-time reports). */
export async function logContact(leadId: number, input: z.infer<typeof ContactLogSchema>, staff: Staff) {
  const lead = await getLead(leadId, staff);
  if (lead.deleted_at) throw new HttpError(409, "deleted");
  await log(null, leadId, staff.id, input.channel === "call" ? "called" : "whatsapp_opened", input.template ? { template: input.template } : null);
  if (!lead.first_contacted_at) await exec("UPDATE leads SET first_contacted_at = UTC_TIMESTAMP() WHERE id = ? AND first_contacted_at IS NULL", [leadId]);
}

async function staffNames(conn: PoolConnection, ids: (number | null)[]): Promise<(string | null)[]> {
  const real = ids.filter((x): x is number => !!x);
  if (!real.length) return ids.map(() => null);
  const [rows] = await conn.query("SELECT id, name FROM staff WHERE id IN (?)", [real]);
  const map = new Map((rows as { id: number; name: string }[]).map((r) => [r.id, r.name]));
  return ids.map((i) => (i ? map.get(i) ?? `#${i}` : null));
}

/* ───────── Notes ───────── */

export const NoteSchema = z.object({ body: z.string().trim().min(1, "Write something first.").max(2000) });

export async function addNote(leadId: number, body: string, staff: Staff) {
  await getLead(leadId, staff);
  const res = await exec("INSERT INTO lead_notes (lead_id, staff_id, body) VALUES (?, ?, ?)", [leadId, staff.id, body]);
  await log(null, leadId, staff.id, "note_added", { note_id: res.insertId });
  return res.insertId;
}

async function ownNote(leadId: number, noteId: number, staff: Staff) {
  await getLead(leadId, staff);
  const n = await one<{ staff_id: number | null }>("SELECT staff_id FROM lead_notes WHERE id = ? AND lead_id = ?", [noteId, leadId]);
  if (!n) throw new HttpError(404, "not_found");
  if (staff.role !== "admin" && n.staff_id !== staff.id) throw new HttpError(403, "forbidden", "Only the author or an admin can change this note.");
}

export async function editNote(leadId: number, noteId: number, body: string, staff: Staff) {
  await ownNote(leadId, noteId, staff);
  await exec("UPDATE lead_notes SET body = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?", [body, noteId]);
  await log(null, leadId, staff.id, "note_edited", { note_id: noteId });
}

export async function deleteNote(leadId: number, noteId: number, staff: Staff) {
  await ownNote(leadId, noteId, staff);
  await exec("DELETE FROM lead_notes WHERE id = ?", [noteId]);
  await log(null, leadId, staff.id, "note_deleted", { note_id: noteId });
}

/* ───────── Add phone (calculator leads with no contact) ───────── */

export const AddPhoneSchema = z.object({ phone: z.string().trim().max(20), name: z.string().trim().max(120).optional() });

export async function addPhone(leadId: number, input: z.infer<typeof AddPhoneSchema>, staff: Staff) {
  const ten = phone10(input.phone);
  if (!ten) throw new HttpError(400, "invalid_phone", "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.");
  const lead = await getLead(leadId, staff);
  if (lead.phone_normalized) throw new HttpError(409, "has_phone", "This lead already has a phone number.");
  await exec("UPDATE leads SET phone = ?, phone_normalized = ?, name = COALESCE(NULLIF(?, ''), name) WHERE id = ?", [ten, ten, input.name ?? "", leadId]);
  await log(null, leadId, staff.id, "field_edited", { field: "phone", from: null, to: "added" });
}

/* ───────── Delete / restore / anonymize (admin) ───────── */

export async function softDelete(leadId: number, staff: Staff) {
  const r = await exec("UPDATE leads SET deleted_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NULL", [leadId]);
  if (!r.affectedRows) throw new HttpError(404, "not_found");
  await log(null, leadId, staff.id, "deleted", null);
}

export async function restore(leadId: number, staff: Staff) {
  const r = await exec("UPDATE leads SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL", [leadId]);
  if (!r.affectedRows) throw new HttpError(404, "not_found");
  await log(null, leadId, staff.id, "restored", null);
}

/** Privacy requests: removes name, phone, message and the raw website payload. Deal data stays for reports. */
export async function anonymize(leadId: number, staff: Staff) {
  const r = await exec(
    "UPDATE leads SET name = NULL, phone = NULL, phone_normalized = NULL, message = NULL, raw = NULL, referrer = NULL, anonymized_at = UTC_TIMESTAMP() WHERE id = ? AND anonymized_at IS NULL",
    [leadId],
  );
  if (!r.affectedRows) throw new HttpError(409, "already_anonymized");
  await log(null, leadId, staff.id, "anonymized", null);
}

/* ───────── Merge ───────── */

export async function mergeCandidates(leadId: number, query: string) {
  const lead = await one<{ phone_normalized: string | null; name: string | null }>("SELECT phone_normalized, name FROM leads WHERE id = ?", [leadId]);
  if (!lead) throw new HttpError(404, "not_found");
  const qs = query.trim();
  const digits = qs.replace(/\D/g, "");
  const ts = /^ts-?0*(\d+)$/i.exec(qs);
  const base = `SELECT l.id, l.lead_no, l.name, l.phone_normalized, l.area, l.status, l.created_at, d.name_en AS district
    FROM leads l LEFT JOIN districts d ON d.id = l.district_id WHERE l.id <> ? AND l.deleted_at IS NULL`;
  if (ts) return q(`${base} AND l.id = ? LIMIT 10`, [leadId, Number(ts[1])]);
  if (digits.length >= 4) return q(`${base} AND l.phone_normalized LIKE ? ORDER BY l.created_at DESC LIMIT 10`, [leadId, `%${digits.slice(-10)}%`]);
  if (qs.length >= 2) return q(`${base} AND l.name LIKE ? ORDER BY l.created_at DESC LIMIT 10`, [leadId, `%${qs.replace(/[\\%_]/g, "\\$&")}%`]);
  // No query: suggest same phone or same name.
  return q(`${base} AND ((l.phone_normalized IS NOT NULL AND l.phone_normalized = ?) OR (l.name IS NOT NULL AND l.name = ?)) ORDER BY l.created_at DESC LIMIT 10`,
    [leadId, lead.phone_normalized ?? "", lead.name ?? ""]);
}

export const MergeSchema = z.object({
  other_id: z.number().int().positive(),
  picks: z.record(z.string(), z.enum(["keep", "other"])).default({}),
});

export async function mergeLeads(keepId: number, otherId: number, picks: Partial<Record<MergeField, MergePick>>, staff: Staff) {
  if (keepId === otherId) throw new HttpError(400, "same_lead");
  return tx(async (conn) => {
    const [rows] = await conn.query("SELECT * FROM leads WHERE id IN (?, ?) FOR UPDATE", [keepId, otherId]);
    const list = rows as Record<string, unknown>[];
    const keep = list.find((r) => r.id === keepId);
    const other = list.find((r) => r.id === otherId);
    if (!keep || !other) throw new HttpError(404, "not_found");
    if (keep.deleted_at || other.deleted_at) throw new HttpError(409, "deleted");

    const updates = mergeUpdates(keep, other, picks);
    if (typeof updates.schemes !== "string" && updates.schemes !== null && updates.schemes !== undefined) updates.schemes = JSON.stringify(updates.schemes);
    const cols = Object.keys(updates);
    if (cols.length) {
      await conn.query(`UPDATE leads SET ${cols.map((c) => `\`${c}\` = ?`).join(", ")} WHERE id = ?`, [...cols.map((c) => updates[c]), keepId]);
    }
    await conn.execute("UPDATE lead_notes SET lead_id = ? WHERE lead_id = ?", [keepId, otherId]);
    await conn.execute("UPDATE lead_activity SET lead_id = ? WHERE lead_id = ?", [keepId, otherId]);
    await conn.execute("UPDATE follow_ups SET lead_id = ? WHERE lead_id = ?", [keepId, otherId]);
    await syncNextFollowUp(conn, keepId);
    await syncNextFollowUp(conn, otherId);
    await conn.execute("UPDATE leads SET deleted_at = UTC_TIMESTAMP() WHERE id = ?", [otherId]);
    await log(conn, keepId, staff.id, "merged", { merged_from: other.lead_no, fields: cols.filter((c) => c !== "phone_normalized") });
    await log(conn, otherId, staff.id, "merged", { merged_into: keep.lead_no });
    return { fields: cols };
  });
}

/* ───────── Export log ───────── */

export async function logExport(leadIds: number[], staff: Staff, filter: string) {
  for (let i = 0; i < leadIds.length; i += 500) {
    const chunk = leadIds.slice(i, i + 500);
    const details = JSON.stringify({ filter: filter.slice(0, 300) });
    await exec(
      `INSERT INTO lead_activity (lead_id, staff_id, action, details) VALUES ${chunk.map(() => "(?, ?, 'exported', ?)").join(", ")}`,
      chunk.flatMap((id) => [id, staff.id, details]),
    );
  }
}
