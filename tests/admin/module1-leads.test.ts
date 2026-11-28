import { describe, expect, it } from "vitest";
import { can, homeFor, navFor, ownLeadsOnly } from "@/lib/admin/roles";
import { leadSource } from "@/lib/admin/lead-source";
import { describeActivity } from "@/lib/admin/activity";
import { BulkSchema, CreateSchema, PatchSchema } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { SOURCE_CHANNEL, SOURCES } from "@/lib/admin/labels";

const act = (action: string, details: Record<string, unknown> | null = null) =>
  describeActivity({ id: 1, action, details, created_at: new Date(), staff_name: null });

describe("Module 1 roles", () => {
  it("sales see only their own leads; admins see all", () => {
    expect(ownLeadsOnly("sales")).toBe(true);
    expect(ownLeadsOnly("admin")).toBe(false);
  });
  it("sales can add and edit leads but not bulk-assign, export or delete", () => {
    expect(can("sales", "leads.create")).toBe(true);
    expect(can("sales", "leads.edit")).toBe(true);
    expect(can("sales", "leads.assign")).toBe(false);
    expect(can("sales", "leads.export")).toBe(false);
    expect(can("sales", "leads.delete")).toBe(false);
  });
  it("content role gets the Website modules only, no customer data", () => {
    expect(navFor("content").map((n) => n.group)).toEqual(expect.arrayContaining(["site"]));
    expect(navFor("content").every((n) => n.group === "site")).toBe(true);
    for (const p of ["leads.view", "overview.view", "pipeline.view", "reports.view", "team.manage", "settings.manage"] as const) {
      expect(can("content", p)).toBe(false);
    }
    expect(homeFor("content")).toBe("/admin/districts");
  });
  it("bulk assign needs its own (admin) permission", () => {
    expect(ROUTE_PERMS["leads.bulkAssign"]).toBe("leads.assign");
    expect(ROUTE_PERMS["leads.create"]).toBe("leads.create");
  });
});

describe("lead sources", () => {
  it("WhatsApp taps on the website are tagged whatsapp", () => {
    expect(leadSource({ kind: "whatsapp_click", sourcePage: "/en#floating", calc: null })).toBe("whatsapp");
  });
  it("every source maps to one of the five channels in the brief", () => {
    for (const s of SOURCES) expect(["website", "calculator", "whatsapp", "call", "referral"]).toContain(SOURCE_CHANNEL[s]);
  });
});

describe("create lead validation", () => {
  const base = { name: "Ravi Kumar", phone: "+91 98765 43210", source: "call" };
  it("normalises phones and blanks", () => {
    const r = CreateSchema.parse({ ...base, alt_phone: "", email: " Ravi@Example.COM ", area: "  " });
    expect(r.phone).toBe("9876543210");
    expect(r.alt_phone).toBeNull();
    expect(r.email).toBe("ravi@example.com");
    expect(r.area).toBeNull();
    expect(r.status).toBe("new");
  });
  it.each([
    [{ ...base, phone: "12345" }, "phone"],
    [{ ...base, name: "R" }, "name"],
    [{ ...base, email: "not-an-email" }, "email"],
    [{ ...base, source: "find-my-plan" }, "source"], // website sources are set by the website only
    [{ ...base, alt_phone: "5555555555" }, "alt_phone"],
    [{ ...base, bill: -5 }, "bill"],
    [{ ...base, status: "won" }, "status"],
  ])("rejects bad input (%#)", (input, path) => {
    const r = CreateSchema.safeParse(input);
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path.join("."))).toContain(path);
  });
  it("rejects unknown fields (no mass assignment)", () => {
    expect(CreateSchema.safeParse({ ...base, deleted_at: "2020-01-01" }).success).toBe(false);
    expect(PatchSchema.safeParse({ lead_no: "TS-9999" }).success).toBe(false);
  });
  it("strips control characters from text", () => {
    expect(CreateSchema.parse({ ...base, address: "Plot 1\u0000\u0007, Road 2" }).address).toBe("Plot 1, Road 2");
  });
});

describe("bulk actions", () => {
  it("accepts status and assign, caps at 500 leads", () => {
    expect(BulkSchema.safeParse({ action: "status", ids: [1, 2], status: "contacted" }).success).toBe(true);
    expect(BulkSchema.safeParse({ action: "assign", ids: [1], assigned_to: null }).success).toBe(true);
    expect(BulkSchema.safeParse({ action: "status", ids: Array.from({ length: 501 }, (_, i) => i + 1), status: "new" }).success).toBe(false);
    expect(BulkSchema.safeParse({ action: "delete", ids: [1] }).success).toBe(false);
  });
});

describe("timeline wording", () => {
  it("never shows personal values that changed", () => {
    expect(act("field_edited", { field: "phone", from: "set", to: "changed" })).toBe("Phone changed");
    expect(act("field_edited", { field: "email", from: null, to: "changed" })).toBe("Email added");
  });
  it("describes calls, WhatsApp and hand-added leads", () => {
    expect(act("called")).toBe("Called the customer");
    expect(act("whatsapp_opened", { template: "welcome" })).toContain("welcome");
    expect(act("created", { source: "referral", manual: true })).toBe("Lead added by hand (Referral)");
  });
  it("shows plain field changes with values", () => {
    expect(act("field_edited", { field: "bill", from: 2000, to: 3500 })).toBe("Monthly bill: ₹2,000 → ₹3,500");
  });
});
