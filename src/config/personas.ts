import type { PropertyType } from "./calculator";

/**
 * "Which solar is right for you?" visitor types. Text lives in messages/*.json under personas.<slug>.
 * Each persona gets its own page at /for/<slug>.
 */
export const PERSONAS = ["urban", "apartment", "farmer", "shop", "factory", "institution", "landlord"] as const;
export type Persona = (typeof PERSONAS)[number];

export const personaConfig: Record<Persona, {
  type: PropertyType;               // used by forms, calculator and lead tags
  solution: "homes" | "farms" | "business";
  schemes: string[];                // slugs from src/config/schemes.ts
  faq: string[];                    // keys from messages faq.*
  recommend: "ongrid" | "hybrid" | "pump" | "commercial";
}> = {
  urban:       { type: "home",     solution: "homes",    schemes: ["pm-surya-ghar", "net-metering"], faq: ["q1", "q2", "q3", "q7"], recommend: "ongrid" },
  apartment:   { type: "home",     solution: "homes",    schemes: ["pm-surya-ghar", "net-metering"], faq: ["q1", "q2", "q5", "q7"], recommend: "ongrid" },
  farmer:      { type: "farm",     solution: "farms",    schemes: ["pm-kusum", "state-schemes"],     faq: ["q1", "q4", "q5", "q6"], recommend: "pump" },
  shop:        { type: "business", solution: "business", schemes: ["net-metering", "state-schemes"], faq: ["q1", "q3", "q6", "q7"], recommend: "commercial" },
  factory:     { type: "business", solution: "business", schemes: ["net-metering", "state-schemes"], faq: ["q1", "q3", "q5", "q8"], recommend: "commercial" },
  institution: { type: "business", solution: "business", schemes: ["net-metering", "state-schemes"], faq: ["q1", "q3", "q4", "q8"], recommend: "hybrid" },
  landlord:    { type: "home",     solution: "homes",    schemes: ["pm-surya-ghar", "net-metering"], faq: ["q2", "q5", "q7", "q8"], recommend: "ongrid" },
};

/** Visitor types offered in Find My Solar Plan and Check My Subsidy. */
export const GUIDE_PERSONAS = ["urban", "apartment", "farmer", "shop", "factory", "institution"] as const satisfies readonly Persona[];
export type GuidePersona = (typeof GUIDE_PERSONAS)[number];
