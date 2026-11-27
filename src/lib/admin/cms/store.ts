import "server-only";
import { revalidatePath } from "next/cache";
import type { PoolConnection } from "mysql2/promise";
import { audit } from "../audit";
import { exec, one, q, tx } from "../db";
import { HttpError } from "../lead-service";
import type { Staff } from "../auth";
import { formSchema, fromRow, toColumns, type FormValues } from "./schema";
import type { CollectionDef } from "./types";
import { bannedPhrase } from "../site-content";

/** Table and column names below come only from the fixed collection definitions, never from input. */
const id = (n: string) => `\`${n.replace(/`/g, "")}\``;

/** After any change the public pages are rebuilt on their next visit. */
export function refreshPublicSite() {
  try { revalidatePath("/", "layout"); } catch { /* outside a request (scripts/tests) */ }
}

export type ListRow = { id: number; title: string; subtitle: string | null; published: boolean; updatedAt: Date | null; slug: string | null; flags: string[]; raw: Record<string, unknown> };

export async function listRows(c: CollectionDef, opts: { q?: string; state?: "all" | "published" | "draft" } = {}): Promise<ListRow[]> {
  const w: string[] = [], p: (string | number)[] = [];
  if (c.hasDeletedAt) w.push("deleted_at IS NULL");
  if (opts.q) {
    const like = `%${opts.q.replace(/[\\%_]/g, "\\$&")}%`;
    w.push(`(${c.search.map((s) => `${id(s)} LIKE ?`).join(" OR ")})`);
    c.search.forEach(() => p.push(like));
  }
  if (opts.state === "published") { w.push(`${id(c.publish.col)} = ?`); p.push(c.publish.on); }
  if (opts.state === "draft") { w.push(`${id(c.publish.col)} <> ?`); p.push(c.publish.on); }
  const rows = await q<Record<string, unknown>>(`SELECT * FROM ${id(c.table)} ${w.length ? `WHERE ${w.join(" AND ")}` : ""} ORDER BY ${c.orderBy} LIMIT 500`, p);
  return rows.map((r) => toListRow(c, r));
}

function toListRow(c: CollectionDef, r: Record<string, unknown>): ListRow {
  const title = String((c.titleIsI18n ? r[`${c.titleKey}_en`] : r[c.titleKey]) ?? "(untitled)");
  const te = c.titleIsI18n ? r[`${c.titleKey}_te`] : r.title_te;
  return {
    id: Number(r.id), title, subtitle: te ? String(te) : null, published: String(r[c.publish.col]) === String(c.publish.on),
    updatedAt: (r.updated_at as Date) ?? null, slug: c.slugKey ? ((r[c.slugKey] as string) ?? null) : null, flags: flagsFor(c, r), raw: r,
  };
}

/** Warnings shown on the list: things staff should fix. */
export function flagsFor(c: CollectionDef, r: Record<string, unknown>, now = Date.now()): string[] {
  const f: string[] = [];
  if (c.key === "schemes") {
    const v = r.last_verified_at ? new Date(r.last_verified_at as string).getTime() : null;
    if (v === null || now - v > 90 * 86400_000) f.push("Needs re-verification");
    if (r.scheme_status && r.scheme_status !== "active") f.push(r.scheme_status === "paused" ? "Paused" : "Closed");
  }
  if (c.key === "projects" && !Number(r.customer_permission)) f.push("No customer permission");
  // English filled in but Telugu left empty (the site then falls back to English).
  const missingTe = c.fields.some((x) => (x.kind === "i18n" || x.kind === "i18nArea") && r[`${x.key}_en`] && !r[`${x.key}_te`])
    || (c.key === "projects" && r.title && !r.title_te);
  if (missingTe) f.push("Telugu missing");
  return f;
}

export async function getRow(c: CollectionDef, rowId: number) {
  const r = await one<Record<string, unknown>>(`SELECT * FROM ${id(c.table)} WHERE id = ?${c.hasDeletedAt ? " AND deleted_at IS NULL" : ""}`, [rowId]);
  if (!r) throw new HttpError(404, "not_found");
  const districtIds = c.key === "schemes" ? (await q<{ district_id: number }>("SELECT district_id FROM scheme_districts WHERE scheme_id = ?", [rowId])).map((d) => d.district_id) : [];
  return { row: r, values: fromRow(c, r, districtIds), published: String(r[c.publish.col]) === String(c.publish.on) };
}

/** Every text value of a form (nested i18n/lines included), for content checks. */
function allText(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(allText);
  if (v && typeof v === "object") return Object.values(v).flatMap(allText);
  return [];
}
function checkCopy(values: FormValues) {
  const bad = bannedPhrase(allText(values));
  if (bad) throw new HttpError(400, "banned_phrase", bad);
}

/** Rules checked before a row can go live. */
function publishBlockers(c: CollectionDef, cols: Record<string, unknown>): string | null {
  if (c.key === "projects" && !Number(cols.customer_permission)) return "Tick “Customer agreed to be shown” before publishing a project.";
  if (c.slugKey && c.publicPath?.includes("{slug}") && !cols[c.slugKey]) return "Add a web address (slug) before publishing.";
  return null;
}

