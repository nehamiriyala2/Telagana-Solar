import "server-only";
import { z } from "zod";
import { one, q, tx } from "./db";
import { FU_OUTCOMES, FU_TYPES } from "./labels";
import { HttpError, getLead } from "./lead-service";
import { syncNextFollowUp } from "./follow-ups-core";
import { ownLeadsOnly } from "./roles";
import { addDays, istDate, istLocalToUtc, istMidnightUtc } from "./time";
import type { Staff } from "./auth";

/* ───────── Validation ───────── */

const localDt = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Pick a date and time.");
const note = z.string().max(1000).transform((s) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 500) || null);

export const NewFollowUpSchema = z.object({ due: localDt, type: z.enum(FU_TYPES, { message: "Pick call, WhatsApp or visit." }).default("call"), note: note.optional() }).strict();

export const UpdateFollowUpSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("done"), outcome: z.enum(FU_OUTCOMES, { message: "Pick what happened." }), outcome_note: note.optional(),
    /** Optional next follow-up created in the same step. */
    next: NewFollowUpSchema.optional(),
  }).strict(),
  z.object({ action: z.literal("reschedule"), due: localDt }).strict(),
  z.object({ action: z.literal("edit"), type: z.enum(FU_TYPES).optional(), note: note.optional(), due: localDt.optional() }).strict(),
]);

/** IST "YYYY-MM-DDTHH:mm" → UTC, or 400. Allows up to 1 year back (catch-up logging) and 2 years ahead. */
function dueUtc(local: string): Date {
  const d = istLocalToUtc(local);
  if (!d) throw new HttpError(400, "invalid_date", "Pick a valid date and time.");
  const now = Date.now();
  if (d.getTime() < now - 365 * 86400_000 || d.getTime() > now + 2 * 365 * 86400_000) throw new HttpError(400, "invalid_date", "Pick a date within the next two years.");
  return d;
}

type FuRow = { id: number; lead_id: number; due_at: Date; type: string; note: string | null; status: string; deleted_at: Date | null };

/** A follow-up the staff member may change (via its lead's access rules), or 404. */
async function getFollowUp(id: number, staff: Staff): Promise<FuRow> {
  const f = await one<FuRow>("SELECT id, lead_id, due_at, type, note, status, deleted_at FROM follow_ups WHERE id = ?", [id]);
  if (!f || f.deleted_at) throw new HttpError(404, "not_found");
  const lead = await getLead(f.lead_id, staff);
  if (lead.deleted_at) throw new HttpError(409, "deleted", "This lead is deleted. Restore it first.");
  return f;
}

const logSql = "INSERT INTO lead_activity (lead_id, staff_id, action, details) VALUES (?, ?, ?, ?)";

/* ───────── Actions ───────── */

export async function createFollowUp(leadId: number, input: z.infer<typeof NewFollowUpSchema>, staff: Staff): Promise<number> {
  const lead = await getLead(leadId, staff);
  if (lead.deleted_at) throw new HttpError(409, "deleted", "This lead is deleted. Restore it first.");
  const due = dueUtc(input.due);
  return tx(async (conn) => {
    const [res] = await conn.execute("INSERT INTO follow_ups (lead_id, due_at, type, note, created_by) VALUES (?, ?, ?, ?, ?)",
      [leadId, due, input.type, input.note ?? null, staff.id]);
    const id = (res as { insertId: number }).insertId;
    await conn.execute(logSql, [leadId, staff.id, "follow_up_added", JSON.stringify({ follow_up_id: id, type: input.type, due: due.toISOString() })]);
    await syncNextFollowUp(conn, leadId);
    return id;
  });
}

