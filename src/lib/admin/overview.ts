import "server-only";
import { q } from "./db";
import { conversion, pctChange, pipelineTotals, previousPeriod } from "./kpi";
import { buildWhere, parseFilter } from "./leads-query";
import type { Role } from "./roles";
import { istRange, type RangeKey } from "./time";

export type OverviewRange = Exclude<RangeKey, "all">;
export interface OverviewParams { range: OverviewRange; from: string; to: string; test: boolean }

export function parseOverview(sp: Record<string, string | string[] | undefined>): OverviewParams {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const r = one(sp.range);
  return {
    range: (["today", "7d", "30d", "year", "custom"].includes(r) ? r : "30d") as OverviewRange,
    from: one(sp.from), to: one(sp.to), test: one(sp.test) === "1",
  };
}

type Staff = { id: number; role: Role };

/**
 * Same WHERE as the Leads table (All leads tab) for the same range + test toggle,
 * so every number here can be checked against /admin/leads with the same filters.
 */
function where(p: OverviewParams, staff: Staff, override?: { from: Date; to: Date }) {
  const f = parseFilter({ range: p.range, from: p.from, to: p.to, test: p.test ? "1" : "" });
  const w = buildWhere(override ? { ...f, range: "all" } : f, staff);
  if (!override) return w;
  const and = w.sql ? `${w.sql} AND` : "WHERE";
  return { sql: `${and} l.created_at >= ? AND l.created_at < ?`, params: [...w.params, override.from, override.to] };
}

const group = async (sql: string, params: unknown[]) =>
  (await q<{ k: string | null; n: number }>(sql, params as never[])).map((r) => ({ k: r.k ?? "Unknown", n: Number(r.n) }));

export async function overviewData(p: OverviewParams, staff: Staff) {
  const range = istRange(p.range, new Date(), p.from, p.to);
  const w = where(p, staff);
  const prev = range.from && range.to ? previousPeriod(range.from, range.to) : null;
  const pw = prev ? where(p, staff, prev) : null;

  const [totals] = await q<{ all_: number; not_called: number; oldest_new: Date | null; visits: number; won: number; avg_ms: number | null }>(
    `SELECT COUNT(*) AS all_,
       SUM(l.status = 'new') AS not_called,
       MIN(CASE WHEN l.status = 'new' THEN l.created_at END) AS oldest_new,
       SUM(l.status IN ('site_visit','quote_sent','won')) AS visits,
       SUM(l.status = 'won') AS won,
       AVG(CASE WHEN l.first_contacted_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, l.created_at, l.first_contacted_at) END) * 1000 AS avg_ms
     FROM leads l ${w.sql}`, w.params);
  const prevAll = pw ? Number((await q<{ n: number }>(`SELECT COUNT(*) AS n FROM leads l ${pw.sql}`, pw.params))[0].n) : null;
  const pipeRows = await q<{ status: string; final_kw: string | null; kw: string | null; quote_amount: number | null }>(
    `SELECT l.status, l.final_kw, l.kw, l.quote_amount FROM leads l ${w.sql} AND l.status IN ('site_visit','quote_sent')`, w.params);

  const all = Number(totals.all_);
  const won = Number(totals.won ?? 0);

  const istDay = "DATE(l.created_at + INTERVAL 330 MINUTE)";
  const [perDay, bySource, byDistrict, byDiscom, byUse, bySystem, byLang, byPage, funnel] = await Promise.all([
    group(`SELECT ${istDay} AS k, COUNT(*) AS n FROM leads l ${w.sql} GROUP BY k ORDER BY k`, w.params),
    group(`SELECT l.source AS k, COUNT(*) AS n FROM leads l ${w.sql} GROUP BY k ORDER BY n DESC`, w.params),
    group(`SELECT d.name_en AS k, COUNT(*) AS n FROM leads l JOIN districts d ON d.id = l.district_id ${w.sql} GROUP BY d.id ORDER BY n DESC, k LIMIT 10`, w.params),
    group(`SELECT COALESCE(d.discom, 'Not set') AS k, COUNT(*) AS n FROM leads l LEFT JOIN districts d ON d.id = l.district_id ${w.sql} GROUP BY k ORDER BY n DESC`, w.params),
    group(`SELECT l.use_type AS k, COUNT(*) AS n FROM leads l ${w.sql} GROUP BY k ORDER BY n DESC`, w.params),
    group(`SELECT l.system_type AS k, COUNT(*) AS n FROM leads l ${w.sql} GROUP BY k ORDER BY n DESC`, w.params),
    group(`SELECT l.lang AS k, COUNT(*) AS n FROM leads l ${w.sql} GROUP BY k ORDER BY n DESC`, w.params),
    group(`SELECT l.page AS k, COUNT(*) AS n FROM leads l ${w.sql} GROUP BY k ORDER BY n DESC LIMIT 8`, w.params),
    q<{ contacted: number; visit: number; quote: number; won: number }>(
      `SELECT SUM(l.status <> 'new' OR l.first_contacted_at IS NOT NULL) AS contacted,
              SUM(l.status IN ('site_visit','quote_sent','won') OR l.site_visit_at IS NOT NULL) AS visit,
              SUM(l.status IN ('quote_sent','won') OR l.quote_amount IS NOT NULL) AS quote,
              SUM(l.status = 'won') AS won
       FROM leads l ${w.sql}`, w.params),
  ]);

  const f = funnel[0];
  return {
    range,
    kpi: {
      newLeads: all, newLeadsChange: prevAll === null ? null : pctChange(all, prevAll), prevAll,
      notCalled: Number(totals.not_called ?? 0), oldestNew: totals.oldest_new,
      siteVisits: Number(totals.visits ?? 0),
      won, conversion: conversion(won, all),
      pipeline: pipelineTotals(pipeRows),
      avgFirstResponseMs: totals.avg_ms === null ? null : Number(totals.avg_ms),
    },
    charts: {
      perDay: fillDays(perDay, range.from, range.to),
      bySource, byDistrict, byDiscom, byUse, bySystem, byLang, byPage,
      funnel: [
        { k: "New", n: all }, { k: "Contacted", n: Number(f.contacted ?? 0) }, { k: "Site visit", n: Number(f.visit ?? 0) },
        { k: "Quote", n: Number(f.quote ?? 0) }, { k: "Won", n: Number(f.won ?? 0) },
      ],
    },
  };
}

