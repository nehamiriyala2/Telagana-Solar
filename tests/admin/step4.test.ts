import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { csvCell } from "@/lib/admin/csv";
import { billBucket, istMonth } from "@/lib/admin/kpi";
import { BILL_RANGES } from "@/lib/admin/labels";
import { buildWhere, parseFilter } from "@/lib/admin/leads-query";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { can, type Role } from "@/lib/admin/roles";
import { validateSettings } from "@/lib/admin/settings-schema";
import { checkStaffChange } from "@/lib/admin/team-rules";
import { renderTemplate, unknownVars } from "@/lib/admin/templates";

describe("route permissions (Step 4)", () => {
  const routes = ["reports.view", "reports.export", "team.list", "team.invite", "team.update", "team.reassign", "settings.save", "settings.history", "settings.restore", "templates.list", "templates.save", "districts.update"] as const;
  const allowed = (role: Role) => routes.filter((r) => can(role, ROUTE_PERMS[r]));
  it("admin: all", () => expect(allowed("admin")).toEqual([...routes]));
  it("sales: read reports and templates only", () => expect(allowed("sales")).toEqual(["reports.view", "templates.list"]));
  it("installer: none", () => expect(allowed("installer")).toEqual([]));
});

describe("team rules", () => {
  const admin = (id: number, active = true) => ({ id, role: "admin" as const, active });
  it("nobody can change their own role or deactivate themselves", () => {
    expect(checkStaffChange(1, admin(1), { role: "sales" }, 3)).toMatch(/own role/);
    expect(checkStaffChange(1, admin(1), { active: false }, 3)).toMatch(/deactivate yourself/);
    expect(checkStaffChange(1, admin(1), { role: "admin", active: true }, 1)).toBeNull(); // no-op on yourself is fine
  });
  it("the last active admin can't be demoted or deactivated", () => {
    expect(checkStaffChange(1, admin(2), { role: "sales" }, 1)).toMatch(/last active admin/);
    expect(checkStaffChange(1, admin(2), { active: false }, 1)).toMatch(/last active admin/);
    expect(checkStaffChange(1, admin(2), { role: "sales" }, 2)).toBeNull();
  });
  it("other changes are allowed", () => {
    expect(checkStaffChange(1, { id: 5, role: "sales", active: true }, { role: "installer" }, 1)).toBeNull();
    expect(checkStaffChange(1, { id: 5, role: "sales", active: false }, { active: true }, 1)).toBeNull();
    expect(checkStaffChange(1, admin(2, false), { role: "sales" }, 1)).toBeNull(); // inactive admin is not "the last active"
  });
});

describe("templates", () => {
  it("renders Telugu with variables", () => expect(renderTemplate("నమస్కారం {name} గారు, {district}", { name: "రమేష్", district: "వరంగల్" })).toBe("నమస్కారం రమేష్ గారు, వరంగల్"));
  it("blocks unknown variables, including typos and empty braces", () => expect(unknownVars("Hi {nam} {} {kw} { name}")).toEqual(["nam", ""]));
});