export async function updateFollowUp(id: number, input: z.infer<typeof UpdateFollowUpSchema>, staff: Staff): Promise<{ nextId?: number }> {
  const f = await getFollowUp(id, staff);
  const nextDue = input.action === "done" && input.next ? dueUtc(input.next.due) : null;
  const due = input.action === "reschedule" ? dueUtc(input.due) : input.action === "edit" && input.due ? dueUtc(input.due) : null;

  return tx(async (conn) => {
    const [locked] = await conn.execute("SELECT status FROM follow_ups WHERE id = ? FOR UPDATE", [id]);
    const status = (locked as { status: string }[])[0]?.status;
    if (status !== "open") throw new HttpError(409, "not_open", "This follow-up is already done.");
    let nextId: number | undefined;

    if (input.action === "done") {
      await conn.execute("UPDATE follow_ups SET status = 'done', outcome = ?, outcome_note = ?, done_at = UTC_TIMESTAMP(), done_by = ? WHERE id = ?",
        [input.outcome, input.outcome_note ?? null, staff.id, id]);
      await conn.execute(logSql, [f.lead_id, staff.id, "follow_up_done", JSON.stringify({ follow_up_id: id, type: f.type, outcome: input.outcome })]);
      // A done call / WhatsApp counts as first contact (response-time reports).
      await conn.execute("UPDATE leads SET first_contacted_at = UTC_TIMESTAMP() WHERE id = ? AND first_contacted_at IS NULL", [f.lead_id]);
      if (input.next && nextDue) {
        const [res] = await conn.execute("INSERT INTO follow_ups (lead_id, due_at, type, note, created_by) VALUES (?, ?, ?, ?, ?)",
          [f.lead_id, nextDue, input.next.type, input.next.note ?? null, staff.id]);
        nextId = (res as { insertId: number }).insertId;
        await conn.execute(logSql, [f.lead_id, staff.id, "follow_up_added", JSON.stringify({ follow_up_id: nextId, type: input.next.type, due: nextDue.toISOString() })]);
      }
    } else if (input.action === "reschedule" && due) {
      await conn.execute("UPDATE follow_ups SET due_at = ? WHERE id = ?", [due, id]);
      await conn.execute(logSql, [f.lead_id, staff.id, "follow_up_rescheduled", JSON.stringify({ follow_up_id: id, from: new Date(f.due_at).toISOString(), to: due.toISOString() })]);
    } else if (input.action === "edit") {
      const set: string[] = [], params: (string | Date | null)[] = [];
      if (input.type && input.type !== f.type) { set.push("type = ?"); params.push(input.type); }
      if (input.note !== undefined && input.note !== f.note) { set.push("note = ?"); params.push(input.note); }
      if (due && due.getTime() !== new Date(f.due_at).getTime()) { set.push("due_at = ?"); params.push(due); }
      if (set.length) {
        await conn.execute(`UPDATE follow_ups SET ${set.join(", ")} WHERE id = ?`, [...params, id]);
        await conn.execute(logSql, [f.lead_id, staff.id, "follow_up_edited", JSON.stringify({ follow_up_id: id, ...(due ? { to: due.toISOString() } : {}), ...(input.type ? { type: input.type } : {}) })]);
      }
    }
    await syncNextFollowUp(conn, f.lead_id);
    return { nextId };
  });
}

/** Soft delete (a follow-up added by mistake). */
export async function deleteFollowUp(id: number, staff: Staff) {
  const f = await getFollowUp(id, staff);
  await tx(async (conn) => {
    await conn.execute("UPDATE follow_ups SET deleted_at = UTC_TIMESTAMP() WHERE id = ?", [id]);
    await conn.execute(logSql, [f.lead_id, staff.id, "follow_up_deleted", JSON.stringify({ follow_up_id: id, type: f.type, due: new Date(f.due_at).toISOString() })]);
    await syncNextFollowUp(conn, f.lead_id);
  });
}

/* ───────── Lists ───────── */

export const TABS = ["overdue", "today", "upcoming", "done", "none"] as const;
export type Tab = (typeof TABS)[number];
export type ListFilter = { tab: Tab; owner: string; test: boolean };

