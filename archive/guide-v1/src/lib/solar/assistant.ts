import type { Persona, Supply } from "@/lib/types";
import { recommend, type FinderInput, type FinderResult, type SolarData } from "./engine";
import { formatINR, formatNum, formatRange, pick } from "@/lib/utils";

/** Best-effort extraction of Finder inputs from free text (English + Telugu). */
export function parseQuestion(text: string, data: SolarData): Partial<FinderInput> {
  const lower = text.toLowerCase();
  const out: Partial<FinderInput> = {};

  const money = lower.match(/(?:₹|rs\.?|inr|rupees?)\s*([\d,]+)/) ?? lower.match(/([\d,]{3,})\s*(?:₹|rs|rupees?|రూపాయ)/) ?? lower.match(/bill[^\d]{0,20}([\d,]{3,})/);
  if (money) out.bill = Number(money[1].replace(/,/g, ""));
  const hp = lower.match(/(\d+(?:\.\d+)?)\s*hp/);
  if (hp) out.pumpHp = Number(hp[1]);

  const has = (...words: string[]) => words.some((w) => lower.includes(w));
  if (has("farm", "pump", "agri", "రైతు", "పంపు", "పొలం")) out.persona = "farmer";
  else if (has("apartment", "flat", "gated", "అపార్ట్", "ఫ్లాట్")) out.persona = "apartment";
  else if (has("shop", "business", "office", "school", "factory", "వ్యాపార", "దుకాణ")) out.persona = "business";
  else if (has("village", "rural", "గ్రామ")) out.persona = "rural";

  if (has("no power", "remote", "no grid", "off grid", "off-grid", "మారుమూల")) out.supply = "remote";
  else if (has("frequent", "daily cut", "every day", "many cuts", "power cuts", "తరచు")) out.supply = "frequent";
  else if (has("sometimes", "occasional", "few cuts", "అప్పుడప్పుడు")) out.supply = "occasional";

  const d = data.districts.find((x) => lower.includes(x.name.en.toLowerCase()) || text.includes(x.name.te));
  if (d) out.district = d.slug;
  return out;
}

export function completeInput(p: Partial<FinderInput>): FinderInput {
  return {
    persona: (p.persona ?? "urban") as Persona,
    district: p.district ?? "hyderabad",
    supply: (p.supply ?? "reliable") as Supply,
    bill: p.bill ?? 3000,
    pumpHp: p.pumpHp,
  };
}

/** Compact, model-friendly summary of a Finder result. */
export function summarizeResult(r: FinderResult, locale: string) {
  return {
    recommended_type: r.type,
    system_kw: r.kw,
    battery_kwh: r.batteryKwh,
    roof_sqft: r.roofSqft,
    estimated_monthly_units: r.monthlyUnits,
    cost_before_subsidy: formatRange(r.cost.min, r.cost.max),
    subsidy: r.subsidy ? formatINR(r.subsidy) : "none",
    subsidy_scheme: r.subsidyScheme ? pick(r.subsidyScheme.name, locale) : null,
    subsidy_amounts_verified: r.subsidyScheme?.verified ?? null,
    cost_after_subsidy: formatRange(r.costAfterSubsidy.min, r.costAfterSubsidy.max),
    monthly_saving: formatINR(r.monthlySavings),
    payback_years: r.paybackYears,
    matching_schemes: r.schemes.map((s) => ({ name: pick(s.name, locale), url: s.officialUrl, verified: s.verified })),
    installers_note: "Installer listings are currently samples; send users to /installers.",
  };
}

/** Offline answer used when no Claude credentials are configured. */
export function offlineAnswer(text: string, locale: string, data: SolarData): string {
  const input = completeInput(parseQuestion(text, data));
  const r = recommend(input, data);
  const te = locale === "te";
  if (r.type === "pumpset") {
    return te
      ? `మీకు సుమారు ${r.kw} kW సోలార్ పంప్‌సెట్ సరిపోతుంది. ఖర్చు ${formatRange(r.cost.min, r.cost.max)}, పీఎం-కుసుమ్ సహాయం తర్వాత సుమారు ${formatRange(r.costAfterSubsidy.min, r.costAfterSubsidy.max)}. పూర్తి వివరాలకు సోలార్ ఫైండర్ ప్రయత్నించండి. (అంచనా మాత్రమే)`
      : `A solar pumpset of about ${r.kw} kW should suit you. Cost is around ${formatRange(r.cost.min, r.cost.max)}, or about ${formatRange(r.costAfterSubsidy.min, r.costAfterSubsidy.max)} after PM-KUSUM support. Try the Solar Finder for full details. (Estimate only.)`;
  }
  const typeEn: Record<string, string> = { "on-grid": "an on-grid system with net metering", hybrid: "a hybrid system with battery backup", "off-grid": "an off-grid system with batteries", community: "shared rooftop solar through your residents’ association", commercial: "a commercial on-grid system" };
  const typeTe: Record<string, string> = { "on-grid": "నెట్ మీటరింగ్‌తో ఆన్-గ్రిడ్ సిస్టమ్", hybrid: "బ్యాటరీ బ్యాకప్‌తో హైబ్రిడ్ సిస్టమ్", "off-grid": "బ్యాటరీలతో ఆఫ్-గ్రిడ్ సిస్టమ్", community: "రెసిడెంట్స్ అసోసియేషన్ ద్వారా ఉమ్మడి రూఫ్‌టాప్ సోలార్", commercial: "వాణిజ్య ఆన్-గ్రిడ్ సిస్టమ్" };
  return te
    ? `₹${formatNum(input.bill ?? 0)} బిల్లుకు (సుమారు ${r.monthlyUnits} యూనిట్లు/నెల), ${typeTe[r.type]} సూచిస్తాను: ${r.kw} kW, సుమారు ${r.roofSqft} చ.అ. పైకప్పు. ఖర్చు ${formatRange(r.cost.min, r.cost.max)}, సబ్సిడీ తర్వాత ${formatRange(r.costAfterSubsidy.min, r.costAfterSubsidy.max)}. నెలకు సుమారు ${formatINR(r.monthlySavings)} ఆదా${r.paybackYears ? `, ${r.paybackYears} సంవత్సరాల్లో పెట్టుబడి వాపసు` : ""}. ఇవి అంచనాలు; అధికారిక సైట్‌లో నిర్ధారించుకోండి.`
    : `For a ₹${formatNum(input.bill ?? 0)} bill (about ${r.monthlyUnits} units a month), I’d suggest ${typeEn[r.type]}: ${r.kw} kW, needing about ${r.roofSqft} sq ft of roof. Cost is around ${formatRange(r.cost.min, r.cost.max)}, or ${formatRange(r.costAfterSubsidy.min, r.costAfterSubsidy.max)} after subsidy. You’d save about ${formatINR(r.monthlySavings)} a month${r.paybackYears ? ` and earn your money back in about ${r.paybackYears} years` : ""}. These are estimates; confirm amounts on the official site.`;
}
