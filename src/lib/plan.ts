/**
 * "Find My Solar Plan" and "Check My Subsidy" logic.
 * All numbers come from src/config/calculator.ts (tariff, generation, cost, scheme rules).
 */
import { calculatorConfig as C, schemeRules } from "@/config/calculator";
import { personaConfig, type Persona } from "@/config/personas";
import type { SchemeSlug } from "@/config/schemes";
import { calcSettings, calculate, subsidyFor, summarize, type CalcResult } from "./calculator";
import type { SubsidyRule } from "@/config/calculator";

/** The subsidy rule that applies to this scheme for this visitor (apartments use the RWA rule). */
export function schemeRuleFor(slug: SchemeSlug, persona: Persona): SubsidyRule {
  if (slug === "pm-surya-ghar" && persona === "apartment") return schemeRules["pm-surya-ghar-rwa"];
  return schemeRules[slug];
}

/** Main subsidy used to work out net cost and payback. */
function mainRule(persona: Persona): SubsidyRule | undefined {
  const s = personaConfig[persona].schemes;
  if (s.includes("pm-surya-ghar")) return schemeRuleFor("pm-surya-ghar", persona);
  if (s.includes("pm-kusum")) return schemeRules["pm-kusum"];
  return { kind: "none" };
}

export interface PlanScheme { slug: SchemeSlug; amount: number | null }
export interface Plan {
  persona: Persona;
  type: "ongrid" | "hybrid" | "pump" | "commercial";
  calc: CalcResult;
  costMin: number;
  costMax: number;
  schemes: PlanScheme[];
}

export function buildPlan({ persona, bill, roofSqft, district }: { persona: Persona; bill: number; roofSqft: number | null; district: string }): Plan {
  const cfg = personaConfig[persona];
  const calc = calculate({ type: cfg.type, mode: "bill", value: bill, roofSqft, district, subsidyRule: mainRule(persona) });
  const spread = C.costRangeSpread;
  const schemes = (cfg.schemes as SchemeSlug[]).map((slug) => {
    const rule = schemeRuleFor(slug, persona);
    const amount = rule.kind === "none" ? null : subsidyFor(rule, calc.kw, calc.cost);
    return { slug, amount: amount && amount > 0 ? amount : null };
  });
  return {
    persona, type: cfg.recommend, calc,
    costMin: Math.round((calc.cost * (1 - spread)) / 1000) * 1000,
    costMax: Math.round((calc.cost * (1 + spread)) / 1000) * 1000,
    schemes,
  };
}

export const planSummary = (p: Plan) => summarize(p.calc);

/* ---------------------------------------------------------------- Subsidy checker */

export type SubsidyStatus = "likely" | "check" | "owner";
export interface SubsidyResult { slug: SchemeSlug; status: SubsidyStatus; explain: string; amount: number | null }

export function checkSubsidy({ persona, mode, value, own }: { persona: Persona; mode: "kw" | "bill"; value: number; own: boolean }): { kw: number; results: SubsidyResult[] } {
  const cfg = personaConfig[persona];
  const kw = mode === "kw" ? Math.max(0, value) : calculate({ type: cfg.type, mode: "bill", value }).kw;
  const cost = Math.round(kw * calcSettings().costPerKw[cfg.type]);
  const est = (slug: SchemeSlug) => {
    const rule = schemeRuleFor(slug, persona);
    const a = rule.kind === "none" ? 0 : subsidyFor(rule, kw, cost);
    return a > 0 ? a : null;
  };

  const results: SubsidyResult[] = [];
  if (persona === "urban") {
    results.push(own
      ? { slug: "pm-surya-ghar", status: "likely", explain: "psgOwn", amount: est("pm-surya-ghar") }
      : { slug: "pm-surya-ghar", status: "owner", explain: "psgRented", amount: est("pm-surya-ghar") });
  }
  if (persona === "apartment") results.push({ slug: "pm-surya-ghar", status: "likely", explain: "psgApartment", amount: est("pm-surya-ghar") });
  if (persona === "farmer") results.push({ slug: "pm-kusum", status: "check", explain: "kusum", amount: est("pm-kusum") });
  if (persona !== "farmer") results.push({ slug: "net-metering", status: own || persona === "apartment" ? "likely" : "owner", explain: "net", amount: null });
  results.push({ slug: "state-schemes", status: "check", explain: "state", amount: null });
  return { kw, results };
}
