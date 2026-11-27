import "server-only";
import { one } from "./db";
import { DEFAULT_STAGES, normalizeStages, type Stage } from "./stages";

export const STAGES_KEY = "pipeline_stages";

/** Saved stage settings, or the defaults (also when MySQL is down, so pages still render). */
export async function loadStages(): Promise<Stage[]> {
  try {
    const row = await one<{ value: unknown }>("SELECT value FROM settings WHERE `key` = ?", [STAGES_KEY]);
    if (!row) return DEFAULT_STAGES;
    return normalizeStages(typeof row.value === "string" ? JSON.parse(row.value) : row.value);
  } catch {
    return DEFAULT_STAGES;
  }
}
