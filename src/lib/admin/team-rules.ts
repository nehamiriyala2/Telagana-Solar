/**
 * Team safety rules (pure, tested). The API enforces these; the UI only mirrors them.
 *  - Nobody can change their own role or deactivate themselves.
 *  - The last active admin can never be demoted or deactivated.
 */
export type TeamRole = "admin" | "sales" | "installer" | "content";
export type StaffChange = { role?: TeamRole; active?: boolean };

export function checkStaffChange(
  actorId: number,
  target: { id: number; role: TeamRole; active: boolean },
  change: StaffChange,
  activeAdmins: number,
): string | null {
  const demoting = change.role !== undefined && change.role !== "admin" && target.role === "admin";
  const deactivating = change.active === false && target.active;
  if (target.id === actorId && (change.role !== undefined && change.role !== target.role)) return "You can’t change your own role. Ask another admin.";
  if (target.id === actorId && deactivating) return "You can’t deactivate yourself. Ask another admin.";
  if (target.role === "admin" && target.active && (demoting || deactivating) && activeAdmins <= 1) {
    return "This is the last active admin. Make someone else an admin first.";
  }
  return null;
}
