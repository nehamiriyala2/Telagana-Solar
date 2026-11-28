/**
 * WhatsApp message templates (wa_templates) with variables {name} {kw} {district} {area} {phone}.
 * Lookup order: lead's language → English → built-in default below.
 * Defaults promise no savings or subsidy amounts.
 */
export const TEMPLATE_KEYS = ["welcome", "day1", "day3", "day7", "quote_sent", "install_done"] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];
export const TEMPLATE_VARS = ["name", "kw", "district", "area", "phone"] as const;
export type TemplateVars = Partial<Record<(typeof TEMPLATE_VARS)[number], string | null | undefined>>;

export const DEFAULT_TEMPLATES: Record<TemplateKey, { en: string; te: string }> = {
  welcome: {
    en: "Hello {name}, this is Telangana Solar. Thank you for your enquiry. We'd like to understand your roof and electricity use so we can suggest the right system. When is a good time to talk?",
    te: "నమస్కారం {name} గారు, మేము తెలంగాణ సోలార్ నుండి. మీ విచారణకు ధన్యవాదాలు. మీకు సరైన సిస్టమ్ సూచించడానికి మీ పైకప్పు, విద్యుత్ వినియోగం గురించి తెలుసుకోవాలనుకుంటున్నాం. మాట్లాడటానికి మీకు ఎప్పుడు వీలవుతుంది?",
  },
  day1: {
    en: "Hello {name}, following up from Telangana Solar. Do you have any questions about solar for your place in {area}? Happy to help.",
    te: "నమస్కారం {name} గారు, తెలంగాణ సోలార్ నుండి మళ్ళీ సంప్రదిస్తున్నాం. {area}లో మీ ఇంటికి సోలార్ గురించి ఏమైనా సందేహాలు ఉన్నాయా? సహాయం చేయడానికి సిద్ధంగా ఉన్నాం.",
  },
  day3: {
    en: "Hello {name}, this is Telangana Solar following up. If you share a photo of your roof and your latest electricity bill on WhatsApp, we can suggest the right system size for your home in {district}.",
    te: "నమస్కారం {name} గారు, తెలంగాణ సోలార్ నుండి మళ్ళీ సంప్రదిస్తున్నాం. మీ పైకప్పు ఫోటో, తాజా కరెంటు బిల్లు వాట్సాప్‌లో పంపితే, {district}లో మీ ఇంటికి సరైన సిస్టమ్ సైజు సూచిస్తాం.",
  },
  day7: {
    en: "Hello {name}, just checking in from Telangana Solar. If now is not the right time, no problem. Reply any time and we'll pick it up from here.",
    te: "నమస్కారం {name} గారు, తెలంగాణ సోలార్ నుండి. ఇప్పుడు సరైన సమయం కాకపోతే పర్వాలేదు. ఎప్పుడైనా రిప్లై ఇవ్వండి, మేము కొనసాగిస్తాం.",
  },
  quote_sent: {
    en: "Hello {name}, we've shared the quote for your {kw} system. Please go through it and tell us if you have any questions.",
    te: "నమస్కారం {name} గారు, మీ {kw} సిస్టమ్ కోట్ పంపించాం. దయచేసి చూసి, ఏమైనా సందేహాలు ఉంటే తెలియజేయండి.",
  },
  install_done: {
    en: "Hello {name}, your solar system is installed. Thank you for choosing Telangana Solar! Save this number for any service help.",
    te: "నమస్కారం {name} గారు, మీ సోలార్ సిస్టమ్ ఇన్‌స్టాల్ అయ్యింది. తెలంగాణ సోలార్‌ను ఎంచుకున్నందుకు ధన్యవాదాలు! సర్వీస్ సహాయం కోసం ఈ నంబర్‌ను సేవ్ చేసుకోండి.",
  },
};

/** Variables in a body that are not allowed (shown highlighted; saving is blocked). */
export function unknownVars(body: string): string[] {
  const found = [...body.matchAll(/\{([^{}\s]*)\}/g)].map((m) => m[1]);
  return [...new Set(found.filter((v) => !(TEMPLATE_VARS as readonly string[]).includes(v)))];
}

/** Fills {vars}. Missing values: {name} → "there"/"గారు"-safe blank, others removed cleanly. */
export function renderTemplate(body: string, vars: TemplateVars): string {
  return body
    .replace(/\{(name|kw|district|area|phone)\}/g, (_, k: keyof TemplateVars) => {
      const v = vars[k];
      if (v && String(v).trim()) return String(v).trim();
      return k === "name" ? "" : "";
    })
    .replace(/ {2,}/g, " ")
    .replace(/ ([,.!?])/g, "$1")
    .replace(/(Hello|నమస్కారం) ,/g, "$1,")
    .trim();
}

/** Picks the body: DB row for the lead's language, else English, else built-in. */
export function pickTemplate(key: TemplateKey, lang: string | null | undefined, rows: { key: string; lang: string; body: string; active: number | boolean }[]): string {
  const active = rows.filter((r) => r.key === key && Boolean(r.active));
  const l = lang === "te" ? "te" : "en";
  return active.find((r) => r.lang === l)?.body ?? active.find((r) => r.lang === "en")?.body ?? DEFAULT_TEMPLATES[key][l] ?? DEFAULT_TEMPLATES[key].en;
}
