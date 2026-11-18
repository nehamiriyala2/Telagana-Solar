import { site } from "@/config/site";

/** wa.me link with a pre-filled message. Returns null until the number is configured. */
export function whatsappHref(message: string): string | null {
  if (!site.whatsapp) return null;
  return `https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}

export function telHref(): string | null {
  return site.phone ? `tel:${site.phone.replace(/\s/g, "")}` : null;
}

/** Fire-and-forget WhatsApp-click record to the lead endpoint (does not block navigation). */
export function recordWhatsappClick(sourcePage: string, locale: "en" | "te") {
  try {
    const body = JSON.stringify({ kind: "whatsapp_click", sourcePage, locale });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/leads", new Blob([body], { type: "application/json" }));
    else void fetch("/api/leads", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch { /* ignore */ }
}
