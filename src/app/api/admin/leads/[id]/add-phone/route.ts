import { adminRoute, jsonBody } from "@/lib/admin/api";
import { AddPhoneSchema, addPhone, parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";

/** Calculator leads with no contact: add a 10-digit phone → the lead moves to All leads. */
export const POST = adminRoute<{ id: string }>(ROUTE_PERMS["leads.addPhone"], async (req, staff, { id }) => {
  await addPhone(parseId(id), AddPhoneSchema.parse(await jsonBody(req)), staff);
  return Response.json({ ok: true });
});
