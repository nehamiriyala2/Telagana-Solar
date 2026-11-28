import { adminRoute, jsonBody } from "@/lib/admin/api";
import { CreateSchema, createLead } from "@/lib/admin/lead-service";
import { listLeads, parseFilter } from "@/lib/admin/leads-query";
import { overLimit } from "@/lib/admin/rate-limit";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";

export const dynamic = "force-dynamic";

/** GET /api/admin/leads?…filters → { rows, total, page } (50 per page). Sales get only their own leads. */
export const GET = adminRoute(ROUTE_PERMS["leads.list"], async (req, staff) => {
  const f = parseFilter(Object.fromEntries(new URL(req.url).searchParams));
  const { rows, total } = await listLeads(f, staff);
  return Response.json({ rows, total, page: f.page });
});

/**
 * POST /api/admin/leads → add a lead by hand (phone call, WhatsApp, referral, walk-in).
 * 409 { error: "duplicate", matches } when the phone already exists; resend with allow_duplicate: true to save anyway.
 */
export const POST = adminRoute(ROUTE_PERMS["leads.create"], async (req, staff) => {
  if (await overLimit("lead-create-staff", String(staff.id), 120, 3600)) {
    return Response.json({ error: "rate_limited", message: "Too many leads added in the last hour. Try again later." }, { status: 429 });
  }
  const input = CreateSchema.parse(await jsonBody(req));
  const res = await createLead(input, staff);
  return Response.json({ ok: true, ...res }, { status: 201 });
});
