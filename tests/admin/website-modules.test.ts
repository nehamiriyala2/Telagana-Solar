import { describe, expect, it } from "vitest";
import { CalcSchema, DEFAULT_CALC, domesticBill, homeQuote, homeSubsidy, pickSize, unitsFromDomesticBill } from "@/lib/calc-settings";
import { COLLECTIONS, projects, schemes } from "@/lib/admin/cms/collections";
import { emptyValues, formSchema, fromRow, parseLines, slugify, toColumns } from "@/lib/admin/cms/schema";
import { districtCompleteness } from "@/lib/admin/district-content";
import { BannerSchema, DEFAULT_TRUST, TrustSchema, bannedPhrase } from "@/lib/admin/site-content";
import { DEFAULT_TEMPLATES } from "@/lib/admin/templates";
import { NAV, can, navFor } from "@/lib/admin/roles";

describe("calculator maths", () => {
  const slabs = DEFAULT_CALC.slabs.TGSPDCL;
  it("domestic bill is telescopic: 0 units → 0, slabs add up", () => {
    expect(domesticBill(0, slabs, 30)).toBe(0);
    expect(domesticBill(50, slabs, 0)).toBeCloseTo(50 * 1.95);
    expect(domesticBill(150, slabs, 0)).toBeCloseTo(50 * 1.95 + 50 * 3.1 + 50 * 4.8);
  });
  it("units from bill is the inverse of the bill", () => {
    for (const u of [80, 230, 410, 900]) expect(unitsFromDomesticBill(domesticBill(u, slabs, 30), slabs, 30)).toBeCloseTo(u, -1);
  });
  it("subsidy follows the bands and the ₹78,000 cap", () => {
    expect(homeSubsidy(1, DEFAULT_CALC, 1e9)).toBe(30000);
    expect(homeSubsidy(2, DEFAULT_CALC, 1e9)).toBe(60000);
    expect(homeSubsidy(3, DEFAULT_CALC, 1e9)).toBe(78000);
    expect(homeSubsidy(10, DEFAULT_CALC, 1e9)).toBe(78000);
    expect(homeSubsidy(3, DEFAULT_CALC, 50000)).toBe(50000); // never more than the cost
  });
  it("picks the smallest offered size that covers the need", () => {
    expect(pickSize(2.2, [1, 2, 3, 5])).toBe(3);
    expect(pickSize(9, [1, 2, 3, 5])).toBe(5);
    expect(pickSize(0, [1, 2])).toBe(0);
  });
  it("a ₹3,000 bill gives a sensible home quote", () => {
    const r = homeQuote(DEFAULT_CALC, 3000, "TGSPDCL");
    expect(r.kw).toBeGreaterThan(0);
    expect(r.netCost).toBe(r.cost - r.subsidy);
    expect(r.monthlySaving).toBeGreaterThan(0);
    expect(r.monthlySaving).toBeLessThanOrEqual(3000);
  });
  it("defaults are valid; bad slabs are rejected", () => {
    expect(CalcSchema.safeParse(DEFAULT_CALC).success).toBe(true);
    const bad = structuredClone(DEFAULT_CALC);
    bad.slabs.TGSPDCL = [{ upto: 100, rate: 3 }, { upto: 50, rate: 4 }, { upto: null, rate: 5 }];
    expect(CalcSchema.safeParse(bad).success).toBe(false);
    const open = structuredClone(DEFAULT_CALC);
    open.slabs.TGNPDCL = [{ upto: 100, rate: 3 }];
    expect(CalcSchema.safeParse(open).success).toBe(false);
  });
  it("every default starts unconfirmed (VERIFY)", () => expect(DEFAULT_CALC.verified).toEqual([]));
});

