import type { Lead } from "@/lib/leads";

/* Pure helpers (no DB), shared by the API, the Sheet import script and tests. */
export type LeadSource = "find-my-plan" | "contact" | "savings-calculator" | "shop-calculator" | "subsidy-check" | "whatsapp";

/** Which public tool a lead came from, from the form kind + page it was sent on. */
export function leadSource(l: Pick<Lead, "kind" | "sourcePage" | "calc" | "propertyType">): LeadSource {
  if (l.kind === "whatsapp_click") return "whatsapp";
  if (l.kind === "calculator_report") return (l.calc?.type ?? l.propertyType) === "business" ? "shop-calculator" : "savings-calculator";
  if (l.kind === "subsidy_check") return "subsidy-check";
  if (l.kind === "contact" || l.kind === "quote" || /\/contact(\/|$)/.test(l.sourcePage)) return "contact";
  return "find-my-plan";
}

/** Website property type → admin "use". */
export const USE: Record<string, string> = { home: "home", farm: "farm", business: "shop" };

/** utm_* from the page URL the form was sent from (Referer header), when the client did not send them. */
export function utmFromReferer(referer: string | null): { utm_source: string | null; utm_campaign: string | null } {
  try {
    const u = new URL(referer ?? "");
    return { utm_source: u.searchParams.get("utm_source")?.slice(0, 120) || null, utm_campaign: u.searchParams.get("utm_campaign")?.slice(0, 160) || null };
  } catch { return { utm_source: null, utm_campaign: null }; }
}

