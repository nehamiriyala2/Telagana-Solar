import type { L10n } from "@/lib/types";

/**
 * Words painted in amber inside each page title (must match words in the title, per language).
 * Titles themselves live in messages/*.json.
 */
export const titleEmphasis = {
  schemes: { en: "Telangana", te: "తెలంగాణలో" },
  about: { en: "own power", te: "కరెంటు" },
  projects: { en: "Real installations", te: "నిజమైన" },
  calculator: { en: "save", te: "ఆదా" },
  subsidy: { en: "made simple", te: "సులభంగా" },
  contact: { en: "solar plan", te: "సోలార్ ప్లాన్" },
  solutions: { en: "roof field", te: "పైకప్పుకు పొలానికి" },
  homes: { en: "sunlight", te: "ఎండతో" },
  farms: { en: "sunlight", te: "ఎండతో" },
  business: { en: "Lower", te: "తక్కువ" },
  notFound: { en: "shade", te: "నీడలో" },
  plan: { en: "Solar Plan", te: "సోలార్ ప్లాన్" },
  "pm-surya-ghar": { en: "Surya Ghar", te: "సూర్య ఘర్" },
  "pm-kusum": { en: "PM-KUSUM", te: "పీఎం-కుసుమ్" },
  "net-metering": { en: "net metering", te: "నెట్ మీటరింగ్" },
  "state-schemes": { en: "state schemes", te: "రాష్ట్ర పథకాలు" },
} satisfies Record<string, L10n>;

export type EmphasisKey = keyof typeof titleEmphasis;
