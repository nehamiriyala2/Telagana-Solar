import { adminRoute } from "@/lib/admin/api";
import { parseId, restore } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";

/** Admin only. Logged on the lead. */
export const POST = adminRoute<{ id: string }>(ROUTE_PERMS["leads.restore"], async (_req, staff, { id }) => {
  await restore(parseId(id), staff);
  return Response.json({ ok: true });
});
