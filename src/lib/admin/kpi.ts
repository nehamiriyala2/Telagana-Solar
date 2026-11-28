/** Pure KPI maths (tested). */
import { addDays, istDate, istMidnightUtc } from "./time";

/** % change vs the previous period. null when there is nothing to compare with. */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** won ÷ all leads, as a percentage with one decimal. */
export function conversion(won: number, all: number): number {
  return all ? Math.round((won / all) * 1000) / 10 : 0;
}

/** The period of the same length that ends where [from, to) starts. */
export function previousPeriod(from: Date, to: Date): { from: Date; to: Date } {
  const len = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - len), to: new Date(from) };
}

/** Pipeline totals for leads at site visit or quote stage. kW uses final_kw, else the website kW. */
export function pipelineTotals(rows: { status: string; final_kw: number | string | null; kw: number | string | null; quote_amount: number | string | null }[]) {
  let kw = 0, rupees = 0, count = 0;
  for (const r of rows) {
    if (r.status !== "site_visit" && r.status !== "quote_sent") continue;
    count++;
    kw += Number(r.final_kw ?? r.kw ?? 0) || 0;
    rupees += Number(r.quote_amount ?? 0) || 0;
  }
  return { count, kw: Math.round(kw * 10) / 10, rupees };
}

/** "45 min", "3 h 10 min", "2 d 4 h". */
export function durationLabel(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "-";
  const min = Math.max(0, Math.round(ms / 60_000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h${min % 60 ? ` ${min % 60} min` : ""}`;
  const d = Math.floor(h / 24);
  return `${d} d${h % 24 ? ` ${h % 24} h` : ""}`;
}

/** "16h overdue", "in 3h", "2d overdue". */
export function dueLabel(due: Date, now = new Date()): string {
  const diff = due.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const unit = abs < 3600_000 ? `${Math.max(1, Math.round(abs / 60_000))}m` : abs < 86400_000 ? `${Math.round(abs / 3600_000)}h` : `${Math.round(abs / 86400_000)}d`;
  return diff < 0 ? `${unit} overdue` : `in ${unit}`;
}

/** Follow-up buckets in IST: overdue (before now), today, this week (next 7 days), later. */
export function followUpBucket(due: Date | null, now = new Date()): "overdue" | "today" | "week" | "later" | "none" {
  if (!due) return "none";
  if (due.getTime() < now.getTime()) return "overdue";
  const today = istDate(now);
  if (due.getTime() < istMidnightUtc(addDays(today, 1)).getTime()) return "today";
  if (due.getTime() < istMidnightUtc(addDays(today, 8)).getTime()) return "week";
  return "later";
}

/**
 * Snooze: +N days from today (IST), keeping the follow-up's time of day (10:00 IST if none).
 * Returns "YYYY-MM-DDTHH:mm" in IST for the API.
 */
export function snoozeTarget(days: number, currentLocal: string | null, now = new Date()): string {
  const time = currentLocal && /T\d{2}:\d{2}$/.test(currentLocal) ? currentLocal.slice(11, 16) : "10:00";
  return `${addDays(istDate(now), days)}T${time}`;
}

/** Follow-up template by how long ago the lead came in. */
export function followUpTemplate(createdAt: Date, now = new Date()): "day1" | "day3" | "day7" {
  const days = (now.getTime() - createdAt.getTime()) / 86400_000;
  return days < 2 ? "day1" : days < 5 ? "day3" : "day7";
}

/** "YYYY-MM" of a moment in IST (e.g. 30 Nov 20:00 UTC is already December in India). */
export function istMonth(d: Date): string {
  return new Date(d.getTime() + 330 * 60_000).toISOString().slice(0, 7);
}

/** Bill range key for a monthly bill (matches the Leads filter). */
export function billBucket(bill: number | null | undefined): "lt2k" | "2-5k" | "5-10k" | "10k+" | null {
  if (bill === null || bill === undefined) return null;
  return bill < 2000 ? "lt2k" : bill < 5000 ? "2-5k" : bill < 10000 ? "5-10k" : "10k+";
}
