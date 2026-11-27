import { adminRoute, jsonBody } from "@/lib/admin/api";
import { NewFollowUpSchema, createFollowUp, leadFollowUps } from "@/lib/admin/follow-ups";
import { getLead, parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { fullIst } from "@/lib/admin/time";

export const dynamic = "force-dynamic";
type P = { id: string };

/** GET → this lead's follow-ups (open first). */
export const GET = adminRoute<P>(ROUTE_PERMS["leads.get"], async (_req, staff, { id }) => {
  const leadId = parseId(id);
  await getLead(leadId, staff);
  const rows = await leadFollowUps(leadId);
  return Response.json({ followUps: rows.map((r) => ({ ...r, due: fullIst(r.due_at), done: r.done_at ? fullIst(r.done_at) : null })) });
});

/** POST { due: "YYYY-MM-DDTHH:mm" (IST), type: call | whatsapp | visit, note? } → new follow-up. Logged. */
export const POST = adminRoute<P>(ROUTE_PERMS["leads.followUp"], async (req, staff, { id }) => {
  const input = NewFollowUpSchema.parse(await jsonBody(req));
  const fid = await createFollowUp(parseId(id), input, staff);
  return Response.json({ ok: true, id: fid }, { status: 201 });
});
