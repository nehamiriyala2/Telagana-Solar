import { adminRoute, jsonBody } from "@/lib/admin/api";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { InviteSchema, invite, listTeam } from "@/lib/admin/team-service";

export const dynamic = "force-dynamic";

export const GET = adminRoute(ROUTE_PERMS["team.list"], async () => Response.json({ team: await listTeam() }));

/** POST { name, email, role } → adds the person (admin only). There is no public signup. */
export const POST = adminRoute(ROUTE_PERMS["team.invite"], async (req, staff) => {
  const res = await invite(InviteSchema.parse(await jsonBody(req)), staff);
  return Response.json({ ok: true, ...res });
});
