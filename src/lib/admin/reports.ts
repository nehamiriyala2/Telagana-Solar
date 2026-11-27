import "server-only";
import { q } from "./db";
import { conversion, durationLabel } from "./kpi";
import { BILL_RANGES, LOST_LABEL, SOURCE_LABEL, USE_LABEL, type LostReason } from "./labels";
import { rangeWhere, type OverviewParams } from "./overview";
import type { Role } from "./roles";
import { istRange } from "./time";

export type Col = { key: string; label: string; kind?: "num" | "pct" | "kw" | "inr" | "text" };
export type Section = { key: string; title: string; note?: string; columns: Col[]; rows: Record<string, string | number | null>[]; chart: { type: "bar" | "donut"; labelKey: string; valueKey: string } };

export const SECTION_KEYS = ["by-source", "by-district", "by-discom", "by-staff", "lost-reasons", "monthly-won", "by-bill", "by-use"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

type Staff = { id: number; role: Role };
const n = (v: unknown) => Number(v ?? 0);
const kw = (v: unknown) => Math.round(n(v) * 10) / 10;

/**
 * Report sections. All use the Leads table filter (same range + test toggle, leads received in the range),
 * so each "Leads" number equals the Leads list for the same filters. Exception: "Monthly won" counts by the
 * date the lead was WON (won_at) within the range, because that is what a sales month means.
 */
export async function reportSection(key: SectionKey, p: OverviewParams, staff: Staff): Promise<Section> {
  const w = rangeWhere(p, staff);
  const outcome = `COUNT(*) AS leads, SUM(l.status <> 'new' OR l.first_contacted_at IS NOT NULL) AS contacted,
    SUM(l.status IN ('site_visit','quote_sent','won')) AS visits, SUM(l.status = 'won') AS won,
    SUM(CASE WHEN l.status = 'won' THEN COALESCE(l.final_kw, l.kw, 0) ELSE 0 END) AS won_kw`;
  const leadCols: Col[] = [
    { key: "leads", label: "Leads", kind: "num" }, { key: "won", label: "Won", kind: "num" },
    { key: "conversion", label: "Conversion", kind: "pct" }, { key: "won_kw", label: "Won kW", kind: "kw" },
  ];
  const withRates = (rows: Record<string, unknown>[], label: (r: Record<string, unknown>) => string) =>
    rows.map((r) => ({ name: label(r), leads: n(r.leads), contacted: n(r.contacted), visits: n(r.visits), won: n(r.won), conversion: conversion(n(r.won), n(r.leads)), won_kw: kw(r.won_kw) }));

  switch (key) {
    case "by-source": {
      const rows = await q(`SELECT l.source AS k, ${outcome} FROM leads l ${w.sql} GROUP BY l.source ORDER BY leads DESC`, w.params as never[]);
      return { key, title: "Conversion by source", columns: [{ key: "name", label: "Source" }, { key: "leads", label: "Leads", kind: "num" }, { key: "contacted", label: "Contacted", kind: "num" }, { key: "visits", label: "Site visit+", kind: "num" }, ...leadCols.slice(1)],
        rows: withRates(rows, (r) => SOURCE_LABEL[String(r.k)] ?? String(r.k ?? "Unknown")), chart: { type: "bar", labelKey: "name", valueKey: "leads" } };
    }
    case "by-district": {
      // All 33 districts (zeros included) + leads without a district.
      const on = w.sql.replace(/^WHERE /, "");
      const rows = await q(`SELECT d.name_en AS k, d.discom, COUNT(l.id) AS leads, SUM(l.status = 'won') AS won,
          SUM(CASE WHEN l.status = 'won' THEN COALESCE(l.final_kw, l.kw, 0) ELSE 0 END) AS won_kw
        FROM districts d LEFT JOIN leads l ON l.district_id = d.id AND ${on} GROUP BY d.id ORDER BY leads DESC, d.name_en`, w.params as never[]);
      const [none] = await q(`SELECT ${outcome} FROM leads l ${w.sql} AND l.district_id IS NULL`, w.params as never[]);
      const list = withRates(rows, (r) => String(r.k)).map((r, i) => ({ ...r, discom: String(rows[i].discom) }));
      if (n(none?.leads)) list.push({ ...withRates([none], () => "District not given")[0], discom: "-" });
      return { key, title: "By district", note: "All 33 districts, busiest first.", columns: [{ key: "name", label: "District" }, { key: "discom", label: "DISCOM", kind: "text" }, ...leadCols],
        rows: list, chart: { type: "bar", labelKey: "name", valueKey: "leads" } };
    }
    case "by-discom": {
      const rows = await q(`SELECT COALESCE(d.discom, 'Not given') AS k, ${outcome} FROM leads l LEFT JOIN districts d ON d.id = l.district_id ${w.sql} GROUP BY k ORDER BY leads DESC`, w.params as never[]);
      return { key, title: "By DISCOM", columns: [{ key: "name", label: "DISCOM" }, ...leadCols], rows: withRates(rows, (r) => String(r.k)), chart: { type: "donut", labelKey: "name", valueKey: "leads" } };
    }
    case "by-staff": {
      const rows = await q(`SELECT COALESCE(s.name, 'Unassigned') AS k, s.active, ${outcome},
          AVG(CASE WHEN l.first_contacted_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, l.created_at, l.first_contacted_at) END) * 1000 AS avg_ms
        FROM leads l LEFT JOIN staff s ON s.id = l.assigned_to ${w.sql} GROUP BY l.assigned_to ORDER BY leads DESC`, w.params as never[]);
      return { key, title: "By staff", note: "Leads are counted for their current owner.", columns: [
        { key: "name", label: "Owner" }, { key: "leads", label: "Assigned", kind: "num" }, { key: "contacted", label: "Contacted", kind: "num" },
        { key: "visits", label: "Site visits", kind: "num" }, { key: "won", label: "Won", kind: "num" }, { key: "first_response", label: "Avg first response", kind: "text" },
      ], rows: withRates(rows, (r) => `${r.k}${r.k !== "Unassigned" && !n(r.active) ? " (inactive)" : ""}`).map((r, i) => ({ ...r, first_response: rows[i].avg_ms === null ? "-" : durationLabel(n(rows[i].avg_ms)) })),
        chart: { type: "bar", labelKey: "name", valueKey: "won" } };
    }
    case "lost-reasons": {
      const rows = await q<{ k: string | null; c: number }>(`SELECT l.lost_reason AS k, COUNT(*) AS c FROM leads l ${w.sql} AND l.status = 'lost' GROUP BY l.lost_reason ORDER BY c DESC`, w.params as never[]);
      const total = rows.reduce((s, r) => s + n(r.c), 0);
      return { key, title: "Lost reasons", columns: [{ key: "name", label: "Reason" }, { key: "count", label: "Leads", kind: "num" }, { key: "share", label: "Share", kind: "pct" }],
        rows: rows.map((r) => ({ name: r.k ? LOST_LABEL[r.k as LostReason] ?? r.k : "Not given", count: n(r.c), share: conversion(n(r.c), total) })), chart: { type: "donut", labelKey: "name", valueKey: "count" } };
    }
    case "monthly-won": {
      const r = istRange(p.range, new Date(), p.from, p.to);
      const base = rangeWhere({ ...p, range: "custom", from: "", to: "" }, staff); // same filter, no created_at range
      const params = [...base.params, ...(r.from ? [r.from] : []), ...(r.to ? [r.to] : [])];
      const rows = await q<{ k: string; c: number; kw: string | null; rupees: string | null }>(
        `SELECT DATE_FORMAT(l.won_at + INTERVAL 330 MINUTE, '%Y-%m') AS k, COUNT(*) AS c, SUM(COALESCE(l.final_kw, l.kw, 0)) AS kw, SUM(COALESCE(l.quote_amount, 0)) AS rupees
         FROM leads l ${base.sql} AND l.status = 'won' AND l.won_at IS NOT NULL ${r.from ? "AND l.won_at >= ?" : ""} ${r.to ? "AND l.won_at < ?" : ""}
         GROUP BY k ORDER BY k`, params as never[]);
      const label = (ym: string) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
      return { key, title: "Monthly won kW and ₹", note: "By the month the lead was marked Won (IST), within the selected range. ₹ is the quote amount.",
        columns: [{ key: "name", label: "Month" }, { key: "won", label: "Won", kind: "num" }, { key: "won_kw", label: "kW", kind: "kw" }, { key: "rupees", label: "₹ (quotes)", kind: "inr" }],
        rows: rows.map((x) => ({ name: label(x.k), won: n(x.c), won_kw: kw(x.kw), rupees: n(x.rupees) })), chart: { type: "bar", labelKey: "name", valueKey: "won_kw" } };
    }
    case "by-bill": {
      const rows = await q(`SELECT CASE WHEN l.bill IS NULL THEN 'none' WHEN l.bill < 2000 THEN 'lt2k' WHEN l.bill < 5000 THEN '2-5k' WHEN l.bill < 10000 THEN '5-10k' ELSE '10k+' END AS k, ${outcome}
        FROM leads l ${w.sql} GROUP BY k`, w.params as never[]);
      const order = [...BILL_RANGES.map((b) => b.key as string), "none"];
      rows.sort((a, b) => order.indexOf(String(a.k)) - order.indexOf(String(b.k)));
      return { key, title: "Leads by bill range", columns: [{ key: "name", label: "Monthly bill" }, ...leadCols],
        rows: withRates(rows, (r) => BILL_RANGES.find((b) => b.key === r.k)?.label ?? "Not given"), chart: { type: "bar", labelKey: "name", valueKey: "leads" } };
    }
    case "by-use": {
      const rows = await q(`SELECT l.use_type AS k, ${outcome} FROM leads l ${w.sql} GROUP BY l.use_type ORDER BY leads DESC`, w.params as never[]);
      return { key, title: "Leads by use", columns: [{ key: "name", label: "Use" }, ...leadCols], rows: withRates(rows, (r) => USE_LABEL[String(r.k)] ?? "Not given"), chart: { type: "donut", labelKey: "name", valueKey: "leads" } };
    }
  }
}

/** Plain cell text for CSV (numbers stay numbers). */
export function cellValue(col: Col, v: string | number | null) {
  if (v === null || v === undefined) return "";
  if (col.kind === "pct") return `${v}%`;
  return v;
}
