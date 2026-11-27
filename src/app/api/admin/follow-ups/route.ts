import { adminRoute } from "@/lib/admin/api";
import { listFollowUps, parseListFilter, tabCounts } from "@/lib/admin/follow-ups";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { fullIst } from "@/lib/admin/time";

export const dynamic = "force-dynamic";

/** GET ?tab=overdue|today|upcoming|done|none&owner=&test=1 → { counts, rows }. Sales get only their own leads. */
export const GET = adminRoute(ROUTE_PERMS["followups.list"], async (req, staff) => {
  const f = parseListFilter(Object.fromEntries(new URL(req.url).searchParams), staff);
  const [counts, rows] = await Promise.all([tabCounts(f, staff), listFollowUps(f, staff)]);
  return Response.json({ tab: f.tab, counts, rows: rows.map((r) => ({ ...r, due: fullIst(r.due_at), done: r.done_at ? fullIst(r.done_at) : null })) });
});
