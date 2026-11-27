import { adminRoute } from "@/lib/admin/api";
import { anonymize, parseId } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";

/** Admin only. Clears name, phone and message for privacy requests. Logged on the lead. */
export const POST = adminRoute<{ id: string }>(ROUTE_PERMS["leads.anonymize"], async (_req, staff, { id }) => {
  await anonymize(parseId(id), staff);
  return Response.json({ ok: true });
});
