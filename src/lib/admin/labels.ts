/**
 * Pipeline stages. The keys are fixed (reports and automations depend on what each one means);
 * names, colours, order and visibility are edited in Settings → Pipeline stages (see stages.ts).
 * These labels are the defaults, used where no stage settings are available.
 */
export const STATUSES = ["new", "contacted", "qualified", "site_visit", "quote_sent", "won", "lost"] as const;
export type LeadStatus = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New", contacted: "Contacted", qualified: "Qualified", site_visit: "Site visit", quote_sent: "Proposal / Quote", won: "Won", lost: "Lost",
};
/** Default pill colours: gold = new, green = won. */
export const STATUS_TONE: Record<LeadStatus, string> = {
  new: "bg-[#fff3d1] text-[#8a5a00] ring-[#f5d27a]",
  contacted: "bg-[#e8f0fe] text-[#1a4fa0] ring-[#bcd2f7]",
  qualified: "bg-[#fdeee3] text-[#a4470d] ring-[#f6cfb2]",
  site_visit: "bg-[#efe9fb] text-[#5b3aa6] ring-[#d6c8f3]",
  quote_sent: "bg-[#e6f6f8] text-[#0f6e7a] ring-[#b6e3e9]",
  won: "bg-[#e7f5e4] text-[#2b7a23] ring-[#b9e0b1]",
  lost: "bg-[#f1f2f4] text-[#5b6473] ring-[#d9dde3]",
};

export const LOST_REASONS = ["price", "roof_not_suitable", "went_elsewhere", "no_reply", "other"] as const;
export type LostReason = (typeof LOST_REASONS)[number];
export const LOST_LABEL: Record<LostReason, string> = {
  price: "Price", roof_not_suitable: "Roof not suitable", went_elsewhere: "Went elsewhere", no_reply: "No reply", other: "Other",
};

export const SOURCES = [
  "find-my-plan", "contact", "savings-calculator", "shop-calculator", "subsidy-check",
  "whatsapp", "call", "referral", "walk-in",
] as const;
export const SOURCE_LABEL: Record<string, string> = {
  "find-my-plan": "Find my plan", contact: "Contact form", "savings-calculator": "Savings calculator",
  "shop-calculator": "Shop calculator", "subsidy-check": "Subsidy check",
  whatsapp: "WhatsApp", call: "Phone call", referral: "Referral", "walk-in": "Walk-in",
};
/** Sources staff can pick when adding a lead by hand (website sources are set by the website only). */
export const MANUAL_SOURCES = ["call", "whatsapp", "referral", "walk-in"] as const;
/** The five channels in the brief, for reports and filters. */
export const SOURCE_CHANNEL: Record<string, "website" | "calculator" | "whatsapp" | "call" | "referral"> = {
  "find-my-plan": "website", contact: "website", "subsidy-check": "website",
  "savings-calculator": "calculator", "shop-calculator": "calculator",
  whatsapp: "whatsapp", call: "call", "walk-in": "call", referral: "referral",
};

export const USES = ["home", "apartment", "shop", "farm", "institution"] as const;
export const USE_LABEL: Record<string, string> = { home: "Home", apartment: "Apartment", shop: "Business / shop", farm: "Farm", institution: "Institution" };

export const ROOFS = ["own", "shared", "none"] as const;
export const ROOF_LABEL: Record<string, string> = { own: "Own roof", shared: "Shared roof", none: "No roof" };

export const SYSTEMS = ["on-grid", "hybrid", "off-grid"] as const;
export const SYSTEM_LABEL: Record<string, string> = { "on-grid": "On-grid", hybrid: "Hybrid", "off-grid": "Off-grid" };

export const BILL_RANGES = [
  { key: "lt2k", label: "Under ₹2k", min: 0, max: 1999 },
  { key: "2-5k", label: "₹2k–5k", min: 2000, max: 4999 },
  { key: "5-10k", label: "₹5k–10k", min: 5000, max: 9999 },
  { key: "10k+", label: "₹10k+", min: 10000, max: null },
] as const;

export function inr(n: number | null | undefined): string {
  if (n === null || n === undefined) return "-";
  return `₹${Math.round(Number(n)).toLocaleString("en-IN")}`;
}

export function kwLabel(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === "") return "-";
  const v = Number(n);
  return `${Number.isInteger(v) ? v : v.toFixed(1)} kW`;
}

/* Follow-ups (Module 3) */
export const FU_TYPES = ["call", "whatsapp", "visit"] as const;
export type FuType = (typeof FU_TYPES)[number];
export const FU_TYPE_LABEL: Record<FuType, string> = { call: "Call", whatsapp: "WhatsApp", visit: "Visit (internal)" };

export const FU_OUTCOMES = ["reached", "no_answer", "call_back", "interested", "not_interested", "visit_done", "other"] as const;
export type FuOutcome = (typeof FU_OUTCOMES)[number];
export const FU_OUTCOME_LABEL: Record<FuOutcome, string> = {
  reached: "Spoke to them", no_answer: "No answer", call_back: "Asked to call back", interested: "Interested",
  not_interested: "Not interested", visit_done: "Visit done", other: "Other",
};
/** After this outcome, how many days until the suggested next follow-up (null = don't suggest one). */
export const FU_NEXT_DAYS: Record<FuOutcome, number | null> = {
  reached: 3, no_answer: 1, call_back: 1, interested: 2, not_interested: null, visit_done: 2, other: 2,
};
