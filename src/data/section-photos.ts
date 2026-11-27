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
  size: "/images/ui/homes/hero-size.webp",
  subsidy: "/images/ui/homes/hero-subsidy.webp",
  install: "/images/ui/homes/hero-install.webp",
  net: "/images/ui/homes/hero-net.webp",
};

/** Benefit cards (b1…b4) on /solutions/<slug>. */
export const SOLUTION_BENEFIT_PHOTOS: Record<string, string[]> = {
  homes: ["/images/ui/homes/b1.webp", "/images/ui/homes/b2.webp", "/images/ui/homes/b3.webp", "/images/ui/homes/b4.webp"],
  farms: ["/images/ui/farms/b1.webp", "/images/ui/farms/b2.webp", "/images/ui/farms/b3.webp", "/images/ui/farms/b4.webp"],
  business: ["/images/ui/business/b1.webp", "/images/ui/business/b2.webp", "/images/ui/business/b3.webp", "/images/ui/business/b4.webp"],
};

/** Illustrated icons and photos for the redesigned sections (public/images/ui). */
const UI = "/images/ui";
export const UI_IMAGES = {
  trust: { subsidy: `${UI}/trust/subsidy.webp`, years: `${UI}/trust/years.webp`, local: `${UI}/trust/team.webp`, districts: `${UI}/trust/districts.webp` },
  plan: { savings: `${UI}/plan/savings.webp`, payback: `${UI}/plan/payback.webp` },
  explain: { what: `${UI}/explain/what.webp`, cut: `${UI}/explain/cut.webp`, service: `${UI}/explain/service.webp` },
  flow: { sun: `${UI}/flow/sun.webp`, panels: `${UI}/flow/panels.webp`, inverter: `${UI}/flow/inverter.webp`, home: `${UI}/flow/home.webp`, meter: `${UI}/flow/meter.webp`, grid: `${UI}/flow/grid.webp` },
  types: { ongrid: `${UI}/types/ongrid.webp`, offgrid: `${UI}/types/offgrid.webp`, hybrid: `${UI}/types/hybrid.webp` },
  steps: { s1: `${UI}/steps/learn.webp`, s2: `${UI}/steps/pick.webp`, s3: `${UI}/steps/paperwork.webp`, s4: `${UI}/steps/install.webp`, s5: `${UI}/steps/netmeter.webp` },
  checklist: { k1: `${UI}/checklist/roof.webp`, k2: `${UI}/checklist/shade.webp`, k3: `${UI}/checklist/load.webp`, k4: `${UI}/checklist/netmeter.webp`, k5: `${UI}/checklist/vendor.webp`, k6: `${UI}/checklist/warranty.webp`, k7: `${UI}/checklist/service.webp` },
  schemes: { "pm-surya-ghar": `${UI}/schemes/pm-surya-ghar.webp`, "pm-kusum": `${UI}/schemes/pm-kusum.webp`, "net-metering": `${UI}/schemes/net-metering.webp`, "state-schemes": `${UI}/schemes/state-schemes.webp` },
  pumps: [`${UI}/farms/pump-3.webp`, `${UI}/farms/pump-5.webp`, `${UI}/farms/pump-7.webp`, `${UI}/farms/pump-10.webp`],
  farmUses: { u1: `${UI}/farms/install-pumps.webp`, u2: `${UI}/farms/install-agri.webp`, u3: `${UI}/farms/install-power.webp` },
  segments: { shops: `${UI}/business/shops.webp`, schools: `${UI}/business/schools.webp`, hospitals: `${UI}/business/hospitals.webp`, factories: `${UI}/business/factories.webp`, offices: `${UI}/business/offices.webp`, hotels: `${UI}/business/hotels.webp` },
  schemesPage: { "pm-surya-ghar": `${UI}/schemes-page/pm-surya-ghar.webp`, "pm-kusum": `${UI}/schemes-page/pm-kusum.webp`, "net-metering": `${UI}/schemes-page/net-metering.webp`, "state-schemes": `${UI}/schemes-page/state-schemes.webp` },
  subsidySteps: { s1: `${UI}/subsidy/s1.webp`, s2: `${UI}/subsidy/s2.webp`, s3: `${UI}/subsidy/s3.webp`, s4: `${UI}/subsidy/s4.webp`, s5: `${UI}/subsidy/s5.webp`, s6: `${UI}/subsidy/s6.webp` },
  pay: { l1: `${UI}/subsidy/pay-full.webp`, l2: `${UI}/subsidy/pay-loan.webp`, l3: `${UI}/subsidy/pay-emi.webp` },
  docs: { d1: `${UI}/subsidy/doc-bill.webp`, d2: `${UI}/subsidy/doc-aadhaar.webp`, d3: `${UI}/subsidy/doc-bank.webp`, d4: `${UI}/subsidy/doc-ownership.webp`, d5: `${UI}/subsidy/doc-photo.webp` },
  values: [`${UI}/about/v1.webp`, `${UI}/about/v2.webp`, `${UI}/about/v3.webp`, `${UI}/about/v4.webp`],
  working: [`${UI}/about/w1.webp`, `${UI}/about/w2.webp`, `${UI}/about/w3.webp`, `${UI}/about/w4.webp`],
} as const;
