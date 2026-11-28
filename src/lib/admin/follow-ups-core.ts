import "server-only";
import type { PoolConnection } from "mysql2/promise";

/**
 * Low-level follow-up helpers with no other admin imports (so lead-service can use them without a cycle).
 * leads.next_follow_up always equals the earliest open follow-up; call syncNextFollowUp after any change.
 */
export async function syncNextFollowUp(conn: PoolConnection, leadId: number) {
  await conn.execute(
    `UPDATE leads SET next_follow_up = (
       SELECT MIN(f.due_at) FROM follow_ups f WHERE f.lead_id = ? AND f.status = 'open' AND f.deleted_at IS NULL
     ) WHERE id = ?`,
    [leadId, leadId],
  );
}

/** Cancels a lead's open follow-ups (lead marked Lost). Returns how many were cancelled. */
export async function cancelOpenFollowUps(conn: PoolConnection, leadId: number, staffId: number | null): Promise<number> {
  const [res] = await conn.execute(
    "UPDATE follow_ups SET status = 'cancelled', done_at = UTC_TIMESTAMP(), done_by = ? WHERE lead_id = ? AND status = 'open' AND deleted_at IS NULL",
    [staffId, leadId],
  );
  const n = (res as { affectedRows: number }).affectedRows;
  if (n) {
    await conn.execute("INSERT INTO lead_activity (lead_id, staff_id, action, details) VALUES (?, ?, 'follow_up_cancelled', ?)", [leadId, staffId, JSON.stringify({ count: n, reason: "lost" })]);
    await syncNextFollowUp(conn, leadId);
  }
  return n;
}
