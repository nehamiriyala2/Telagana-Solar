import { describe, expect, it } from "vitest";
import { csvCell, parseCsv, toCsv } from "@/lib/admin/csv";
import { buildWhere, filterToParams, parseFilter } from "@/lib/admin/leads-query";
import { defaultPicks, mergeUpdates } from "@/lib/admin/merge";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { can, type Role } from "@/lib/admin/roles";
import { pickTemplate, renderTemplate, unknownVars } from "@/lib/admin/templates";
import { istLocalToUtc, istRange, receivedLabel, utcToIstLocal } from "@/lib/admin/time";

const admin = { id: 1, role: "admin" as Role };
const sales = { id: 2, role: "sales" as Role };

describe("lead search", () => {
  const where = (q: string) => buildWhere(parseFilter({ q }), admin);
  it("matches phones on the normalized 10 digits", () => {
    for (const q of ["98765 43210", "+91 98765-43210", "09876543210"]) {
      const w = where(q);
      expect(w.sql).toContain("phone_normalized LIKE ?");
      expect(w.params).toContain("%9876543210%");
    }
    expect(where("43210").params).toContain("%43210%");
  });
  it("matches TS numbers to the id", () => {
    const w = where("ts-0012");
    expect(w.sql).toContain("l.id = ?");
    expect(w.params).toContain(12);
  });
  it("matches names / areas with escaped wildcards", () => {
    const w = where("50%_off");
    expect(w.sql).toContain("l.name LIKE ?");
    expect(w.params).toContain("%50\\%\\_off%");
  });
  it("never puts input into the SQL text", () => {
    const w = buildWhere(parseFilter({ q: "x' OR 1=1 --", status: "won; DROP TABLE leads", district: "../etc", owner: "1 OR 1" }), admin);
    expect(w.sql).not.toMatch(/OR 1=1|DROP|etc/);
  });
  it("hides test and deleted leads by default; only admins can show deleted", () => {
    expect(buildWhere(parseFilter({}), admin).sql).toMatch(/deleted_at IS NULL.*is_test = 0/);
    expect(buildWhere(parseFilter({ deleted: "1", test: "1" }), admin).sql).not.toMatch(/deleted_at IS NULL|is_test = 0/);
    expect(buildWhere(parseFilter({ deleted: "1" }), sales).sql).toContain("deleted_at IS NULL");
  });
  it("splits the calculator-without-contact tab", () => {
    expect(buildWhere(parseFilter({ tab: "nocontact" }), admin).sql).toContain("(l.phone_normalized IS NULL AND l.anonymized_at IS NULL)");
    expect(buildWhere(parseFilter({}), admin).sql).toContain("NOT (l.phone_normalized IS NULL");
  });
  it("round-trips filters through the URL", () => {
    const f = parseFilter({ status: "won", bill: "5-10k", range: "custom", from: "2026-11-01", to: "2026-11-30", page: "3" });
    expect(filterToParams(f).toString()).toBe("status=won&bill=5-10k&range=custom&from=2026-11-01&to=2026-11-30&page=3");
    expect(parseFilter({ status: "bogus", bill: "huge" }).status).toBe("");
  });
});

describe("route permissions", () => {
  const leadRoutes = Object.entries(ROUTE_PERMS).filter(([r]) => r.startsWith("leads."));
  const allowed = (role: Role) => leadRoutes.filter(([, p]) => can(role, p)).map(([r]) => r).sort();
  it("admin can use every lead route", () => expect(allowed("admin")).toEqual(leadRoutes.map(([r]) => r).sort()));
  it("sales can view, add and edit, but not bulk-assign, export, delete, restore, anonymize or merge", () => {
    expect(allowed("sales")).toEqual([
      "leads.addPhone", "leads.bulkStatus", "leads.contactLog", "leads.create", "leads.followUp", "leads.get", "leads.list",
      "leads.notes.add", "leads.notes.edit", "leads.patch", "leads.timeline",
    ]);
  });
  it("installer and content can use no lead route", () => {
    expect(allowed("installer")).toEqual([]);
    expect(allowed("content")).toEqual([]);
  });
});

