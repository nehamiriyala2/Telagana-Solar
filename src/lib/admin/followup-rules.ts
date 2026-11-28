import { z } from "zod";
import { FU_NEXT_DAYS, FU_OUTCOMES, type FuOutcome } from "./labels";

/**
 * Follow-up timing rules (Settings → Follow-up timing). Pure.
 * For each outcome: days until the suggested next follow-up (null = don't suggest one), and the time of day.
 */
export const FU_RULES_KEY = "followup_rules";
export type FuRules = { nextDays: Record<FuOutcome, number | null>; defaultTime: string };

export const DEFAULT_FU_RULES: FuRules = { nextDays: { ...FU_NEXT_DAYS }, defaultTime: "10:00" };

export const FuRulesSchema = z.object({
  nextDays: z.record(z.enum(FU_OUTCOMES), z.number().int().min(0, "Use 0 or more days.").max(60, "Use at most 60 days.").nullable()),
  defaultTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a time like 10:00."),
}).strict();

export function normalizeFuRules(v: unknown): FuRules {
  const r = FuRulesSchema.safeParse(v);
  return r.success ? (r.data as FuRules) : DEFAULT_FU_RULES;
}
