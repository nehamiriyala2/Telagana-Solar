import { adminRoute } from "@/lib/admin/api";
import { audit } from "@/lib/admin/audit";
import { toCsv } from "@/lib/admin/csv";
import { parseOverview } from "@/lib/admin/overview";
import { SECTION_KEYS, cellValue, reportSection, type SectionKey } from "@/lib/admin/reports";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { istDate } from "@/lib/admin/time";

export const dynamic = "force-dynamic";

/** GET ?section=by-source&range=…&test=1 → CSV (admin only, UTF-8 BOM, formula-safe). Logged in admin_audit. */
export const GET = adminRoute(ROUTE_PERMS["reports.export"], async (req, staff) => {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const section = sp.section as SectionKey;
  if (!SECTION_KEYS.includes(section)) return Response.json({ error: "unknown_section" }, { status: 400 });
  const p = parseOverview(sp);
  const s = await reportSection(section, p, staff);
  await audit(staff.id, "report_exported", `report:${section}`, { range: p.range, from: p.from || null, to: p.to || null, test: p.test, rows: s.rows.length });
  return new Response(toCsv(s.columns.map((c) => c.label), s.rows.map((r) => s.columns.map((c) => cellValue(c, r[c.key] ?? null)))), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="telangana-solar-${section}-${istDate(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
