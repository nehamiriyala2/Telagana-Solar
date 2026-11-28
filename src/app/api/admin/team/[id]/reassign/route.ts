import { adminRoute, jsonBody } from "@/lib/admin/api";
import { parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { ReassignSchema, reassignOpenLeads } from "@/lib/admin/team-service";

export const dynamic = "force-dynamic";

/** POST { to } → moves all open leads of this person to another active admin/salesperson. */
export const POST = adminRoute<{ id: string }>(ROUTE_PERMS["team.reassign"], async (req, staff, { id }) => {
  const { to } = ReassignSchema.parse(await jsonBody(req));
  return Response.json({ ok: true, ...(await reassignOpenLeads(parseId(id), to, staff)) });
});