/** Every IST day in the range, with 0 for days without leads (max 400 days). */
function fillDays(rows: { k: string; n: number }[], from: Date | null, to: Date | null) {
  const key = (k: unknown) => (k instanceof Date ? k.toISOString() : String(k)).slice(0, 10);
  const map = new Map(rows.map((r) => [key(r.k), r.n]));
  if (!from || !to) return rows.map((r) => ({ k: key(r.k), n: r.n }));
  const out: { k: string; n: number }[] = [];
  for (let t = from.getTime() + 330 * 60_000, i = 0; t < to.getTime() + 330 * 60_000 && i < 400; t += 86400_000, i++) {
    const day = new Date(t).toISOString().slice(0, 10);
    out.push({ k: day, n: map.get(day) ?? 0 });
  }
  return out;
}

/** Current problems, independent of the date range. */
export async function needsAttention(staff: Staff, test: boolean) {
  const base = `l.deleted_at IS NULL ${test ? "" : "AND l.is_test = 0"} AND NOT (l.phone_normalized IS NULL AND l.anonymized_at IS NULL)`;
  const cols = "l.id, l.lead_no, l.name, l.status, l.created_at, l.next_follow_up, d.name_en AS district, s.name AS owner";
  const from = "FROM leads l LEFT JOIN districts d ON d.id = l.district_id LEFT JOIN staff s ON s.id = l.assigned_to";
  type Row = { id: number; lead_no: string; name: string | null; status: string; created_at: Date; next_follow_up: Date | null; district: string | null; owner: string | null };
  const [stale, overdue, noRoof] = await Promise.all([
    q<Row>(`SELECT ${cols} ${from} WHERE ${base} AND l.status = 'new' AND l.created_at < UTC_TIMESTAMP() - INTERVAL 2 HOUR ORDER BY l.created_at LIMIT 10`),
    q<Row>(`SELECT ${cols} ${from} WHERE ${base} AND l.next_follow_up < UTC_TIMESTAMP() AND l.status NOT IN ('won','lost') ORDER BY l.next_follow_up LIMIT 10`),
    q<Row>(`SELECT ${cols} ${from} WHERE ${base} AND l.roof = 'none' AND l.status NOT IN ('won','lost') ORDER BY l.created_at DESC LIMIT 10`),
  ]);
  void staff;
  return { stale, overdue, noRoof };
}

/** Same filter as the Leads table for a range + test toggle (used by Reports). */
export const rangeWhere = where;