async function saveDistricts(conn: PoolConnection, schemeId: number, d: { all: boolean; ids: number[] }) {
  await conn.execute("UPDATE schemes SET all_districts = ? WHERE id = ?", [d.all ? 1 : 0, schemeId]);
  await conn.execute("DELETE FROM scheme_districts WHERE scheme_id = ?", [schemeId]);
  const ids = d.all ? [] : [...new Set(d.ids)];
  if (ids.length) {
    const [valid] = await conn.query("SELECT id FROM districts WHERE id IN (?)", [ids]);
    if ((valid as unknown[]).length !== ids.length) throw new HttpError(400, "invalid_district", "Pick districts from the list.");
    await conn.query("INSERT INTO scheme_districts (scheme_id, district_id) VALUES ?", [ids.map((x) => [schemeId, x])]);
  }
}

function dupMessage(e: unknown, c: CollectionDef): never {
  if ((e as { code?: string }).code === "ER_DUP_ENTRY") throw new HttpError(409, "duplicate_slug", `Another ${c.label.toLowerCase()} already uses this web address. Change the slug.`);
  throw e;
}

export async function createRow(c: CollectionDef, input: unknown, publish: boolean, staff: Staff): Promise<number> {
  const values = formSchema(c).parse(input) as FormValues;
  checkCopy(values);
  const { cols, districts } = toColumns(c, values);
  if (publish) { const b = publishBlockers(c, cols); if (b) throw new HttpError(400, "cannot_publish", b); }
  cols[c.publish.col] = publish ? c.publish.on : c.publish.off;
  if (c.key === "posts" && publish) cols.published_at = new Date();
  const keys = Object.keys(cols);
  try {
    const newId = await tx(async (conn) => {
      const [res] = await conn.execute(`INSERT INTO ${id(c.table)} (${keys.map(id).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`, keys.map((k) => cols[k] as never));
      const rid = (res as { insertId: number }).insertId;
      if (districts) await saveDistricts(conn, rid, districts);
      return rid;
    });
    await audit(staff.id, `${c.key}_created`, `${c.key}:${newId}`, { published: publish });
    refreshPublicSite();
    return newId;
  } catch (e) { return dupMessage(e, c); }
}

export async function updateRow(c: CollectionDef, rowId: number, input: unknown, staff: Staff): Promise<string[]> {
  const values = formSchema(c).parse(input) as FormValues;
  checkCopy(values);
  const { cols, districts } = toColumns(c, values);
  try {
    const changed = await tx(async (conn) => {
      const [rows] = await conn.execute(`SELECT * FROM ${id(c.table)} WHERE id = ?${c.hasDeletedAt ? " AND deleted_at IS NULL" : ""} FOR UPDATE`, [rowId]);
      const cur = (rows as Record<string, unknown>[])[0];
      if (!cur) throw new HttpError(404, "not_found");
      if (String(cur[c.publish.col]) === String(c.publish.on)) { const b = publishBlockers(c, { ...cur, ...cols }); if (b) throw new HttpError(400, "cannot_publish", b); }
      const norm = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v === null || v === undefined ? "" : String(v));
      const diff = Object.keys(cols).filter((k) => norm(cur[k]) !== norm(cols[k]) && !(typeof cols[k] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(String(cols[k])) && norm(cur[k]).startsWith(String(cols[k]))));
      if (diff.length) await conn.execute(`UPDATE ${id(c.table)} SET ${diff.map((k) => `${id(k)} = ?`).join(", ")} WHERE id = ?`, [...diff.map((k) => cols[k] as never), rowId]);
      if (districts) await saveDistricts(conn, rowId, districts);
      return diff;
    });
    await audit(staff.id, `${c.key}_updated`, `${c.key}:${rowId}`, { fields: [...changed, ...(districts ? ["districts"] : [])] });
    refreshPublicSite();
    return changed;
  } catch (e) { return dupMessage(e, c); }
}

export async function setPublished(c: CollectionDef, rowId: number, publish: boolean, staff: Staff) {
  const cur = await one<Record<string, unknown>>(`SELECT * FROM ${id(c.table)} WHERE id = ?${c.hasDeletedAt ? " AND deleted_at IS NULL" : ""}`, [rowId]);
  if (!cur) throw new HttpError(404, "not_found");
  if (publish) { const b = publishBlockers(c, cur); if (b) throw new HttpError(400, "cannot_publish", b); }
  const extra = c.key === "posts" && publish && !cur.published_at ? ", published_at = UTC_TIMESTAMP()" : "";
  await exec(`UPDATE ${id(c.table)} SET ${id(c.publish.col)} = ?${extra} WHERE id = ?`, [publish ? c.publish.on : c.publish.off, rowId]);
  await audit(staff.id, publish ? `${c.key}_published` : `${c.key}_unpublished`, `${c.key}:${rowId}`);
  refreshPublicSite();
}

/** Soft delete: the row is hidden everywhere but kept in the database. */
export async function deleteRow(c: CollectionDef, rowId: number, staff: Staff) {
  if (!c.hasDeletedAt) throw new HttpError(400, "not_supported");
  const r = await exec(`UPDATE ${id(c.table)} SET deleted_at = UTC_TIMESTAMP(), ${id(c.publish.col)} = ? WHERE id = ? AND deleted_at IS NULL`, [c.publish.off, rowId]);
  if (!r.affectedRows) throw new HttpError(404, "not_found");
  await audit(staff.id, `${c.key}_deleted`, `${c.key}:${rowId}`);
  refreshPublicSite();
}