describe("merge", () => {
  const keep = { name: "Ravi", phone: "9876543210", phone_normalized: "9876543210", area: null, bill: 3000, status: "contacted", lost_reason: null, schemes: "[]" };
  const other = { name: "Ravi Kumar", phone: "9123456789", phone_normalized: "9123456789", area: "Uppal", bill: 3000, status: "lost", lost_reason: "price", schemes: '["pm-surya-ghar"]' };
  it("defaults to the current value, filling empty fields from the duplicate", () => {
    const p = defaultPicks(keep, other);
    expect(p.name).toBe("keep");
    expect(p.area).toBe("other");
    expect(p.schemes).toBe("other");
  });
  it("applies picks, carries phone_normalized with phone, skips equal values", () => {
    const u = mergeUpdates(keep, other, { name: "other", phone: "other" });
    expect(u).toMatchObject({ name: "Ravi Kumar", phone: "9123456789", phone_normalized: "9123456789", area: "Uppal" });
    expect("bill" in u).toBe(false);
  });
  it("keeps lost_reason consistent with status", () => {
    expect(mergeUpdates(keep, other, { status: "other" })).toMatchObject({ status: "lost", lost_reason: "price" });
    expect(mergeUpdates({ ...keep, status: "lost", lost_reason: "price" }, other, { status: "keep" }).lost_reason).toBeUndefined();
    expect(mergeUpdates({ ...other }, { ...keep }, { status: "other" })).toMatchObject({ status: "contacted", lost_reason: null });
  });
});

describe("CSV", () => {
  it("quotes commas, quotes and line breaks", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });
  it("neutralizes formula starters", () => {
    for (const s of ["=1+1", "+91 98765", "-5", "@SUM(A1)", "\tx"]) expect(csvCell(s).replace(/^"/, "").startsWith("'")).toBe(true);
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
  });
  it("keeps Telugu and adds a BOM", () => {
    const out = toCsv(["Name"], [["రమేష్"], [null], [42]]);
    expect(out.startsWith("﻿Name\r\n")).toBe(true);
    expect(out).toContain("రమేష్\r\n\r\n42");
  });
  it("parses Google Sheet exports back", () => {
    const rows = parseCsv('﻿a,b,c\r\n1,"x, ""y""",రమేష్\n"multi\nline",,\n');
    expect(rows).toEqual([["a", "b", "c"], ["1", 'x, "y"', "రమేష్"], ["multi\nline", "", ""]]);
  });
});

describe("IST dates", () => {
  const now = new Date("2026-11-26T20:00:00Z"); // 27 Nov 01:30 IST
  it("today starts at IST midnight", () => {
    const r = istRange("today", now);
    expect(r.from?.toISOString()).toBe("2026-11-26T18:30:00.000Z");
    expect(r.to?.toISOString()).toBe("2026-11-27T18:30:00.000Z");
  });
  it("7 days include today", () => expect(istRange("7d", now).from?.toISOString()).toBe("2026-11-20T18:30:00.000Z"));
  it("custom ranges are inclusive", () => {
    const r = istRange("custom", now, "2026-11-01", "2026-11-30");
    expect(r.from?.toISOString()).toBe("2026-10-31T18:30:00.000Z");
    expect(r.to?.toISOString()).toBe("2026-11-30T18:30:00.000Z");
  });
  it("labels received times", () => {
    expect(receivedLabel(new Date("2026-11-26T19:45:00Z"), now)).toBe("01:15 today");
    expect(receivedLabel(new Date("2026-11-26T10:00:00Z"), now)).toBe("Yesterday 15:30");
    expect(receivedLabel(new Date("2025-01-05T10:00:00Z"), now)).toBe("5 Jan 2025");
  });
  it("converts datetime-local both ways", () => {
    expect(istLocalToUtc("2026-11-27T09:00")?.toISOString()).toBe("2026-11-27T03:30:00.000Z");
    expect(utcToIstLocal(new Date("2026-11-27T03:30:00Z"))).toBe("2026-11-27T09:00");
    expect(istLocalToUtc("tomorrow")).toBeNull();
  });
});

describe("WhatsApp templates", () => {
  it("fills variables and tidies missing ones", () => {
    expect(renderTemplate("Hello {name}, your {kw} system in {district}.", { name: "Ravi", kw: "3 kW", district: "Khammam" })).toBe("Hello Ravi, your 3 kW system in Khammam.");
    expect(renderTemplate("Hello {name}, hi.", {})).toBe("Hello, hi.");
  });
  it("flags unknown variables", () => expect(unknownVars("Hi {name} {price} {kw} {Name}")).toEqual(["price", "Name"]));
  it("falls back: lead language → English → built-in", () => {
    const rows = [{ key: "welcome", lang: "en", body: "EN body", active: 1 }, { key: "welcome", lang: "te", body: "TE body", active: 0 }];
    expect(pickTemplate("welcome", "te", rows)).toBe("EN body");
    expect(pickTemplate("welcome", "te", [])).toContain("తెలంగాణ సోలార్");
    expect(pickTemplate("welcome", "en", [])).toContain("Telangana Solar");
  });
});
