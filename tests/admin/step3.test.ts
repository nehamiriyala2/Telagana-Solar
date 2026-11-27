import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { conversion, dueLabel, durationLabel, followUpBucket, followUpTemplate, pctChange, pipelineTotals, previousPeriod, snoozeTarget } from "@/lib/admin/kpi";
import { istRange } from "@/lib/admin/time";

describe("KPI maths", () => {
  it("% change vs previous period", () => {
    expect(pctChange(15, 10)).toBe(50);
    expect(pctChange(5, 10)).toBe(-50);
    expect(pctChange(1, 3)).toBe(-66.7);
    expect(pctChange(0, 0)).toBe(0);
    expect(pctChange(4, 0)).toBeNull(); // nothing to compare with
  });
  it("conversion = won ÷ all leads", () => {
    expect(conversion(3, 30)).toBe(10);
    expect(conversion(1, 3)).toBe(33.3);
    expect(conversion(0, 0)).toBe(0);
  });
  it("pipeline sums only site visit + quote sent, final kW first", () => {
    expect(pipelineTotals([
      { status: "site_visit", final_kw: "5", kw: "3", quote_amount: 250000 },
      { status: "quote_sent", final_kw: null, kw: "3.5", quote_amount: "180000" },
      { status: "won", final_kw: "10", kw: null, quote_amount: 500000 },
      { status: "new", final_kw: null, kw: "2", quote_amount: null },
    ])).toEqual({ count: 2, kw: 8.5, rupees: 430000 });
  });
  it("previous period has the same length", () => {
    const r = istRange("7d", new Date("2026-11-26T08:00:00Z"));
    const p = previousPeriod(r.from!, r.to!);
    expect(p.to.toISOString()).toBe(r.from!.toISOString());
    expect(r.to!.getTime() - r.from!.getTime()).toBe(p.to.getTime() - p.from.getTime());
    expect(p.from.toISOString()).toBe("2026-11-12T18:30:00.000Z"); // 13 Nov 00:00 IST
  });
  it("this year starts on 1 Jan IST", () => expect(istRange("year", new Date("2026-03-01T00:00:00Z")).from?.toISOString()).toBe("2025-12-31T18:30:00.000Z"));
  it("labels durations and due times", () => {
    expect(durationLabel(45 * 60_000)).toBe("45 min");
    expect(durationLabel(190 * 60_000)).toBe("3 h 10 min");
    expect(durationLabel(52 * 3600_000)).toBe("2 d 4 h");
    const now = new Date("2026-11-26T10:00:00Z");
    expect(dueLabel(new Date("2026-11-25T18:00:00Z"), now)).toBe("16h overdue");
    expect(dueLabel(new Date("2026-11-26T13:00:00Z"), now)).toBe("in 3h");
  });
});

describe("follow-up buckets (IST)", () => {
  const now = new Date("2026-11-26T12:00:00Z"); // 17:30 IST
  it("splits overdue / today / this week / later", () => {
    expect(followUpBucket(new Date("2026-11-26T11:59:00Z"), now)).toBe("overdue");
    expect(followUpBucket(new Date("2026-11-26T18:29:00Z"), now)).toBe("today"); // 23:59 IST
    expect(followUpBucket(new Date("2026-11-26T18:30:00Z"), now)).toBe("week");  // 00:00 IST tomorrow
    expect(followUpBucket(new Date("2026-12-03T18:29:00Z"), now)).toBe("week");
    expect(followUpBucket(new Date("2026-12-03T18:30:00Z"), now)).toBe("later");
    expect(followUpBucket(null, now)).toBe("none");
  });
  it("snooze keeps the time of day, else 10:00 IST", () => {
    expect(snoozeTarget(1, "2026-11-25T16:00", now)).toBe("2026-11-27T16:00");
    expect(snoozeTarget(3, null, now)).toBe("2026-11-29T10:00");
    expect(snoozeTarget(1, null, new Date("2026-11-26T19:00:00Z"))).toBe("2026-11-28T10:00"); // already 27 Nov in IST
  });
  it("picks the follow-up template by lead age", () => {
    expect(followUpTemplate(new Date("2026-11-25T12:00:00Z"), now)).toBe("day1");
    expect(followUpTemplate(new Date("2026-11-22T12:00:00Z"), now)).toBe("day3");
    expect(followUpTemplate(new Date("2026-11-10T12:00:00Z"), now)).toBe("day7");
  });
});

/* ───── MySQL integration (XAMPP). Skips when the database is not reachable. ───── */

const dbUp = await (async () => {
  if (!process.env.DB_NAME) return false;
  try { const { one } = await import("@/lib/admin/db"); await one("SELECT 1"); return true; } catch { return false; }
})();

