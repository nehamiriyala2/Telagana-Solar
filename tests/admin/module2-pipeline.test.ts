import { describe, expect, it } from "vitest";
import { DEFAULT_STAGES, StagesSchema, normalizeStages, stageLabels } from "@/lib/admin/stages";
import { STATUSES } from "@/lib/admin/labels";
import { PatchSchema, missingWonDetails } from "@/lib/admin/lead-service";

const clone = () => DEFAULT_STAGES.map((s) => ({ ...s }));

describe("pipeline stages", () => {
  it("defaults follow the brief: New, Contacted, Qualified, (internal) Site visit, Proposal/Quote, Won, Lost", () => {
    expect(DEFAULT_STAGES.map((s) => s.key)).toEqual(["new", "contacted", "qualified", "site_visit", "quote_sent", "won", "lost"]);
    expect(DEFAULT_STAGES.find((s) => s.key === "site_visit")?.internal).toBe(true);
    expect(stageLabels(DEFAULT_STAGES).quote_sent).toBe("Proposal / Quote");
    expect(StagesSchema.safeParse(DEFAULT_STAGES).success).toBe(true);
  });
  it("every status has exactly one stage", () => {
    expect([...DEFAULT_STAGES.map((s) => s.key)].sort()).toEqual([...STATUSES].sort());
  });
  it("can rename, recolour, reorder and hide optional stages", () => {
    const s = clone();
    s[1].label = "Called"; s[1].tone = "purple";
    s[3].visible = false;
    [s[1], s[2]] = [s[2], s[1]];
    expect(StagesSchema.safeParse(s).success).toBe(true);
  });
  it("New, Won and Lost can't be hidden", () => {
    for (const k of ["new", "won", "lost"]) {
      const s = clone(); s.find((x) => x.key === k)!.visible = false;
      expect(StagesSchema.safeParse(s).success).toBe(false);
    }
  });
  it("rejects missing, duplicate or unnamed stages, same names and unknown colours", () => {
    expect(StagesSchema.safeParse(clone().slice(1)).success).toBe(false);
    expect(StagesSchema.safeParse([...clone(), clone()[0]]).success).toBe(false);
    const blank = clone(); blank[2].label = "  "; expect(StagesSchema.safeParse(blank).success).toBe(false);
    const same = clone(); same[2].label = "contacted"; expect(StagesSchema.safeParse(same).success).toBe(false);
    const tone = clone() as unknown as { tone: string }[]; tone[0].tone = "#ff0000"; expect(StagesSchema.safeParse(tone).success).toBe(false);
  });
  it("an old saved list missing a stage is repaired, not dropped", () => {
    const old = clone().filter((s) => s.key !== "qualified");
    const fixed = normalizeStages(old);
    expect(fixed.map((s) => s.key)).toContain("qualified");
    expect(StagesSchema.safeParse(fixed).success).toBe(true);
    expect(normalizeStages("garbage")).toEqual(DEFAULT_STAGES);
  });
});

describe("won needs kW, final amount and subsidy", () => {
  const empty = { final_kw: null, final_amount: null, subsidy_applied: null };
  it("lists what is missing", () => {
    expect(missingWonDetails(empty, {})).toEqual(["system size (kW)", "final amount", "whether subsidy was applied"]);
  });
  it("accepts values from the request", () => {
    expect(missingWonDetails(empty, { final_kw: 3, final_amount: 180000, subsidy_applied: false })).toEqual([]);
  });
  it("accepts values already on the lead (DECIMAL comes back as a string)", () => {
    expect(missingWonDetails({ final_kw: "3.50", final_amount: 0, subsidy_applied: 1 }, {})).toEqual([]);
  });
  it("0 kW is not a system", () => {
    expect(missingWonDetails({ ...empty, final_amount: 1, subsidy_applied: 0 }, { final_kw: 0 })).toEqual(["system size (kW)"]);
  });
  it("PATCH accepts final_amount and the new stage", () => {
    expect(PatchSchema.safeParse({ status: "qualified" }).success).toBe(true);
    expect(PatchSchema.safeParse({ status: "won", final_kw: 3, final_amount: 180000, subsidy_applied: true }).success).toBe(true);
    expect(PatchSchema.safeParse({ final_amount: -1 }).success).toBe(false);
  });
});
