import { adminRoute } from "@/lib/admin/api";
import { toCsv } from "@/lib/admin/csv";
import { LOST_LABEL, SOURCE_LABEL, type LeadStatus, type LostReason } from "@/lib/admin/labels";
import { schemeName } from "@/lib/admin/scheme-names";
import { logExport } from "@/lib/admin/lead-service";
import { filterToParams, listLeads, parseFilter, parseSchemes } from "@/lib/admin/leads-query";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { fullIst, istDate } from "@/lib/admin/time";
import { loadStages } from "@/lib/admin/stages-store";
import { stageLabels } from "@/lib/admin/stages";

export const dynamic = "force-dynamic";

const yn = (v: number | null) => (v === null || v === undefined ? "" : v ? "Yes" : "No");
const ymd = (v: string | Date | null) => (v ? (v instanceof Date ? v.toISOString() : String(v)).slice(0, 10) : "");

/** GET /api/admin/leads/export?…filters → CSV of every matching lead (admin only). Logged on each lead. */
export const GET = adminRoute(ROUTE_PERMS["leads.export"], async (req, staff) => {
  const f = parseFilter(Object.fromEntries(new URL(req.url).searchParams));
  const [{ rows }, stages] = await Promise.all([listLeads(f, staff, { all: true }), loadStages()]);
  const labels = stageLabels(stages);
  const headers = [
    "Lead no", "Received (IST)", "Source", "Name", "Phone", "Alternate phone", "Email", "District", "District (Telugu)", "DISCOM", "Area", "Address", "Place", "Property type",
    "Bill (₹/month)", "Units/month", "Power cuts", "Roof", "Roof area (sq ft)", "kW (website)", "System type", "Monthly saving shown (₹)", "Schemes",
    "Message", "Language", "Page", "UTM source", "UTM campaign", "Referrer", "Status", "Lost reason", "Owner", "Next follow-up (IST)",
    "Site visit (IST)", "Final kW", "Quote (₹)", "Final amount (₹)", "Subsidy applied", "Loan needed", "Won at (IST)", "Install date", "Test data", "Deleted",
  ];
  const data = rows.map((l) => [
    l.lead_no, fullIst(l.created_at), SOURCE_LABEL[l.source ?? ""] ?? l.source, l.name, l.phone_normalized ?? l.phone,
    l.alt_phone_normalized, l.email, l.district_en, l.district_te, l.discom, l.area, l.address, l.place, l.use_type, l.bill, l.units, yn(l.power_cuts), l.roof, l.roof_area_sqft,
    l.kw === null ? "" : Number(l.kw), l.system_type, l.monthly_saving, parseSchemes(l.schemes).map(schemeName).join("; "),
    l.message, l.lang, l.page, l.utm_source, l.utm_campaign, l.referrer, labels[l.status as LeadStatus] ?? l.status,
    l.lost_reason ? LOST_LABEL[l.lost_reason as LostReason] : "", l.owner_name ? `${l.owner_name}${l.owner_active ? "" : " (inactive)"}` : "",
    l.next_follow_up ? fullIst(l.next_follow_up) : "", l.site_visit_at ? fullIst(l.site_visit_at) : "",
    l.final_kw === null ? "" : Number(l.final_kw), l.quote_amount, l.final_amount, yn(l.subsidy_applied), yn(l.loan_needed),
    l.won_at ? fullIst(l.won_at) : "", ymd(l.install_date), l.is_test ? "Yes" : "", l.deleted_at ? "Yes" : "",
  ]);
  await logExport(rows.map((r) => r.id), staff, filterToParams(f).toString());
  return new Response(toCsv(headers, data), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="telangana-solar-leads-${istDate(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
