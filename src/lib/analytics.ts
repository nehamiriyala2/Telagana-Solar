"use client";
/**
 * Conversion tracking for GA4, Meta Pixel and Google Ads.
 * IDs come from env vars (see .env.example); calls are no-ops when not configured.
 */
type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window { gtag?: Gtag; fbq?: Fbq; dataLayer?: unknown[] }
}

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const ADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL;
const ADS_WA_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_LABEL;

export type TrackEvent =
  | { name: "lead_submit"; kind: string; propertyType?: string; value?: number }
  | { name: "whatsapp_click"; location: string }
  | { name: "call_click"; location: string }
  | { name: "calculator_used"; propertyType: string; kw: number };

export function track(e: TrackEvent) {
  if (typeof window === "undefined") return;
  const { name, ...params } = e;
  window.gtag?.("event", name === "lead_submit" ? "generate_lead" : name, params);

  if (name === "lead_submit") {
    window.fbq?.("track", "Lead", { content_category: e.kind });
    if (ADS_ID && ADS_LEAD_LABEL) window.gtag?.("event", "conversion", { send_to: `${ADS_ID}/${ADS_LEAD_LABEL}` });
  }
  if (name === "whatsapp_click") {
    window.fbq?.("track", "Contact", { method: "whatsapp" });
    if (ADS_ID && ADS_WA_LABEL) window.gtag?.("event", "conversion", { send_to: `${ADS_ID}/${ADS_WA_LABEL}` });
  }
  if (name === "call_click") window.fbq?.("track", "Contact", { method: "phone" });
}
