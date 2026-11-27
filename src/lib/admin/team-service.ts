import "server-only";
import { z } from "zod";
import { site } from "@/config/site";
import { audit } from "./audit";
import { exec, one, q, tx } from "./db";
import { HttpError } from "./lead-service";
import { sendInvite } from "./mail";
import { checkStaffChange, type TeamRole } from "./team-rules";
import type { Staff } from "./auth";

export const ROLES = ["admin", "sales", "content", "installer"] as const;

export type TeamMember = { id: number; name: string; email: string; role: TeamRole; active: number; last_login_at: Date | null; created_at: Date; open_leads: number };

export async function listTeam(): Promise<TeamMember[]> {
  return q<TeamMember>(`SELECT s.id, s.name, s.email, s.role, s.active, s.last_login_at, s.created_at,
      (SELECT COUNT(*) FROM leads l WHERE l.assigned_to = s.id AND l.status NOT IN ('won','lost') AND l.deleted_at IS NULL) AS open_leads
    FROM staff s ORDER BY s.active DESC, FIELD(s.role, 'admin', 'sales', 'content', 'installer'), s.name`);
}

export const InviteSchema = z.object({
  name: z.string().trim().min(2, "Enter their name.").max(120),
  email: z.string().trim().toLowerCase().max(190).email("Enter a valid email."),
  role: z.enum(ROLES),
});

/** Adds a staff member (no public signup). If the email was deactivated before, it is reactivated with the new role. */
export async function invite(input: z.infer<typeof InviteSchema>, actor: Staff) {
  const existing = await one<{ id: number; active: number }>("SELECT id, active FROM staff WHERE email = ?", [input.email]);
  if (existing?.active) throw new HttpError(409, "exists", "This email is already on the team.");
  let id: number;
  if (existing) {
    await exec("UPDATE staff SET name = ?, role = ?, active = 1 WHERE id = ?", [input.name, input.role, existing.id]);
    id = existing.id;
  } else {
    id = (await exec("INSERT INTO staff (name, email, role, active) VALUES (?, ?, ?, 1)", [input.name, input.email, input.role])).insertId;
  }
  await audit(actor.id, "staff_invited", `staff:${id}`, { role: input.role, reactivated: Boolean(existing) });
  const emailed = await sendInvite(input.email, input.name, input.role, site.url);
  return { id, emailed };
}

export const UpdateSchema = z.object({ role: z.enum(ROLES).optional(), active: z.boolean().optional(), name: z.string().trim().min(2).max(120).optional() }).strict();

export async function updateStaff(id: number, change: z.infer<typeof UpdateSchema>, actor: Staff) {
  return tx(async (conn) => {
    const [rows] = await conn.execute("SELECT id, role, active FROM staff WHERE id = ? FOR UPDATE", [id]);
    const target = (rows as { id: number; role: TeamRole; active: number }[])[0];
    if (!target) throw new HttpError(404, "not_found");
    // Lock admin rows so two admins can't demote each other at the same moment.
    const [admins] = await conn.execute("SELECT id FROM staff WHERE role = 'admin' AND active = 1 FOR UPDATE");
    const msg = checkStaffChange(actor.id, { id: target.id, role: target.role, active: Boolean(target.active) }, change, (admins as unknown[]).length);
    if (msg) throw new HttpError(409, "not_allowed", msg);

    if (change.name !== undefined) await conn.execute("UPDATE staff SET name = ? WHERE id = ?", [change.name, id]);
    if (change.role !== undefined && change.role !== target.role) {
      await conn.execute("UPDATE staff SET role = ? WHERE id = ?", [change.role, id]);
      await conn.execute("INSERT INTO admin_audit (staff_id, action, target, details) VALUES (?, 'staff_role_changed', ?, ?)", [actor.id, `staff:${id}`, JSON.stringify({ from: target.role, to: change.role })]);
    }
    if (change.active !== undefined && change.active !== Boolean(target.active)) {
      await conn.execute("UPDATE staff SET active = ? WHERE id = ?", [change.active ? 1 : 0, id]);
      if (!change.active) await conn.execute("DELETE FROM sessions WHERE staff_id = ?", [id]); // signed out everywhere
      await conn.execute("INSERT INTO admin_audit (staff_id, action, target, details) VALUES (?, ?, ?, NULL)", [actor.id, change.active ? "staff_activated" : "staff_deactivated", `staff:${id}`]);
    }
  });
}

export const ReassignSchema = z.object({ to: z.number().int().positive() });

/** Moves every OPEN lead (not won/lost, not deleted) from one staff member to another. Logged on each lead. */
export async function reassignOpenLeads(fromId: number, toId: number, actor: Staff) {
  if (fromId === toId) throw new HttpError(400, "same", "Pick a different person.");
  return tx(async (conn) => {
    const [to] = await conn.execute("SELECT name FROM staff WHERE id = ? AND active = 1 AND role IN ('admin','sales')", [toId]);
    const toRow = (to as { name: string }[])[0];
    if (!toRow) throw new HttpError(400, "invalid_owner", "Leads can only go to an active admin or salesperson.");
    const [fromRows] = await conn.execute("SELECT name FROM staff WHERE id = ?", [fromId]);
    const fromName = (fromRows as { name: string }[])[0]?.name ?? `#${fromId}`;
    const [ids] = await conn.execute("SELECT id FROM leads WHERE assigned_to = ? AND status NOT IN ('won','lost') AND deleted_at IS NULL FOR UPDATE", [fromId]);
    const leadIds = (ids as { id: number }[]).map((r) => r.id);
    if (!leadIds.length) return { moved: 0 };
    await conn.query("UPDATE leads SET assigned_to = ? WHERE id IN (?)", [toId, leadIds]);
    const details = JSON.stringify({ from: fromName, to: toRow.name, bulk: true });
    await conn.query("INSERT INTO lead_activity (lead_id, staff_id, action, details) VALUES ?", [leadIds.map((id) => [id, actor.id, "assigned", details])]);
    await conn.execute("INSERT INTO admin_audit (staff_id, action, target, details) VALUES (?, 'leads_reassigned', ?, ?)", [actor.id, `staff:${fromId}`, JSON.stringify({ to: toId, count: leadIds.length })]);
    return { moved: leadIds.length };
  });
}