describe("field-driven modules", () => {
  it("every module has a valid empty form", () => {
    for (const c of Object.values(COLLECTIONS)) expect(c.fields.length).toBeGreaterThan(0);
    expect(emptyValues(schemes).name).toEqual({ en: "", te: "" });
  });
  it("bilingual fields map to _en/_te columns and the slug is made from the title", () => {
    const v = formSchema(schemes).parse({ ...emptyValues(schemes), name: { en: "Rooftop Scheme 2027", te: "" }, documents: { en: ["Bill", "", " Aadhaar "], te: [] } });
    const { cols } = toColumns(schemes, v);
    expect(cols.name_en).toBe("Rooftop Scheme 2027");
    expect(cols.name_te).toBeNull();
    expect(cols.slug).toBe("rooftop-scheme-2027");
    expect(JSON.parse(String(cols.documents))).toEqual({ en: ["Bill", "Aadhaar"], te: [] });
  });
  it("required English, bad slugs, links and unknown fields are rejected", () => {
    const base = emptyValues(schemes);
    expect(formSchema(schemes).safeParse(base).success).toBe(false); // name required
    const named = { ...base, name: { en: "X scheme", te: "" } };
    expect(formSchema(schemes).safeParse({ ...named, slug: "Bad Slug!" }).success).toBe(false);
    expect(formSchema(schemes).safeParse({ ...named, official_url: "javascript:alert(1)" }).success).toBe(false);
    expect(formSchema(schemes).safeParse({ ...named, deleted_at: "x" }).success).toBe(false);
    expect(formSchema(schemes).safeParse(named).success).toBe(true);
  });
  it("round-trips a DB row back into the form", () => {
    const row = { name_en: "PM-KUSUM", name_te: "పీఎం కుసుమ్", documents: JSON.stringify({ en: ["Land records"], te: [] }), all_districts: 0, last_verified_at: new Date("2026-10-01T00:00:00Z") };
    const v = fromRow(schemes, row, [3, 7]);
    expect(v.name).toEqual({ en: "PM-KUSUM", te: "పీఎం కుసుమ్" });
    expect(v.districts).toEqual({ all: false, ids: [3, 7] });
    expect(v.last_verified_at).toBe("2026-10-01");
    expect(parseLines(row.documents).en).toEqual(["Land records"]);
  });
  it("projects need a size; slugify handles punctuation", () => {
    expect(formSchema(projects).safeParse({ ...emptyValues(projects), title: "Home", kw: null }).success).toBe(false);
    expect(slugify("3 kW rooftop – Hanamkonda!")).toBe("3-kw-rooftop-hanamkonda");
  });
});

describe("website content rules", () => {
  it("never offers free site visits or surveys (EN and TE)", () => {
    expect(bannedPhrase(["Book a FREE site visit today"])).not.toBeNull();
    expect(bannedPhrase(["free survey of your roof"])).not.toBeNull();
    expect(bannedPhrase(["ఉచిత సైట్ విజిట్"])).not.toBeNull();
    expect(bannedPhrase(["We handle the survey and paperwork"])).toBeNull();
  });
  it("built-in WhatsApp templates don't offer free visits", () => {
    for (const t of Object.values(DEFAULT_TEMPLATES)) expect(bannedPhrase([t.en, t.te])).toBeNull();
  });
  it("trust bar needs exactly four filled slots; banner needs text to be turned on", () => {
    expect(TrustSchema.safeParse(DEFAULT_TRUST).success).toBe(true);
    expect(TrustSchema.safeParse(DEFAULT_TRUST.slice(0, 3)).success).toBe(false);
    expect(BannerSchema.safeParse({ enabled: true, text_en: "", text_te: "", link: "", tone: "saffron" }).success).toBe(false);
    expect(BannerSchema.safeParse({ enabled: true, text_en: "Apply before 31 March", text_te: "", link: "javascript:x", tone: "saffron" }).success).toBe(false);
  });
  it("district completeness counts English and flags missing Telugu", () => {
    expect(districtCompleteness({ summary_en: "a", summary_te: "అ", about_en: "b", seo_title_en: "c" })).toEqual({ done: 3, total: 6, teMissing: 2 });
  });
});

describe("roles and menu", () => {
  it("content role edits the website modules, sales doesn't", () => {
    for (const p of ["schemes.edit", "projects.edit", "content.edit", "calculator.edit", "districts.edit", "templates.edit"] as const) {
      expect(can("content", p)).toBe(true);
      expect(can("sales", p)).toBe(false);
    }
    expect(navFor("sales").map((n) => n.group).includes("site")).toBe(true); // Templates (view) only
    expect(navFor("sales").filter((n) => n.group === "site").map((n) => n.key)).toEqual(["templates"]);
  });
  it("menu groups follow the brief", () => {
    expect(NAV.filter((n) => n.group === "work" && n.key !== "jobs").map((n) => n.label)).toEqual(["Overview", "Leads", "Pipeline", "Follow-ups", "Reports"]);
    expect(NAV.filter((n) => n.group === "site").map((n) => n.label)).toEqual(["Districts", "Calculator", "Schemes", "Projects", "Templates", "Content"]);
    expect(NAV.filter((n) => n.group === "admin").map((n) => n.label)).toEqual(["Team", "Settings"]);
  });
});
