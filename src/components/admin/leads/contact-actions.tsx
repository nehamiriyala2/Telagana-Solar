"use client";

import { MessageCircle, Phone } from "lucide-react";

/** Records the tap on the lead's timeline (fire-and-forget; the call/chat opens immediately either way). */
export function logContact(id: number, channel: "call" | "whatsapp", template?: string) {
  try {
    void fetch(`/api/admin/leads/${id}/contact`, {
      method: "POST", keepalive: true, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template ? { channel, template } : { channel }),
    }).catch(() => {});
  } catch { /* never block the call */ }
}

const waHref = (phone: string, text?: string) => `https://wa.me/91${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/**
 * One-click Call and WhatsApp. size "sm" = icon buttons for table rows, "md" = labelled pills.
 * `waUrl` overrides the default wa.me link (e.g. with a pre-filled template).
 */
export function ContactActions({ id, phone, waUrl, size = "md", canLog = true, onLogged }: {
  id: number; phone: string | null; waUrl?: string | null; size?: "sm" | "md"; canLog?: boolean; onLogged?: () => void;
}) {
  if (!phone) return null;
  const tap = (channel: "call" | "whatsapp") => { if (canLog) { logContact(id, channel, channel === "whatsapp" && waUrl?.includes("?text=") ? "welcome" : undefined); setTimeout(() => onLogged?.(), 400); } };
  const pretty = phone.replace(/(\d{5})(\d{5})/, "$1 $2");

  if (size === "sm") {
    return (
      <span className="flex items-center gap-1.5">
        <a href={`tel:+91${phone}`} onClick={() => tap("call")} aria-label={`Call ${pretty}`} title={`Call ${pretty}`}
          className="grid size-8 place-items-center rounded-lg bg-navy text-white outline-none hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-gold">
          <Phone className="size-4" aria-hidden />
        </a>
        <a href={waUrl ?? waHref(phone)} target="_blank" rel="noopener noreferrer" onClick={() => tap("whatsapp")} aria-label={`WhatsApp ${pretty}`} title={`WhatsApp ${pretty}`}
          className="grid size-8 place-items-center rounded-lg bg-[#25d366] text-[#073b1d] outline-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-gold">
          <MessageCircle className="size-4" aria-hidden />
        </a>
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <a href={`tel:+91${phone}`} onClick={() => tap("call")} className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 font-semibold text-white outline-none hover:bg-navy-800 focus-visible:ring-4 focus-visible:ring-gold/40">
        <Phone className="size-4" aria-hidden />Call
      </a>
      <a href={waUrl ?? waHref(phone)} target="_blank" rel="noopener noreferrer" onClick={() => tap("whatsapp")} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25d366] px-5 font-semibold text-[#073b1d] outline-none hover:brightness-105 focus-visible:ring-4 focus-visible:ring-gold/40">
        <MessageCircle className="size-4" aria-hidden />WhatsApp
      </a>
    </span>
  );
}