describe("settings validation", () => {
  it("accepts good values", () => expect(validateSettings({ phone: "9876543210", email: "a@b.in", map_link: "", alert_recipients: ["x@y.in"], social_links: { facebook: "https://fb.com/x" } }).ok).toBe(true));
  it("rejects +91, bad emails, bad links, unknown keys", () => {
    const r = validateSettings({ phone: "+919876543210", whatsapp: "12345", email: "nope", map_link: "maps.google.com", alert_recipients: ["ok@x.in", "bad"], hacker: 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["alert_recipients", "email", "hacker", "map_link", "phone", "whatsapp"]);
  });
  it("requires the business name", () => expect(validateSettings({ business_name: "  " }).ok).toBe(false));
});

describe("report maths", () => {
  it("months are IST months", () => {
    expect(istMonth(new Date("2026-11-30T18:29:00Z"))).toBe("2026-11");
    expect(istMonth(new Date("2026-11-30T18:30:00Z"))).toBe("2026-12");
  });
  it("bill buckets match the Leads bill filter", () => {
    for (const bill of [0, 1999, 2000, 4999, 5000, 9999, 10000, 50000]) {
      const key = billBucket(bill)!;
      const r = BILL_RANGES.find((b) => b.key === key)!;
      expect(bill >= r.min && (r.max === null || bill <= r.max)).toBe(true);
    }
    expect(billBucket(null)).toBeNull();
  });
  it("CSV keeps report labels safe", () => {
    expect(csvCell("-Unassigned")).toBe("'-Unassigned");
    expect(csvCell("₹10k+")).toBe("₹10k+");
  });
});

/* ───── MySQL integration (skips without XAMPP) ───── */
const dbUp = await (async () => {
  if (!process.env.DB_NAME) return false;
  try { const { one } = await import("@/lib/admin/db"); await one("SELECT 1"); return true; } catch { return false; }
})();

describe.skipIf(!dbUp)("reports and team against MySQL", async () => {
  const { exec, one, pool } = await import("@/lib/admin/db");
  const { reportSection } = await import("@/lib/admin/reports");
  const { listLeads } = await import("@/lib/admin/leads-query");
  const { updateStaff, reassignOpenLeads } = await import("@/lib/admin/team-service");
  const ids: number[] = [];
  const mk = async (email: string, role: string, active = 1) => {
    const r = await exec("INSERT INTO staff (name, email, role, active) VALUES (?, ?, ?, ?)", [email.split("@")[0], email, role, active]);
    ids.push(r.insertId); return r.insertId;
  };
  let adminsBefore: number[] = [];

  beforeAll(async () => {
    // Make the vitest admin the ONLY active admin for the last-admin check; restore afterwards.
    adminsBefore = (await (await import("@/lib/admin/db")).q<{ id: number }>("SELECT id FROM staff WHERE role = 'admin' AND active = 1")).map((r) => r.id);
    if (adminsBefore.length) await exec(`UPDATE staff SET active = 0 WHERE id IN (${adminsBefore.map(() => "?").join(",")})`, adminsBefore);
  });
  afterAll(async () => {
    if (adminsBefore.length) await exec(`UPDATE staff SET active = 1 WHERE id IN (${adminsBefore.map(() => "?").join(",")})`, adminsBefore);
    await exec("DELETE FROM leads WHERE name = 'vitest-reassign'");
    if (ids.length) await exec(`DELETE FROM admin_audit WHERE target IN (${ids.map(() => "?").join(",")})`, ids.map((i) => `staff:${i}`));
    if (ids.length) await exec(`DELETE FROM staff WHERE id IN (${ids.map(() => "?").join(",")})`, ids);
    await pool().end();
  });

  it("report totals equal the Leads list for the same filter", async () => {
    const staff = { id: 0, role: "admin" as Role };
    for (const range of ["30d", "year"] as const) {
      const p = { range, from: "", to: "", test: true };
      const s = await reportSection("by-source", p, staff);
      const fromReport = s.rows.reduce((a, r) => a + Number(r.leads), 0);
      const { total } = await listLeads(parseFilter({ range, test: "1" }), staff);
      expect(fromReport).toBe(total);
      const won = s.rows.reduce((a, r) => a + Number(r.won), 0);
      expect(won).toBe((await listLeads(parseFilter({ range, test: "1", status: "won" }), staff)).total);
      const dist = await reportSection("by-district", p, staff);
      expect(dist.rows.reduce((a, r) => a + Number(r.leads), 0)).toBe(total);
      expect(dist.rows.length).toBeGreaterThanOrEqual(33);
    }
    expect(buildWhere(parseFilter({}), staff).sql).toContain("is_test = 0");
  });

  it("refuses to demote or deactivate the last active admin, and self-changes", async () => {
    const a = await mk("vitest-admin@example.com", "admin");
    const b = await mk("vitest-sales@example.com", "sales");
    const actorB = { id: b, name: "b", email: "", role: "admin" as const }; // pretend b is acting
    await expect(updateStaff(a, { role: "sales" }, actorB)).rejects.toMatchObject({ code: "not_allowed" });
    await expect(updateStaff(a, { active: false }, actorB)).rejects.toMatchObject({ code: "not_allowed" });
    const actorA = { id: a, name: "a", email: "", role: "admin" as const };
    await expect(updateStaff(a, { role: "sales" }, actorA)).rejects.toMatchObject({ message: expect.stringMatching(/own role/) });
    await updateStaff(b, { role: "admin" }, actorA); // second admin
    await updateStaff(b, { active: false }, actorA); // now allowed, and signs b out
    expect((await one<{ c: number }>("SELECT COUNT(*) AS c FROM sessions WHERE staff_id = ?", [b]))!.c).toBe(0);
  });

  it("reassigns only open leads and logs each one", async () => {
    const from = await mk("vitest-from@example.com", "sales");
    const to = await mk("vitest-to@example.com", "sales");
    for (const status of ["new", "contacted", "won"]) await exec("INSERT INTO leads (name, phone_normalized, status, assigned_to, is_test) VALUES ('vitest-reassign', '9000088888', ?, ?, 1)", [status, from]);
    const res = await reassignOpenLeads(from, to, { id: to, name: "t", email: "", role: "admin" });
    expect(res.moved).toBe(2);
    expect((await one<{ c: number }>("SELECT COUNT(*) AS c FROM leads WHERE name = 'vitest-reassign' AND assigned_to = ?", [from]))!.c).toBe(1); // won stays
    expect((await one<{ c: number }>("SELECT COUNT(*) AS c FROM lead_activity a JOIN leads l ON l.id = a.lead_id WHERE l.name = 'vitest-reassign' AND a.action = 'assigned'"))!.c).toBe(2);
  });
});
