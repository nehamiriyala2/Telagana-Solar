import { adminRoute, jsonBody } from "@/lib/admin/api";
import { can } from "@/lib/admin/roles";
import { BulkSchema, bulkUpdate } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";

/**
 * POST { action: "status", ids, status, lost_reason? } or { action: "assign", ids, assigned_to } (admin only).
 * Each lead is updated and logged on its own timeline; a summary goes to the audit log.
 */
export const POST = adminRoute(ROUTE_PERMS["leads.bulkStatus"], async (req, staff) => {
  const input = BulkSchema.parse(await jsonBody(req));
  if (input.action === "assign" && !can(staff.role, ROUTE_PERMS["leads.bulkAssign"])) {
    return Response.json({ error: "forbidden", message: "Only admins can assign leads in bulk." }, { status: 403 });
  }
  return Response.json({ ok: true, ...(await bulkUpdate(input, staff)) });
});
