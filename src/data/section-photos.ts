/**
 * Photos for the small picture tiles on the homepage sections.
 * Drop a file at the listed path in /public and it appears; until then the section shows its icon.
 * Square-ish photos (about 600×600, .webp) work best.
 */

/** "Sun → Panels → Inverter → Home → Net meter → Grid" energy-flow strip. */
export const FLOW_PHOTOS: Record<string, string> = {
  sun: "/photos/flow/sun.webp",
  panels: "/photos/flow/panels.webp",
  inverter: "/photos/flow/inverter.webp",
  home: "/photos/flow/home.webp",
  meter: "/photos/flow/meter.webp",
  grid: "/photos/flow/grid.webp",
};

/** On-grid / off-grid / hybrid cards. */
export const TYPE_PHOTOS: Record<string, string> = {
  ongrid: "/photos/types/ongrid.webp",
  offgrid: "/photos/types/offgrid.webp",
  hybrid: "/photos/types/hybrid.webp",
};

/** "Check these before you choose any installer" checklist (k1…k7). */
export const CHECKLIST_PHOTOS: Record<string, string> = {
  k1: "/photos/checklist/roof-space.webp",
  k2: "/photos/checklist/shadow-free.webp",
  k3: "/photos/checklist/sanctioned-load.webp",
  k4: "/photos/checklist/net-metering.webp",
  k5: "/photos/checklist/approved-vendor.webp",
  k6: "/photos/checklist/warranty.webp",
  k7: "/photos/checklist/after-sales.webp",
};

/** "Five simple steps" timeline (s1…s5). */
export const STEP_PHOTOS: Record<string, string> = {
  s1: "/photos/steps/learn-options.webp",
  s2: "/photos/steps/pick-system.webp",
  s3: "/photos/steps/paperwork.webp",
  s4: "/photos/steps/installation.webp",
  s5: "/photos/steps/net-meter.webp",
};

/** Round photos in the labels beside the house on /solutions/homes. */
export const HOMES_HERO_PHOTOS: Record<string, string> = {
  size: "/photos/homes-hero/rooftop-solar.webp",
  subsidy: "/photos/homes-hero/subsidy.webp",
  install: "/photos/homes-hero/installation.webp",
  net: "/photos/homes-hero/net-metering.webp",
};

/** Benefit cards (b1…b4) on /solutions/<slug>. */
export const SOLUTION_BENEFIT_PHOTOS: Record<string, string[]> = {
  homes: ["/photos/benefits/homes-b1.webp", "/photos/benefits/homes-b2.webp", "/photos/benefits/homes-b3.webp", "/photos/benefits/homes-b4.webp"],
  farms: ["/photos/benefits/farms-b1.webp", "/photos/benefits/farms-b2.webp", "/photos/benefits/farms-b3.webp", "/photos/benefits/farms-b4.webp"],
  business: ["/photos/benefits/business-b1.webp", "/photos/benefits/business-b2.webp", "/photos/benefits/business-b3.webp", "/photos/benefits/business-b4.webp"],
};
