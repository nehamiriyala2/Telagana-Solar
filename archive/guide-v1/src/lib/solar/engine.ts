/**
 * Telangana Solar calculation engine.
 * Pure functions: same logic powers the Solar Finder, calculators and the AI
 * assistant. All numbers come from the data layer (DB/seed), never hardcoded.
 */
import type {
  Appliance, Assumptions, CostRange, District, Installer, Persona, Scheme,
  SolarType, Supply, Tariff,
} from "@/lib/types";

export interface SolarData {
  assumptions: Assumptions;
  tariffs: Tariff[];
  schemes: Scheme[];
  installers: Installer[];
  districts: District[];
}

/* ------------------------------------------------------------------ Tariff */

/** Energy charge using telescopic slab groups chosen by total units. */
export function energyCharge(units: number, tariff: Tariff): number {
  if (units <= 0) return 0;
  const group = tariff.groups.find((g) => g.maxUnits === null || units <= g.maxUnits) ?? tariff.groups[tariff.groups.length - 1];
  let remaining = units;
  let prev = 0;
  let total = 0;
  for (const slab of group.slabs) {
    const cap = slab.upTo === null ? Infinity : slab.upTo - prev;
    const used = Math.min(remaining, cap);
    total += used * slab.rate;
    remaining -= used;
    prev = slab.upTo ?? prev;
    if (remaining <= 0) break;
  }
  return total;
}

export interface BillBreakdown { units: number; energy: number; fixed: number; duty: number; total: number }

export function estimateBill(units: number, tariff: Tariff): BillBreakdown {
  const u = Math.max(0, Math.round(units));
  const energy = energyCharge(u, tariff);
  const fixed = tariff.fixedPerMonth;
  const duty = u * tariff.dutyPerUnit;
  return { units: u, energy, fixed, duty, total: Math.round(energy + fixed + duty) };
}

/** Inverse of estimateBill via binary search (bills are monotonic in units). */
export function unitsFromBill(bill: number, tariff: Tariff): number {
  if (bill <= tariff.fixedPerMonth) return 0;
  let lo = 0;
  let hi = 20000;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (estimateBill(mid, tariff).total < bill) lo = mid; else hi = mid;
  }
  return Math.round(hi);
}

export const tariffFor = (persona: Persona, tariffs: Tariff[]) =>
  tariffs.find((t) => t.id === (persona === "business" ? "commercial" : "domestic")) ?? tariffs[0];

/* ------------------------------------------------------------------ Sizing */

export const unitsPerKwDay = (a: Assumptions, d?: District) => (d?.sunHours ?? a.sunHours) * a.performanceRatio;
export const unitsPerKwMonth = (a: Assumptions, d?: District) => unitsPerKwDay(a, d) * 30;

/** system kW = units/day ÷ (sun hours × performance ratio), rounded up, min 1. */
export function systemKw(unitsPerDay: number, a: Assumptions, d?: District): number {
  if (unitsPerDay <= 0) return 0;
  return Math.max(1, Math.ceil(unitsPerDay / unitsPerKwDay(a, d)));
}

export const roofSqft = (kw: number, a: Assumptions) => Math.round(kw * a.sqftPerKw);

/* ---------------------------------------------------------------- Subsidy */

export function subsidyFor(scheme: Scheme, kw: number, cost: number): number {
  const r = scheme.subsidy;
  if (r.kind === "none") return 0;
  if (r.kind === "percent-of-cost") return Math.round(cost * (r.percent ?? 0));
  const capKw = Math.min(kw, r.maxKw ?? Infinity);
  let prev = 0;
  let total = 0;
  for (const t of r.tiers ?? []) {
    const inTier = Math.max(0, Math.min(capKw, t.upToKw) - prev);
    total += inTier * t.perKw;
    prev = t.upToKw;
  }
  return Math.round(Math.min(total, r.cap ?? Infinity));
}

export function bestSubsidy(persona: Persona, kw: number, cost: number, schemes: Scheme[]) {
  let best: { amount: number; scheme: Scheme | null } = { amount: 0, scheme: null };
  for (const s of schemes) {
    if (!s.appliesTo.includes(persona)) continue;
    const amount = Math.min(subsidyFor(s, kw, cost), cost);
    if (amount > best.amount) best = { amount, scheme: s };
  }
  return best;
}

export function matchingSchemes(persona: Persona, schemes: Scheme[]) {
  const cat = persona === "farmer" ? "farmer" : persona === "business" ? "business" : persona === "apartment" ? "apartment" : "home";
  return schemes.filter((s) => s.categories.includes(cat));
}

/* -------------------------------------------------------------- Projection */

export interface YearPoint { year: number; savings: number; cumulative: number; net: number }

