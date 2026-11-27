import { adminRoute, jsonBody } from "@/lib/admin/api";
import { parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { UpdateSchema, updateStaff } from "@/lib/admin/team-service";

export const dynamic = "force-dynamic";

/** PATCH { role?, active?, name? }. Self and last-admin protection are enforced on the server. */
export const PATCH = adminRoute<{ id: string }>(ROUTE_PERMS["team.update"], async (req, staff, { id }) => {
  await updateStaff(parseId(id), UpdateSchema.parse(await jsonBody(req)), staff);
  return Response.json({ ok: true });
});
