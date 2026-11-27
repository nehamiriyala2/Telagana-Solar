import "server-only";
import { one } from "./db";
import { DEFAULT_FU_RULES, FU_RULES_KEY, normalizeFuRules, type FuRules } from "./followup-rules";

export async function loadFuRules(): Promise<FuRules> {
  try {
    const r = await one<{ value: unknown }>("SELECT value FROM settings WHERE `key` = ?", [FU_RULES_KEY]);
    return r ? normalizeFuRules(typeof r.value === "string" ? JSON.parse(r.value) : r.value) : DEFAULT_FU_RULES;
  } catch {
    return DEFAULT_FU_RULES;
  }
}
