export type Locale = "en" | "te";
export type L10n = { en: string; te: string };

export type Persona = "urban" | "apartment" | "rural" | "farmer" | "business";
export type Supply = "reliable" | "occasional" | "frequent" | "remote";
export type SolarType = "on-grid" | "hybrid" | "off-grid" | "pumpset" | "community" | "commercial";
export type SchemeCategory = "home" | "farmer" | "business" | "apartment";
export type SchemeLevel = "central" | "telangana";

/** Every record whose numbers come from an official source carries this. */
export interface Verifiable {
  /** ISO date the figures were last checked on the official site, or null if never. */
  lastVerified: string | null;
  verified: boolean;
  sourceUrl?: string;
}

export interface District {
  slug: string;
  name: L10n;
  /** 1 = Hyderabad metro launch region, 2 = rest of Telangana */
  phase: 1 | 2;
  /** Optional override of the default peak sun hours */
  sunHours?: number;
  lat: number;
  lng: number;
}

export interface SubsidyTier {
  /** Applies to capacity from the previous tier's upToKw up to this value */
  upToKw: number;
  /** Rupees per kW in this tier */
  perKw: number;
}

export interface SubsidyRule {
  kind: "per-kw-tiers" | "percent-of-cost" | "none";
  tiers?: SubsidyTier[];
  percent?: number;
  /** Maximum subsidy in rupees */
  cap?: number;
  /** Max capacity the subsidy is calculated on */
  maxKw?: number;
}

export interface Scheme extends Verifiable {
  slug: string;
  level: SchemeLevel;
  categories: SchemeCategory[];
  /** Personas this subsidy rule is applied to in calculators */
  appliesTo: Persona[];
  name: L10n;
  short: L10n;
  what: L10n;
  eligibility: L10n[];
  benefit: L10n;
  documents: L10n[];
  steps: { title: L10n; detail: L10n }[];
  officialUrl: string;
  subsidy: SubsidyRule;
}

export interface Installer {
  id: string;
  name: string;
  district: string;
  area: string;
  lat: number;
  lng: number;
  phone: string;
  whatsapp: string;
  types: SolarType[];
  services: L10n[];
  verified: boolean;
  rating: number;
  reviews: number;
  /** Seed/demo listing, not a real business */
  sample: boolean;
}

export interface Appliance {
  id: string;
  icon: string;
  name: L10n;
  watts: number;
  defaultHours: number;
  defaultQty: number;
  /** Optional efficient variant the user can switch to, e.g. BLDC fan */
  variant?: { name: L10n; watts: number };
}

export interface TariffSlab {
  /** Upper bound of the slab in units (inclusive). null = no upper bound. */
  upTo: number | null;
  rate: number;
}

/** Telescopic slab groups: the group is chosen by total monthly units. */
export interface TariffGroup {
  maxUnits: number | null;
  slabs: TariffSlab[];
}

export interface Tariff extends Verifiable {
  id: "domestic" | "commercial";
  discom: string;
  label: L10n;
  groups: TariffGroup[];
  /** Fixed/customer charges per month in rupees (flat approximation) */
  fixedPerMonth: number;
  /** Electricity duty in rupees per unit */
  dutyPerUnit: number;
}

export interface CostRange { min: number; max: number }

export interface Assumptions extends Verifiable {
  sunHours: number;
  /** System performance ratio (losses: heat, wiring, inverter) */
  performanceRatio: number;
  /** Approx roof area per kW in sq ft */
  sqftPerKw: number;
  costPerKw: Record<"on-grid" | "hybrid" | "off-grid" | "commercial", CostRange>;
  batteryPerKwh: CostRange;
  /** Pumpset installed cost per HP */
  pumpPerHp: CostRange;
  /** Annual tariff escalation, e.g. 0.03 */
  tariffEscalation: number;
  /** Annual panel output degradation, e.g. 0.005 */
  degradation: number;
  /** kg CO2 avoided per kWh */
  co2PerKwh: number;
  lifetimeYears: number;
}
