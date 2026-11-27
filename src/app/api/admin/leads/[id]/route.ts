import { adminRoute, jsonBody } from "@/lib/admin/api";
import { PatchSchema, getLead, parseId, patchLead } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";
type P = { id: string };

export const GET = adminRoute<P>(ROUTE_PERMS["leads.get"], async (_req, staff, { id }) =>
  Response.json({ lead: await getLead(parseId(id), staff) }));

/** PATCH status / deal fields. Every change is logged old → new. */
export const PATCH = adminRoute<P>(ROUTE_PERMS["leads.patch"], async (req, staff, { id }) => {
  const input = PatchSchema.parse(await jsonBody(req));
  const res = await patchLead(parseId(id), input, staff);
  return Response.json({ ok: true, ...res });
});
