import { randomUUID } from "crypto";
import { PROPERTY_TYPES, isSpam, normalizeIndianPhone, tagLead, validateLead, type Lead, type LeadInput, type LeadKind } from "@/lib/leads";
import { saveLead } from "@/lib/server/store";
import { autoReplyCustomer, notifyOwner } from "@/lib/server/notify";
import { markCalledUrl } from "@/lib/server/token";
import { isDbConfigured } from "@/lib/admin/db";
import { insertWebsiteLead, logActivity, utmFromReferer } from "@/lib/admin/leads-db";
import { overLimit } from "@/lib/admin/rate-limit";

export const runtime = "nodejs";

const KINDS: LeadKind[] = ["plan_request", "subsidy_check", "calculator_report", "contact", "whatsapp_click", "quote"];

/*
 * Rate limit: form submissions max 5 per IP per 10 minutes, counted in MySQL (rate_limits) when the admin
 * database is configured, otherwise per instance in memory. WhatsApp-click beacons have their own looser limit
 * so tapping WhatsApp never uses up a visitor's form submissions.
 */
const FORM_MAX = 5;
const CLICK_MAX = 20;
const hits = new Map<string, { n: number; at: number }>();
function limitedInMemory(key: string, max: number) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.at > 10 * 60_000) { hits.set(key, { n: 1, at: now }); return false; }
  return ++h.n > max;
}
async function limited(ip: string, isClick: boolean) {
  const max = isClick ? CLICK_MAX : FORM_MAX;
  if (isDbConfigured()) {
    try { return await overLimit(isClick ? "lead-click-ip" : "lead-form-ip", ip, max, 600); }
    catch { /* MySQL down: fall back to memory */ }
  }
  return limitedInMemory(`${isClick ? "c" : "f"}:${ip}`, max);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 1e8 ? Math.round(v) : null);

/** Single endpoint for every form + WhatsApp clicks. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  let raw: Record<string, unknown>;
  try { raw = await req.json(); } catch { return Response.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const kind = KINDS.includes(raw.kind as LeadKind) ? (raw.kind as LeadKind) : null;
  if (!kind) return Response.json({ ok: false, error: "bad_kind" }, { status: 400 });
  if (await limited(ip, kind === "whatsapp_click")) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });

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
    utm_source: str(raw.utm_source, 120) ?? null,
    utm_campaign: str(raw.utm_campaign, 160) ?? null,
    referrer: str(raw.referrer, 255) ?? null,
    consent: raw.consent === true,
    district: str(raw.district, 60) ?? null,
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

  // 1) Admin database first. A failure is logged and never blocks the Sheet, email or WhatsApp below.
  //    WhatsApp taps become a "WhatsApp" lead (no phone yet, so it lands in "No phone yet"); at most one per visitor per 30 minutes.
  let dbId: number | null = null;
  const saveClick = kind === "whatsapp_click" && isDbConfigured() && !(await overLimit("lead-wa-lead", ip, 1, 1800).catch(() => true));
  if (isDbConfigured() && (kind !== "whatsapp_click" || saveClick)) {
    try {
      const fromUrl = utmFromReferer(req.headers.get("referer"));
      dbId = await insertWebsiteLead(lead, raw, {
        utm_source: lead.utm_source ?? fromUrl.utm_source,
        utm_campaign: lead.utm_campaign ?? fromUrl.utm_campaign,
        referrer: lead.referrer ?? null,
      });
    } catch (e) {
      console.error("[leads] mysql insert failed:", (e as Error).message);
    }
  }

  // 2) Existing storage: Supabase / Google Sheet webhook / local dev file.
  const { stored, errors: storeErrors } = await saveLead(lead);
  if (storeErrors.length) console.error("[leads] storage errors", storeErrors);
  if (!stored.length && kind !== "whatsapp_click") console.warn("[leads] no storage configured (set SUPABASE_* or LEAD_WEBHOOK_URL)");

  if (kind !== "whatsapp_click") {
    // Notifications run in parallel; failures are logged, never shown to the customer.
    const results = await Promise.allSettled([notifyOwner(lead, markCalledUrl(lead.id)), autoReplyCustomer(lead)]);
    results.forEach((r) => r.status === "rejected" && console.error("[leads] notify failed", r.reason));

    // 3) Timeline entries for what actually went out (no customer data in the log).
    if (dbId) {
      const owner = results[0].status === "fulfilled" ? results[0].value : [];
      const customer = results[1].status === "fulfilled" ? results[1].value : "";
      const logs: Promise<void>[] = [];
      if (owner.includes("email: sent")) logs.push(logActivity(dbId, "email_sent", { to: "owner" }));
      if (owner.includes("whatsapp: sent")) logs.push(logActivity(dbId, "whatsapp_sent", { to: "owner" }));
      if (customer === "whatsapp: sent") logs.push(logActivity(dbId, "whatsapp_sent", { to: "customer", template: "auto_reply" }));
      await Promise.allSettled(logs);
    }
  }

  return Response.json({ ok: true, id: lead.id, tags });
}