describe.skipIf(!dbUp)("status changes and follow-ups write to MySQL", async () => {
  const { exec, one, q, pool } = await import("@/lib/admin/db");
  const { patchLead } = await import("@/lib/admin/lead-service");
  let leadId = 0, fuA = 0, fuB = 0;
  let staff = { id: 0, name: "Vitest", email: "vitest@example.com", role: "admin" as const };

  beforeAll(async () => {
    await exec("INSERT INTO staff (name, email, role, active) VALUES ('Vitest', 'vitest@example.com', 'admin', 1) ON DUPLICATE KEY UPDATE active = 1");
    staff = { ...staff, id: (await one<{ id: number }>("SELECT id FROM staff WHERE email = 'vitest@example.com'"))!.id };
    const r = await exec("INSERT INTO leads (name, phone_normalized, source, status, is_test) VALUES ('Vitest lead', '9000099999', 'contact', 'new', 1)");
    leadId = r.insertId;
  });
  afterAll(async () => {
    await exec("DELETE FROM leads WHERE id = ?", [leadId]);
    await exec("DELETE FROM staff WHERE email = 'vitest@example.com'");
    await pool().end();
  });

  it("a drag (status change) logs status_changed and sets first contact", async () => {
    await patchLead(leadId, { status: "site_visit" }, staff);
    const log = await q<{ details: string }>("SELECT details FROM lead_activity WHERE lead_id = ? AND action = 'status_changed'", [leadId]);
    expect(log).toHaveLength(1);
    expect(JSON.parse(String(log[0].details))).toEqual({ from: "new", to: "site_visit" });
    expect((await one<{ fc: Date | null }>("SELECT first_contacted_at AS fc FROM leads WHERE id = ?", [leadId]))!.fc).not.toBeNull();
  });

  it("lost needs a reason; won needs kW, amount and subsidy, then sets won_at", async () => {
    await expect(patchLead(leadId, { status: "lost" }, staff)).rejects.toMatchObject({ code: "lost_reason_required" });
    await expect(patchLead(leadId, { status: "won" }, staff)).rejects.toMatchObject({ code: "won_details_required" });
    await patchLead(leadId, { status: "won", final_kw: 3, final_amount: 165000, subsidy_applied: true }, staff);
    expect((await one<{ w: Date | null }>("SELECT won_at AS w FROM leads WHERE id = ?", [leadId]))!.w).not.toBeNull();
    await patchLead(leadId, { status: "contacted" }, staff);
  });

  it("booking follow-ups keeps next_follow_up = the earliest open one (IST → UTC) and logs it", async () => {
    const { createFollowUp } = await import("@/lib/admin/follow-ups");
    fuA = await createFollowUp(leadId, { due: "2026-12-05T10:00", type: "call" }, staff);
    fuB = await createFollowUp(leadId, { due: "2026-12-01T10:00", type: "whatsapp", note: "Send brochure" }, staff);
    const row = await one<{ f: Date }>("SELECT next_follow_up AS f FROM leads WHERE id = ?", [leadId]);
    expect(new Date(row!.f).toISOString()).toBe("2026-12-01T04:30:00.000Z");
    const added = await q<{ details: string }>("SELECT details FROM lead_activity WHERE lead_id = ? AND action = 'follow_up_added'", [leadId]);
    expect(added).toHaveLength(2);
    expect(String(added[1].details)).not.toContain("brochure"); // notes stay on the follow-up, not in the log
  });

  it("done saves the outcome, can book the next one, and moves next_follow_up on", async () => {
    const { updateFollowUp } = await import("@/lib/admin/follow-ups");
    const r = await updateFollowUp(fuB, { action: "done", outcome: "call_back", outcome_note: "Busy, call Friday", next: { due: "2026-12-04T17:00", type: "call" } }, staff);
    expect(r.nextId).toBeGreaterThan(0);
    const done = await one<{ status: string; outcome: string; outcome_note: string; done_by: number }>("SELECT status, outcome, outcome_note, done_by FROM follow_ups WHERE id = ?", [fuB]);
    expect(done).toMatchObject({ status: "done", outcome: "call_back", outcome_note: "Busy, call Friday", done_by: staff.id });
    const row = await one<{ f: Date }>("SELECT next_follow_up AS f FROM leads WHERE id = ?", [leadId]);
    expect(new Date(row!.f).toISOString()).toBe("2026-12-04T11:30:00.000Z");
    await expect(updateFollowUp(fuB, { action: "reschedule", due: "2026-12-09T10:00" }, staff)).rejects.toMatchObject({ code: "not_open" });
  });

  it("reschedule and delete recalculate next_follow_up", async () => {
    const { deleteFollowUp, updateFollowUp } = await import("@/lib/admin/follow-ups");
    await updateFollowUp(fuA, { action: "reschedule", due: "2026-12-02T09:00" }, staff);
    expect(new Date((await one<{ f: Date }>("SELECT next_follow_up AS f FROM leads WHERE id = ?", [leadId]))!.f).toISOString()).toBe("2026-12-02T03:30:00.000Z");
    await deleteFollowUp(fuA, staff);
    expect(new Date((await one<{ f: Date }>("SELECT next_follow_up AS f FROM leads WHERE id = ?", [leadId]))!.f).toISOString()).toBe("2026-12-04T11:30:00.000Z");
  });

  it("tabs put follow-ups in the right IST bucket", async () => {
    const { tabCounts } = await import("@/lib/admin/follow-ups");
    const now = new Date("2026-12-04T06:00:00Z"); // 11:30 IST; the open one is due 17:00 IST the same day
    const c = await tabCounts({ tab: "today", owner: "", test: true }, staff, now);
    const mine = await q<{ n: number }>("SELECT COUNT(*) AS n FROM follow_ups WHERE lead_id = ? AND status = 'open' AND deleted_at IS NULL", [leadId]);
    expect(Number(mine[0].n)).toBe(1);
    expect(c.today).toBeGreaterThanOrEqual(1);
  });

  it("marking the lead lost cancels its open follow-ups", async () => {
    await patchLead(leadId, { status: "lost", lost_reason: "price" }, staff);
    expect((await one<{ f: Date | null }>("SELECT next_follow_up AS f FROM leads WHERE id = ?", [leadId]))!.f).toBeNull();
    expect((await one<{ n: number }>("SELECT COUNT(*) AS n FROM follow_ups WHERE lead_id = ? AND status = 'open' AND deleted_at IS NULL", [leadId]))!.n).toBe(0);
    expect((await one<{ action: string }>("SELECT action FROM lead_activity WHERE lead_id = ? ORDER BY id DESC LIMIT 1", [leadId]))!.action).toBe("follow_up_cancelled");
  });
});
