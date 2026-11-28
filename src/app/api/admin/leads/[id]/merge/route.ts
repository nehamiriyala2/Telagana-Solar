import { adminRoute, jsonBody } from "@/lib/admin/api";
import { MergeSchema, getLead, mergeCandidates, mergeLeads, parseId } from "@/lib/admin/lead-service";
import { MERGE_FIELDS, type MergeField } from "@/lib/admin/merge";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";
type P = { id: string };

/** GET ?q= → possible duplicates; ?other=<id> → both leads for the side-by-side preview. */
export const GET = adminRoute<P>(ROUTE_PERMS["leads.merge.search"], async (req, staff, { id }) => {
  const url = new URL(req.url);
  const other = url.searchParams.get("other");
  if (other) return Response.json({ keep: await getLead(parseId(id), staff), other: await getLead(parseId(other), staff) });
  return Response.json({ candidates: await mergeCandidates(parseId(id), (url.searchParams.get("q") ?? "").slice(0, 80)) });
});

export const POST = adminRoute<P>(ROUTE_PERMS["leads.merge"], async (req, staff, { id }) => {
  const { other_id, picks } = MergeSchema.parse(await jsonBody(req));
  const allowed = new Set<string>(MERGE_FIELDS.map(([f]) => f));
  const clean = Object.fromEntries(Object.entries(picks).filter(([k]) => allowed.has(k))) as Partial<Record<MergeField, "keep" | "other">>;
  return Response.json({ ok: true, ...(await mergeLeads(parseId(id), other_id, clean, staff)) });
});
