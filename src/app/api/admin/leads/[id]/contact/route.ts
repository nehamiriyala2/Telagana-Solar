import { adminRoute, jsonBody } from "@/lib/admin/api";
import { ContactLogSchema, logContact, parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";

/** POST { channel: "call" | "whatsapp", template? } when staff tap Call / WhatsApp. Logged on the timeline. */
export const POST = adminRoute<{ id: string }>(ROUTE_PERMS["leads.contactLog"], async (req, staff, { id }) => {
  await logContact(parseId(id), ContactLogSchema.parse(await jsonBody(req)), staff);
  return Response.json({ ok: true });
});
