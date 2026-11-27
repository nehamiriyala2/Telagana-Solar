/** The six content blocks of a district page (pure; used by the admin form, the list and the public page). */
export const DISTRICT_BLOCKS = [
  { key: "summary", label: "Summary", hint: "Two or three sentences at the top of the district page.", area: true, max: 2000 },
  { key: "about", label: "About solar here", hint: "A few short paragraphs: roofs, farms, power cuts, what people ask. Blank line between paragraphs.", area: true, max: 6000 },
  { key: "solar_types", label: "Popular solar types", hint: "One per line, e.g. “Rooftop on-grid for homes”.", area: true, max: 1500 },
  { key: "local_notes", label: "Local notes", hint: "DISCOM office, net-meter waiting time, anything local. Only facts you have checked.", area: true, max: 3000 },
  { key: "seo_title", label: "SEO title", hint: "About 50–60 characters. Left empty, a default is used.", area: false, max: 160 },
  { key: "seo_desc", label: "SEO description", hint: "About 140–160 characters.", area: true, max: 320 },
] as const;
export type DistrictBlockKey = (typeof DISTRICT_BLOCKS)[number]["key"];

/** A block counts as done when English is filled in; Telugu gaps are reported separately. */
export function districtCompleteness(row: Record<string, unknown>) {
  const has = (v: unknown) => typeof v === "string" && v.trim().length > 0;
  const done = DISTRICT_BLOCKS.filter((b) => has(row[`${b.key}_en`])).length;
  const teMissing = DISTRICT_BLOCKS.filter((b) => has(row[`${b.key}_en`]) && !has(row[`${b.key}_te`])).length;
  return { done, total: DISTRICT_BLOCKS.length, teMissing };
}