export function projectSavings(opts: {
  monthlyUnits: number; kw: number; netCost: number; tariff: Tariff; a: Assumptions; district?: District;
}): YearPoint[] {
  const { monthlyUnits, kw, netCost, tariff, a, district } = opts;
  const out: YearPoint[] = [];
  let cumulative = 0;
  for (let y = 1; y <= a.lifetimeYears; y++) {
    const gen = kw * unitsPerKwMonth(a, district) * Math.pow(1 - a.degradation, y - 1);
    const base = estimateBill(monthlyUnits, tariff).total;
    const after = estimateBill(Math.max(0, monthlyUnits - gen), tariff).total;
    const savings = Math.round((base - after) * 12 * Math.pow(1 + a.tariffEscalation, y - 1));
    cumulative += savings;
    out.push({ year: y, savings, cumulative, net: cumulative - netCost });
  }
  return out;
}

export function paybackYears(points: YearPoint[], netCost: number): number | null {
  if (netCost <= 0) return 0;
  let prev = 0;
  for (const p of points) {
    if (p.cumulative >= netCost) {
      const frac = (netCost - prev) / (p.cumulative - prev || 1);
      return Math.round((p.year - 1 + frac) * 10) / 10;
    }
    prev = p.cumulative;
  }
  return null;
}

const range = (r: CostRange, k: number): CostRange => ({ min: Math.round(r.min * k), max: Math.round(r.max * k) });
const add = (x: CostRange, y: CostRange): CostRange => ({ min: x.min + y.min, max: x.max + y.max });

/* -------------------------------------------------------------- Finder */

export interface FinderInput {
  persona: Persona;
  district: string;
  supply: Supply;
  /** Monthly bill in rupees (ignored for farmers) */
  bill?: number;
  /** Pump size in HP (farmers) */
  pumpHp?: number;
}

export interface FinderResult {
  type: SolarType;
  needsBattery: boolean;
  kw: number;
  batteryKwh: number;
  roofSqft: number;
  monthlyUnits: number;
  generationMonthly: number;
  cost: CostRange;
  subsidy: number;
  subsidyScheme: Scheme | null;
  costAfterSubsidy: CostRange;
  monthlySavings: number;
  paybackYears: number | null;
  co2TonnesPerYear: number;
  schemes: Scheme[];
  installers: Installer[];
  /** Short reasons used for "why this?" copy (i18n keys) */
  reasons: string[];
  lessons: { href: string; key: string }[];
  projection: YearPoint[];
}

export function recommend(input: FinderInput, data: SolarData): FinderResult {
  const { assumptions: a, tariffs, schemes, installers, districts } = data;
  const district = districts.find((d) => d.slug === input.district);
  const tariff = tariffFor(input.persona, tariffs);
  const reasons: string[] = [];

  // --- Farmer: solar pumpset (PM-KUSUM). Agricultural power is billed differently, so size by pump HP.
  if (input.persona === "farmer") {
    const hp = input.pumpHp ?? 5;
    const kw = Math.ceil(hp);
    const cost = range(a.pumpPerHp, hp);
    const sub = bestSubsidy("farmer", kw, (cost.min + cost.max) / 2, schemes);
    const pct = sub.scheme?.subsidy.kind === "percent-of-cost" ? sub.scheme.subsidy.percent ?? 0 : 0;
    reasons.push("finder.reason.farmer");
    const gen = kw * unitsPerKwMonth(a, district);
    return {
      type: "pumpset", needsBattery: false, kw, batteryKwh: 0, roofSqft: roofSqft(kw, a),
      monthlyUnits: 0, generationMonthly: Math.round(gen), cost,
      subsidy: Math.round(((cost.min + cost.max) / 2) * pct), subsidyScheme: sub.scheme,
      costAfterSubsidy: { min: Math.round(cost.min * (1 - pct)), max: Math.round(cost.max * (1 - pct)) },
      monthlySavings: 0, paybackYears: null,
      co2TonnesPerYear: Math.round(((gen * 12 * a.co2PerKwh) / 1000) * 10) / 10,
      schemes: matchingSchemes("farmer", schemes),
      installers: nearbyInstallers(installers, input.district, "pumpset"),
      reasons, lessons: lessonsFor("pumpset"), projection: [],
    };
  }

  const monthlyUnits = unitsFromBill(input.bill ?? 0, tariff);
  let kw = systemKw(monthlyUnits / 30, a, district);

  // --- Choose type
  let type: SolarType;
  if (input.persona === "apartment") {
    type = "community";
    kw = Math.min(kw, 3);
    reasons.push("finder.reason.apartment");
  } else if (input.persona === "business") {
    type = input.supply === "frequent" || input.supply === "remote" ? "hybrid" : "commercial";
    reasons.push(type === "hybrid" ? "finder.reason.businessBackup" : "finder.reason.business");
  } else if (input.supply === "remote") {
    type = "off-grid";
    reasons.push("finder.reason.remote");
  } else if (input.supply === "frequent") {
    type = "hybrid";
    reasons.push("finder.reason.frequent");
  } else {
    type = "on-grid";
    reasons.push(input.supply === "occasional" ? "finder.reason.occasional" : "finder.reason.reliable");
  }

  const needsBattery = type === "hybrid" || type === "off-grid";
  const batteryKwh = type === "off-grid" ? Math.ceil((monthlyUnits / 30) * 1.2) : type === "hybrid" ? kw * 2 : 0;

  const perKw = type === "community" ? a.costPerKw["on-grid"] : type === "commercial" ? a.costPerKw.commercial : a.costPerKw[type as "on-grid" | "hybrid" | "off-grid"];
  let cost = range(perKw, kw);
  if (needsBattery && type === "off-grid") cost = add(cost, range(a.batteryPerKwh, batteryKwh * 0.5)); // off-grid per-kW already includes a base bank

  const mid = (cost.min + cost.max) / 2;
  // Central residential subsidy applies to grid-connected systems
  const sub = type === "off-grid" ? { amount: 0, scheme: null } : bestSubsidy(input.persona, kw, mid, schemes);
  const costAfterSubsidy = { min: Math.max(0, cost.min - sub.amount), max: Math.max(0, cost.max - sub.amount) };
  const netMid = (costAfterSubsidy.min + costAfterSubsidy.max) / 2;

  const projection = projectSavings({ monthlyUnits, kw, netCost: netMid, tariff, a, district });
  const monthlySavings = Math.round((projection[0]?.savings ?? 0) / 12);
  const gen = kw * unitsPerKwMonth(a, district);

  return {
    type, needsBattery, kw, batteryKwh, roofSqft: roofSqft(kw, a), monthlyUnits,
    generationMonthly: Math.round(gen), cost, subsidy: sub.amount, subsidyScheme: sub.scheme,
    costAfterSubsidy, monthlySavings, paybackYears: paybackYears(projection, netMid),
    co2TonnesPerYear: Math.round(((Math.min(gen, monthlyUnits || gen) * 12 * a.co2PerKwh) / 1000) * 10) / 10,
    schemes: matchingSchemes(input.persona, schemes),
    installers: nearbyInstallers(installers, input.district, type),
    reasons, lessons: lessonsFor(type), projection,
  };
}

