/**
 * Savings calculator. Pure functions; every number comes from src/config/calculator.ts.
 * Used by the home widget, the calculator page, packages and the lead tagger.
 */
import { calculatorConfig as C, type PropertyType, type SubsidyRule } from "@/config/calculator";

export type InputMode = "bill" | "units";

export interface CalcInput {
  type: PropertyType;
  mode: InputMode;
  /** ₹ per month when mode = bill, units per month when mode = units */
  value: number;
  /** Optional usable roof area in sq ft: caps the system size */
  roofSqft?: number | null;
  district?: string | null;
  /** Override the subsidy rule (e.g. apartment RWA rule) */
  subsidyRule?: SubsidyRule;
}

export interface YearPoint { year: number; cumulative: number; net: number }

export interface CalcResult {
  type: PropertyType;
  monthlyBill: number;
  monthlyUnits: number;
  kw: number;
  /** true when roof area limited the size */
  roofLimited: boolean;
  roofNeededSqft: number;
  generationMonthly: number;
  cost: number;
  subsidy: number;
  netCost: number;
  monthlySaving: number;
  yearlySaving: number;
  paybackYears: number | null;
  co2TonnesYear: number;
  lifetimeSaving: number;
  projection: YearPoint[];
}

export const tariff = (t: PropertyType) => C.tariffPerUnit[t];
export const unitsFromBill = (bill: number, t: PropertyType) => Math.max(0, bill / tariff(t));
export const billFromUnits = (units: number, t: PropertyType) => Math.max(0, units * tariff(t));

export function sizeKw(monthlyUnits: number, t: PropertyType): number {
  if (monthlyUnits <= 0) return 0;
  const raw = monthlyUnits / C.generationPerKwMonth;
  const stepped = Math.ceil(raw / C.kwStep) * C.kwStep;
  return Math.min(C.maxKw[t], Math.max(C.minKw, stepped));
}

export function subsidyFor(rule: SubsidyRule, kw: number, cost: number): number {
  if (rule.kind === "none") return 0;
  let amount = 0;
  if (rule.kind === "percent") amount = (cost * rule.percent) / 100;
  if (rule.kind === "per-kw-tiers") {
    let prev = 0;
    for (const tier of rule.tiers) {
      const inTier = Math.max(0, Math.min(kw, tier.uptoKw) - prev);
      amount += inTier * tier.perKw;
      prev = tier.uptoKw;
    }
  }
  if (rule.cap !== null && rule.cap !== undefined) amount = Math.min(amount, rule.cap);
  return Math.round(Math.min(amount, cost));
}

export function calculate(input: CalcInput): CalcResult {
  const t = input.type;
  const monthlyUnits = input.mode === "bill" ? unitsFromBill(input.value, t) : input.value;
  const monthlyBill = input.mode === "bill" ? input.value : billFromUnits(input.value, t);

  let kw = sizeKw(monthlyUnits, t);
  let roofLimited = false;
  if (input.roofSqft && input.roofSqft > 0) {
    const maxByRoof = Math.floor(input.roofSqft / C.sqftPerKw / C.kwStep) * C.kwStep;
    if (maxByRoof < kw) { kw = Math.max(0, maxByRoof); roofLimited = true; }
  }

  const generationMonthly = kw * C.generationPerKwMonth;
  const cost = Math.round(kw * C.costPerKw[t]);
  const subsidy = subsidyFor(input.subsidyRule ?? C.subsidy[t], kw, cost);
  const netCost = cost - subsidy;
  // Savings are capped at the bill: you cannot save more units than you use (net metering export not credited here).
  const savedUnits = Math.min(generationMonthly, monthlyUnits);
  const monthlySaving = Math.round(savedUnits * tariff(t));
  const yearlySaving = monthlySaving * 12;

  const projection: YearPoint[] = [];
  let cumulative = 0;
  for (let y = 1; y <= C.lifetimeYears; y++) {
    const factor = Math.pow(1 + C.tariffEscalation, y - 1) * Math.pow(1 - C.degradation, y - 1);
    cumulative += yearlySaving * factor;
    projection.push({ year: y, cumulative: Math.round(cumulative), net: Math.round(cumulative - netCost) });
  }

  let paybackYears: number | null = null;
  if (netCost <= 0) paybackYears = 0;
  else {
    let prev = 0;
    for (const p of projection) {
      if (p.cumulative >= netCost) {
        paybackYears = Math.round((p.year - 1 + (netCost - prev) / (p.cumulative - prev || 1)) * 10) / 10;
        break;
      }
      prev = p.cumulative;
    }
  }

  return {
    type: t, monthlyBill: Math.round(monthlyBill), monthlyUnits: Math.round(monthlyUnits), kw, roofLimited,
    roofNeededSqft: Math.round(kw * C.sqftPerKw), generationMonthly: Math.round(generationMonthly),
    cost, subsidy, netCost, monthlySaving, yearlySaving, paybackYears,
    co2TonnesYear: Math.round(((savedUnits * 12 * C.co2KgPerUnit) / 1000) * 10) / 10,
    lifetimeSaving: projection.at(-1)?.cumulative ?? 0,
    projection,
  };
}

/** For package cards: typical monthly bill range this size suits, and its generation. */
export function packageFacts(kw: number, t: PropertyType) {
  const gen = kw * C.generationPerKwMonth;
  const bill = gen * tariff(t);
  const round = (n: number) => Math.round(n / 500) * 500;
  return { generationMonthly: Math.round(gen), billMin: round(bill * 0.75), billMax: round(bill * 1.1) };
}

/** Compact summary stored with a lead and sent on WhatsApp/email. */
export function summarize(r: CalcResult) {
  return {
    type: r.type, monthlyBill: r.monthlyBill, monthlyUnits: r.monthlyUnits, kw: r.kw,
    cost: r.cost, subsidy: r.subsidy, netCost: r.netCost, monthlySaving: r.monthlySaving,
    yearlySaving: r.yearlySaving, paybackYears: r.paybackYears, co2TonnesYear: r.co2TonnesYear,
  };
}
export type CalcSummary = ReturnType<typeof summarize>;
