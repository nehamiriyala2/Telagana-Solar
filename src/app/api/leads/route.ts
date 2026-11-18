import { randomUUID } from "crypto";
import { PROPERTY_TYPES, isSpam, normalizeIndianPhone, tagLead, validateLead, type Lead, type LeadInput, type LeadKind } from "@/lib/leads";
import { saveLead } from "@/lib/server/store";
import { autoReplyCustomer, notifyOwner } from "@/lib/server/notify";
import { markCalledUrl } from "@/lib/server/token";

export const runtime = "nodejs";

const KINDS: LeadKind[] = ["plan_request", "subsidy_check", "calculator_report", "contact", "whatsapp_click", "quote"];

/* Basic per-instance rate limit. For multi-instance production use Upstash/Redis. */
const hits = new Map<string, { n: number; at: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.at > 10 * 60_000) { hits.set(ip, { n: 1, at: now }); return false; }
  return ++h.n > 20;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 1e8 ? Math.round(v) : null);

/** Single endpoint for every form + WhatsApp clicks. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });

  let raw: Record<string, unknown>;
  try { raw = await req.json(); } catch { return Response.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const kind = KINDS.includes(raw.kind as LeadKind) ? (raw.kind as LeadKind) : null;
  if (!kind) return Response.json({ ok: false, error: "bad_kind" }, { status: 400 });

  const calcRaw = raw.calc && typeof raw.calc === "object" ? (raw.calc as Record<string, unknown>) : null;
  const input: LeadInput = {
    kind,
    name: str(raw.name, 80),
    phone: str(raw.phone, 20),
    location: str(raw.location, 80),
    propertyType: PROPERTY_TYPES.includes(raw.propertyType as never) ? (raw.propertyType as LeadInput["propertyType"]) : undefined,
    monthlyBill: num(raw.monthlyBill),
    message: str(raw.message, 1000),
    slotDate: str(raw.slotDate, 10) ?? null,
    slotTime: str(raw.slotTime, 5) ?? null,
    packageId: str(raw.packageId, 40) ?? null,
    sourcePage: str(raw.sourcePage, 200) ?? "unknown",
    locale: raw.locale === "te" ? "te" : "en",
    website: str(raw.website, 200),
    elapsedMs: typeof raw.elapsedMs === "number" ? raw.elapsedMs : undefined,
    calc: calcRaw
      ? {
          type: PROPERTY_TYPES.includes(calcRaw.type as never) ? (calcRaw.type as LeadInput["propertyType"])! : "home",
          monthlyBill: num(calcRaw.monthlyBill) ?? 0, monthlyUnits: num(calcRaw.monthlyUnits) ?? 0,
          kw: typeof calcRaw.kw === "number" ? calcRaw.kw : 0, cost: num(calcRaw.cost) ?? 0, subsidy: num(calcRaw.subsidy) ?? 0,
          netCost: num(calcRaw.netCost) ?? 0, monthlySaving: num(calcRaw.monthlySaving) ?? 0, yearlySaving: num(calcRaw.yearlySaving) ?? 0,
          paybackYears: typeof calcRaw.paybackYears === "number" ? calcRaw.paybackYears : null,
          co2TonnesYear: typeof calcRaw.co2TonnesYear === "number" ? calcRaw.co2TonnesYear : 0,
        }
      : null,
  };

  // Spam: pretend success so bots learn nothing
  if (isSpam(input)) return Response.json({ ok: true });

  const errors = validateLead(input);
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });

  const { tags, temperature } = tagLead(input);
  const { website: _w, elapsedMs: _e, ...rest } = input; // eslint-disable-line @typescript-eslint/no-unused-vars
  const lead: Lead = { ...rest, id: randomUUID(), createdAt: new Date().toISOString(), tags, temperature, phoneE164: normalizeIndianPhone(input.phone) };

  const { stored, errors: storeErrors } = await saveLead(lead);
  if (storeErrors.length) console.error("[leads] storage errors", storeErrors);
  if (!stored.length && kind !== "whatsapp_click") console.warn("[leads] no storage configured (set SUPABASE_* or LEAD_WEBHOOK_URL)");

  if (kind !== "whatsapp_click") {
    // Notifications run in parallel; failures are logged, never shown to the customer.
    const results = await Promise.allSettled([notifyOwner(lead, markCalledUrl(lead.id)), autoReplyCustomer(lead)]);
    results.forEach((r) => r.status === "rejected" && console.error("[leads] notify failed", r.reason));
  }

  return Response.json({ ok: true, id: lead.id, tags });
}