export function nearbyInstallers(all: Installer[], district: string, type?: SolarType, limit = 3) {
  const score = (i: Installer) =>
    (i.district === district ? 4 : 0) + (type && i.types.includes(type) ? 2 : 0) + (i.verified ? 1 : 0) + i.rating / 10;
  return [...all].sort((x, y) => score(y) - score(x)).slice(0, limit);
}

function lessonsFor(type: SolarType) {
  const base = [
    { href: "/schemes", key: "lessons.schemes" },
    { href: "/what-can-solar-run", key: "lessons.appliances" },
    { href: "/bill-calculator", key: "lessons.bill" },
  ];
  if (type === "hybrid" || type === "off-grid") base.unshift({ href: "/what-can-solar-run", key: "lessons.battery" });
  if (type === "pumpset") base.unshift({ href: "/schemes?category=farmer", key: "lessons.kusum" });
  return base.slice(0, 3);
}

/* ------------------------------------------------------------ Appliances */

export interface ApplianceRow { appliance: Appliance; qty: number; hours: number; watts: number }

export function applianceRow(r: ApplianceRow, a: Assumptions) {
  const unitsDay = (r.watts * r.qty * r.hours) / 1000;
  const kw = unitsDay / unitsPerKwDay(a);
  return { unitsDay, unitsMonth: unitsDay * 30, sqft: Math.round(kw * a.sqftPerKw) };
}

/**
 * @param hasCuts user reports power cuts → battery needed.
 * Battery kWh covers ~40% of daily use after sunset, excluding heavy loads
 * (AC, geyser) that are impractical to run on battery.
 */
export function applianceTotals(rows: ApplianceRow[], a: Assumptions, hasCuts = false) {
  const totalWatts = rows.reduce((s, r) => s + r.watts * r.qty, 0);
  const unitsDay = rows.reduce((s, r) => s + (r.watts * r.qty * r.hours) / 1000, 0);
  const essentialDay = rows.filter((r) => r.watts < 1500).reduce((s, r) => s + (r.watts * r.qty * r.hours) / 1000, 0);
  const kw = systemKw(unitsDay, a);
  const heavy = rows.some((r) => r.qty > 0 && r.watts >= 1500);
  return {
    totalWatts, unitsDay, unitsMonth: unitsDay * 30, kw, sqft: roofSqft(kw, a),
    batteryNeeded: hasCuts && unitsDay > 0,
    batteryKwh: hasCuts ? Math.max(1, Math.ceil(essentialDay * 0.4)) : 0,
    heavy,
  };
}
