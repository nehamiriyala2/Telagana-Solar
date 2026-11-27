import "server-only";
import { one } from "./db";
import { ownLeadsOnly, type Role } from "./roles";

/** Sidebar badges. Real leads only (test data excluded), deleted leads excluded. Sales count only their own leads. */
export async function sidebarCounts(staff: { id: number; role: Role }): Promise<{ newLeads: number; overdue: number } | null> {
  try {
    const own = ownLeadsOnly(staff.role);
    // Overdue = open follow-ups due before now (same rule as the Follow-ups page "Overdue" tab).
    const row = await one<{ newLeads: number; overdue: number }>(
      `SELECT
         (SELECT COUNT(*) FROM leads WHERE status = 'new' AND deleted_at IS NULL AND is_test = 0${own ? " AND assigned_to = ?" : ""}) AS newLeads,
         (SELECT COUNT(*) FROM follow_ups f JOIN leads l ON l.id = f.lead_id
           WHERE f.status = 'open' AND f.deleted_at IS NULL AND f.due_at < UTC_TIMESTAMP() AND l.deleted_at IS NULL AND l.is_test = 0${own ? " AND l.assigned_to = ?" : ""}) AS overdue`,
      own ? [staff.id, staff.id] : [],
    );
    return { newLeads: Number(row?.newLeads ?? 0), overdue: Number(row?.overdue ?? 0) };
  } catch {
    return null;
  }
}
