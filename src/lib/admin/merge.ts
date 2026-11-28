/**
 * Merging two leads: the lead you are on ("keep") absorbs a duplicate ("other").
 * For each field you pick which value wins. Default: keep the current value, unless it is empty
 * and the duplicate has one. Notes, activity and follow-ups of both are kept; the duplicate is soft-deleted.
 */
export const MERGE_FIELDS = [
  ["name", "Name"], ["phone", "Phone"], ["district_id", "District"], ["area", "Area"], ["place", "Place"],
  ["use_type", "Use"], ["bill", "Bill"], ["units", "Units"], ["power_cuts", "Power cuts"], ["roof", "Roof"],
  ["kw", "kW"], ["system_type", "System type"], ["monthly_saving", "Monthly saving"], ["schemes", "Schemes"],
  ["message", "Message"], ["lang", "Language"], ["status", "Status"], ["assigned_to", "Owner"],
  ["email", "Email"], ["address", "Address"], ["roof_area_sqft", "Roof area"],
  ["site_visit_at", "Site visit"], ["final_kw", "Final kW"], ["final_amount", "Final amount"],
  ["quote_amount", "Quote amount"], ["subsidy_applied", "Subsidy applied"], ["loan_needed", "Loan needed"],
  ["install_date", "Install date"], ["lost_reason", "Lost reason"], ["won_at", "Won at"],
] as const;
export type MergeField = (typeof MERGE_FIELDS)[number][0];
export type Pick = "keep" | "other";

const empty = (v: unknown) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0) || v === "[]";

export function defaultPicks(keep: Record<string, unknown>, other: Record<string, unknown>): Record<MergeField, Pick> {
  return Object.fromEntries(MERGE_FIELDS.map(([f]) => [f, empty(keep[f]) && !empty(other[f]) ? "other" : "keep"])) as Record<MergeField, Pick>;
}

/** Column → new value for the kept lead (only fields that change). Phone carries phone_normalized with it. */
export function mergeUpdates(keep: Record<string, unknown>, other: Record<string, unknown>, picks: Partial<Record<MergeField, Pick>>): Record<string, unknown> {
  const defaults = defaultPicks(keep, other);
  const out: Record<string, unknown> = {};
  for (const [f] of MERGE_FIELDS) {
    const pick = picks[f] ?? defaults[f];
    if (pick !== "other") continue;
    if (JSON.stringify(keep[f] ?? null) === JSON.stringify(other[f] ?? null)) continue;
    out[f] = other[f] ?? null;
    if (f === "phone") out.phone_normalized = other.phone_normalized ?? null;
  }
  // A lost lead keeps its reason only while it is lost.
  const status = (out.status ?? keep.status) as string;
  if (status !== "lost" && (out.lost_reason ?? keep.lost_reason)) out.lost_reason = null;
  if (status === "lost" && !(out.lost_reason ?? keep.lost_reason)) out.lost_reason = other.lost_reason ?? "other";
  return out;
}