export function parseListFilter(sp: Record<string, string | undefined>, staff: Pick<Staff, "role">): ListFilter {
  const tab = (TABS as readonly string[]).includes(sp.tab ?? "") ? (sp.tab as Tab) : "today";
  const raw = sp.owner ?? (sp.mine === "1" ? "me" : "");
  return { tab, owner: ownLeadsOnly(staff.role) ? "me" : /^(\d+|none|me)$/.test(raw) ? raw : "", test: sp.test === "1" };
}

/** WHERE on the lead (l) shared by every tab: access, owner filter, test data. */
function leadWhere(f: ListFilter, staff: Pick<Staff, "id" | "role">) {
  const w = ["l.deleted_at IS NULL"], p: (string | number | Date)[] = [];
  if (!f.test) w.push("l.is_test = 0");
  const owner = ownLeadsOnly(staff.role) ? "me" : f.owner;
  if (owner === "me") { w.push("l.assigned_to = ?"); p.push(staff.id); }
  else if (owner === "none") w.push("l.assigned_to IS NULL");
  else if (owner) { w.push("l.assigned_to = ?"); p.push(Number(owner)); }
  return { w, p };
}

/** IST day boundaries: start of today and of tomorrow, as UTC. */
export function dayBounds(now = new Date()) {
  const today = istDate(now);
  return { start: istMidnightUtc(today), end: istMidnightUtc(addDays(today, 1)) };
}

export type FollowUpItem = {
  id: number; lead_id: number; due_at: Date; type: string; note: string | null; status: string; outcome: string | null;
  outcome_note: string | null; done_at: Date | null; done_by_name: string | null;
  lead_no: string; name: string | null; phone_normalized: string | null; lead_status: string; area: string | null;
  district: string | null; owner_id: number | null; owner: string | null; owner_active: number | null; lang: string | null;
  kw: string | null; created_at: Date;
};

const ITEM_SELECT = `SELECT f.id, f.lead_id, f.due_at, f.type, f.note, f.status, f.outcome, f.outcome_note, f.done_at, db.name AS done_by_name,
    l.lead_no, l.name, l.phone_normalized, l.status AS lead_status, l.area, d.name_en AS district, l.assigned_to AS owner_id,
    s.name AS owner, s.active AS owner_active, l.lang, COALESCE(l.final_kw, l.kw) AS kw, l.created_at
  FROM follow_ups f JOIN leads l ON l.id = f.lead_id
  LEFT JOIN districts d ON d.id = l.district_id LEFT JOIN staff s ON s.id = l.assigned_to LEFT JOIN staff db ON db.id = f.done_by`;

/** Counts for the tab badges (same rules as the lists). */
export async function tabCounts(f: ListFilter, staff: Pick<Staff, "id" | "role">, now = new Date()) {
  const { w, p } = leadWhere(f, staff);
  const { end } = dayBounds(now);
  const [row] = await q<{ overdue: number; today: number; upcoming: number; done: number }>(
    `SELECT
       SUM(f.status = 'open' AND f.due_at < ?) AS overdue,
       SUM(f.status = 'open' AND f.due_at >= ? AND f.due_at < ?) AS today,
       SUM(f.status = 'open' AND f.due_at >= ?) AS upcoming,
       SUM(f.status = 'done' AND f.done_at >= ?) AS done
     FROM follow_ups f JOIN leads l ON l.id = f.lead_id WHERE f.deleted_at IS NULL AND ${w.join(" AND ")}`,
    [now, now, end, end, istMidnightUtc(addDays(istDate(now), -29)), ...p],
  );
  const [none] = await q<{ n: number }>(
    `SELECT COUNT(*) AS n FROM leads l WHERE ${w.join(" AND ")} AND l.status NOT IN ('won','lost')
       AND NOT (l.phone_normalized IS NULL AND l.anonymized_at IS NULL)
       AND NOT EXISTS (SELECT 1 FROM follow_ups f WHERE f.lead_id = l.id AND f.status = 'open' AND f.deleted_at IS NULL)`, p);
  return { overdue: Number(row?.overdue ?? 0), today: Number(row?.today ?? 0), upcoming: Number(row?.upcoming ?? 0), done: Number(row?.done ?? 0), none: Number(none?.n ?? 0) };
}

