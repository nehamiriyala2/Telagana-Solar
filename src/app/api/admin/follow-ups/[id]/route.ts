import { adminRoute, jsonBody } from "@/lib/admin/api";
import { UpdateFollowUpSchema, deleteFollowUp, updateFollowUp } from "@/lib/admin/follow-ups";
import { parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";
type P = { id: string };

/**
 * PATCH one of:
 *   { action: "done", outcome, outcome_note?, next?: { due, type, note? } }  — mark done, optionally book the next one
 *   { action: "reschedule", due }
 *   { action: "edit", type?, note?, due? }
 * Every change is logged on the lead's timeline.
 */
export const PATCH = adminRoute<P>(ROUTE_PERMS["followups.update"], async (req, staff, { id }) => {
  const input = UpdateFollowUpSchema.parse(await jsonBody(req));
  return Response.json({ ok: true, ...(await updateFollowUp(parseId(id), input, staff)) });
});

/** DELETE → soft delete (added by mistake). Logged. */
export const DELETE = adminRoute<P>(ROUTE_PERMS["followups.update"], async (_req, staff, { id }) => {
  await deleteFollowUp(parseId(id), staff);
  return Response.json({ ok: true });
});
