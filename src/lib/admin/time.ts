/**
 * Asia/Kolkata helpers. India has no daylight saving, so IST is always UTC+05:30.
 * The database stores UTC; these convert at the edges (filters in, labels out).
 */
const IST_MS = 330 * 60_000;

/** "YYYY-MM-DD" of the IST calendar day containing `d`. */
export function istDate(d: Date): string {
  return new Date(d.getTime() + IST_MS).toISOString().slice(0, 10);
}

/** UTC instant of IST midnight at the start of "YYYY-MM-DD". */
export function istMidnightUtc(ymd: string): Date {
  return new Date(Date.parse(`${ymd}T00:00:00.000Z`) - IST_MS);
}

/** Adds whole days to a "YYYY-MM-DD" string. */
export function addDays(ymd: string, n: number): string {
  const t = Date.parse(`${ymd}T00:00:00.000Z`) + n * 86400_000;
  return new Date(t).toISOString().slice(0, 10);
}

export type RangeKey = "today" | "7d" | "30d" | "year" | "custom" | "all";

/**
 * UTC [from, to) for a date range in IST. 7d / 30d include today.
 * Custom uses inclusive IST dates from..to.
 */
export function istRange(range: RangeKey, now = new Date(), from?: string, to?: string): { from: Date | null; to: Date | null } {
  const today = istDate(now);
  const end = istMidnightUtc(addDays(today, 1));
  switch (range) {
    case "today": return { from: istMidnightUtc(today), to: end };
    case "7d": return { from: istMidnightUtc(addDays(today, -6)), to: end };
    case "30d": return { from: istMidnightUtc(addDays(today, -29)), to: end };
    case "year": return { from: istMidnightUtc(`${today.slice(0, 4)}-01-01`), to: end };
    case "custom": {
      const ok = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
      return { from: ok(from) ? istMidnightUtc(from!) : null, to: ok(to) ? istMidnightUtc(addDays(to!, 1)) : null };
    }
    default: return { from: null, to: null };
  }
}

/** "YYYY-MM-DDTHH:mm" (datetime-local, entered in IST) → UTC Date. */
export function istLocalToUtc(local: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const t = Date.parse(`${local}:00.000Z`) - IST_MS;
  return Number.isNaN(t) ? null : new Date(t);
}

/** UTC Date → "YYYY-MM-DDTHH:mm" in IST, for datetime-local inputs. */
export function utcToIstLocal(d: Date | string | null): string {
  if (!d) return "";
  return new Date(new Date(d).getTime() + IST_MS).toISOString().slice(0, 16);
}

const fmtTime = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
const fmtDay = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });
const fmtDayYear = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
const fmtFull = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });

/** "10:42 today" / "Yesterday 18:05" / "12 Nov" / "12 Nov 2025". */
export function receivedLabel(d: Date | string | null, now = new Date()): string {
  if (!d) return "-";
  const at = new Date(d);
  const day = istDate(at);
  const today = istDate(now);
  if (day === today) return `${fmtTime.format(at)} today`;
  if (day === addDays(today, -1)) return `Yesterday ${fmtTime.format(at)}`;
  return day.slice(0, 4) === today.slice(0, 4) ? fmtDay.format(at) : fmtDayYear.format(at);
}

/** "26 Nov 2026, 4:55 pm" in IST. */
export function fullIst(d: Date | string | null): string {
  return d ? fmtFull.format(new Date(d)) : "-";
}

export function dateIst(d: Date | string | null): string {
  return d ? fmtDayYear.format(new Date(d)) : "-";
}
