import { beforeAll, describe, expect, it } from "vitest";
import { phone10 } from "@/lib/admin/phone";
import { can, navFor, NAV } from "@/lib/admin/roles";
import { signSession, verifySession } from "@/lib/admin/session-token";
import { codeMatches, hashCode, newCode } from "@/lib/admin/otp";
import { leadSource, utmFromReferer } from "@/lib/admin/leads-db";

beforeAll(() => { process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-1234"; });

describe("phone normalization", () => {
  it.each([
    ["9876543210", "9876543210"], ["+91 98765 43210", "9876543210"], ["919876543210", "9876543210"],
    ["09876543210", "9876543210"], ["98765-43210", "9876543210"],
  ])("%s → %s", (raw, out) => expect(phone10(raw)).toBe(out));
  it.each(["12345", "5876543210", "", null, "abcdefghij"])("rejects %s", (raw) => expect(phone10(raw)).toBeNull());
});

describe("roles", () => {
  it("admin can do everything", () => {
    expect(can("admin", "leads.export")).toBe(true);
    expect(can("admin", "team.manage")).toBe(true);
  });
  it("sales cannot export, delete, anonymize or manage team/settings", () => {
    for (const p of ["leads.export", "leads.delete", "leads.anonymize", "team.manage", "settings.manage", "reports.export", "templates.edit"] as const) {
      expect(can("sales", p)).toBe(false);
    }
    expect(can("sales", "leads.view")).toBe(true);
    expect(can("sales", "reports.view")).toBe(true);
  });
  it("installer only sees installer jobs", () => {
    expect(navFor("installer").map((n) => n.key)).toEqual(["jobs"]);
    expect(can("installer", "leads.view")).toBe(false);
    expect(can("installer", "installer.jobs")).toBe(true);
  });
  it("no role or unknown role gets nothing", () => expect(can(null, "leads.view")).toBe(false));
  it("every module is built: no SOON badges remain", () => expect(NAV.filter((n) => n.soon).map((n) => n.key)).toEqual([]));
});

describe("session cookie", () => {
  const id = "a".repeat(64);
  it("round-trips a valid signature", async () => {
    const v = await signSession(id, new Date(Date.now() + 60_000));
    expect(await verifySession(v)).toBe(id);
  });
  it("rejects tampering, expiry and junk", async () => {
    const v = await signSession(id, new Date(Date.now() + 60_000));
    expect(await verifySession(v.slice(0, -2) + "xx")).toBeNull();
    expect(await verifySession(v.replace(/^a/, "b"))).toBeNull();
    expect(await verifySession(await signSession(id, new Date(Date.now() - 1000)))).toBeNull();
    expect(await verifySession("nope")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });
});

describe("OTP codes", () => {
  it("are 6 digits", () => { for (let i = 0; i < 50; i++) expect(newCode()).toMatch(/^\d{6}$/); });
  it("match only the right email + code", () => {
    const h = hashCode("a@b.co", "123456");
    expect(codeMatches("A@B.co", "123456", h)).toBe(true);
    expect(codeMatches("a@b.co", "123457", h)).toBe(false);
    expect(codeMatches("x@b.co", "123456", h)).toBe(false);
  });
});

describe("lead source", () => {
  const base = { sourcePage: "/", calc: null, propertyType: undefined } as const;
  it("maps website forms to the four tools", () => {
    expect(leadSource({ ...base, kind: "plan_request", sourcePage: "/find-my-plan" })).toBe("find-my-plan");
    expect(leadSource({ ...base, kind: "plan_request", sourcePage: "/te/contact" })).toBe("contact");
    expect(leadSource({ ...base, kind: "quote", sourcePage: "/contact" })).toBe("contact");
    expect(leadSource({ ...base, kind: "calculator_report", propertyType: "home" })).toBe("savings-calculator");
    expect(leadSource({ ...base, kind: "calculator_report", propertyType: "business" })).toBe("shop-calculator");
    expect(leadSource({ ...base, kind: "subsidy_check" })).toBe("subsidy-check");
  });
  it("reads utm from the page URL", () => {
    expect(utmFromReferer("https://x.in/contact?utm_source=google&utm_campaign=rooftop")).toEqual({ utm_source: "google", utm_campaign: "rooftop" });
    expect(utmFromReferer(null)).toEqual({ utm_source: null, utm_campaign: null });
  });
});