/**
 * One tab of the follow-up list.
 * Overdue: open, before now. Today: open, from now to IST midnight. Upcoming: open, from tomorrow.
 * Done: done in the last 30 days, newest first. None: open leads with no open follow-up (lead rows, id = 0).
 */
export async function listFollowUps(f: ListFilter, staff: Pick<Staff, "id" | "role">, now = new Date()): Promise<FollowUpItem[]> {
  const { w, p } = leadWhere(f, staff);
  const { end } = dayBounds(now);
  const base = `f.deleted_at IS NULL AND ${w.join(" AND ")}`;
  switch (f.tab) {
    case "overdue": return q<FollowUpItem>(`${ITEM_SELECT} WHERE ${base} AND f.status = 'open' AND f.due_at < ? ORDER BY f.due_at LIMIT 500`, [...p, now]);
    case "today": return q<FollowUpItem>(`${ITEM_SELECT} WHERE ${base} AND f.status = 'open' AND f.due_at >= ? AND f.due_at < ? ORDER BY f.due_at LIMIT 500`, [...p, now, end]);
    case "upcoming": return q<FollowUpItem>(`${ITEM_SELECT} WHERE ${base} AND f.status = 'open' AND f.due_at >= ? ORDER BY f.due_at LIMIT 500`, [...p, end]);
    case "done": return q<FollowUpItem>(`${ITEM_SELECT} WHERE ${base} AND f.status = 'done' AND f.done_at >= ? ORDER BY f.done_at DESC LIMIT 300`, [...p, istMidnightUtc(addDays(istDate(now), -29))]);
    case "none": return q<FollowUpItem>(
      `SELECT 0 AS id, l.id AS lead_id, l.created_at AS due_at, 'call' AS type, NULL AS note, 'none' AS status, NULL AS outcome, NULL AS outcome_note,
         NULL AS done_at, NULL AS done_by_name, l.lead_no, l.name, l.phone_normalized, l.status AS lead_status, l.area, d.name_en AS district,
         l.assigned_to AS owner_id, s.name AS owner, s.active AS owner_active, l.lang, COALESCE(l.final_kw, l.kw) AS kw, l.created_at
       FROM leads l LEFT JOIN districts d ON d.id = l.district_id LEFT JOIN staff s ON s.id = l.assigned_to
       WHERE ${w.join(" AND ")} AND l.status NOT IN ('won','lost') AND NOT (l.phone_normalized IS NULL AND l.anonymized_at IS NULL)
         AND NOT EXISTS (SELECT 1 FROM follow_ups f WHERE f.lead_id = l.id AND f.status = 'open' AND f.deleted_at IS NULL)
       ORDER BY l.created_at DESC LIMIT 500`, p);
  }
}

/** A lead's follow-ups for its page: open first (soonest), then done/cancelled (newest). */
export async function leadFollowUps(leadId: number) {
  return q<{ id: number; due_at: Date; type: string; note: string | null; status: string; outcome: string | null; outcome_note: string | null; done_at: Date | null; done_by_name: string | null; created_by_name: string | null }>(
    `SELECT f.id, f.due_at, f.type, f.note, f.status, f.outcome, f.outcome_note, f.done_at, db.name AS done_by_name, cb.name AS created_by_name
     FROM follow_ups f LEFT JOIN staff db ON db.id = f.done_by LEFT JOIN staff cb ON cb.id = f.created_by
     WHERE f.lead_id = ? AND f.deleted_at IS NULL
     ORDER BY f.status = 'open' DESC, CASE WHEN f.status = 'open' THEN f.due_at END ASC, f.done_at DESC LIMIT 100`, [leadId]);
}
