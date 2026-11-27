import { adminRoute } from "@/lib/admin/api";
import { parseId, softDelete } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";

/** Admin only. Soft delete (restorable), logged on the lead. */
export const POST = adminRoute<{ id: string }>(ROUTE_PERMS["leads.delete"], async (_req, staff, { id }) => {
  await softDelete(parseId(id), staff);
  return Response.json({ ok: true });
});
