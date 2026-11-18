import "server-only";
import { site } from "@/config/site";
import type { Lead } from "@/lib/leads";
import { formatINR } from "@/lib/utils";

/**
 * Notifications:
 *  - Owner: WhatsApp (Cloud API) + email (Resend)
 *  - Customer: WhatsApp auto-reply (Cloud API template)
 * WhatsApp Business rules: messages a business starts must use an APPROVED TEMPLATE.
 * Create the templates in Meta Business Manager and put their names in env (see README).
 * If a template name is not set, a plain text message is attempted (only delivered inside a 24h chat window).
 */
const WA_TOKEN = process.env.WHATSAPP_CLOUD_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WA_VERSION = process.env.WHATSAPP_API_VERSION ?? "v21.0";

async function sendWhatsApp(to: string, opts: { template?: string; lang?: string; params: string[]; text: string }) {
  if (!WA_TOKEN || !WA_PHONE_ID) return "whatsapp: not configured";
  const body = opts.template
    ? {
        messaging_product: "whatsapp", to: to.replace(/[^\d]/g, ""), type: "template",
        template: {
          name: opts.template,
          language: { code: opts.lang ?? "en" },
          components: opts.params.length ? [{ type: "body", parameters: opts.params.map((text) => ({ type: "text", text: text.slice(0, 1000) })) }] : [],
        },
      }
    : { messaging_product: "whatsapp", to: to.replace(/[^\d]/g, ""), type: "text", text: { body: opts.text } };
  const res = await fetch(`https://graph.facebook.com/${WA_VERSION}/${WA_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  return res.ok ? "whatsapp: sent" : `whatsapp: HTTP ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300);
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "email: not configured";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Telangana Solar <leads@example.com>", to: [to], subject, html }),
    signal: AbortSignal.timeout(8000),
  });
  return res.ok ? "email: sent" : `email: HTTP ${res.status}`;
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export function leadLines(l: Lead): [string, string][] {
  const rows: [string, string][] = [
    ["Name", l.name ?? "-"],
    ["Phone", l.phoneE164 ?? "-"],
    ["Location", l.location ?? "-"],
    ["Property", l.propertyType ?? l.calc?.type ?? "-"],
    ["Monthly bill", l.monthlyBill ? formatINR(l.monthlyBill) : l.calc ? formatINR(l.calc.monthlyBill) : "-"],
    ["Tags", l.tags.join(", ")],
    ["Source", `${l.kind} · ${l.sourcePage}`],
  ];
  if (l.slotDate) rows.push(["Preferred time", `${l.slotDate} ${l.slotTime ?? ""}`]);
  if (l.packageId) rows.push(["Package", l.packageId]);
  if (l.calc) rows.push(["Calculator", `${l.calc.kw} kW · saves ${formatINR(l.calc.monthlySaving)}/month · net cost ${formatINR(l.calc.netCost)}`]);
  if (l.message) rows.push(["Message", l.message]);
  return rows;
}

export async function notifyOwner(l: Lead, markCalledUrl: string | null, opts: { reminder?: boolean } = {}) {
  const results: string[] = [];
  const prefix = opts.reminder ? "⏰ NOT CALLED YET (1h+)" : l.temperature === "hot" ? "🔥 New HOT lead" : "New lead";
  const summary = `${prefix}: ${l.name ?? "-"} (${l.phoneE164 ?? "-"}), ${l.propertyType ?? l.calc?.type ?? "-"}, ${l.location ?? "-"}`;

  const ownerWa = process.env.OWNER_WHATSAPP_NUMBER;
  if (ownerWa) {
    const text = [summary, ...leadLines(l).slice(3).map(([k, v]) => `${k}: ${v}`), markCalledUrl ? `Mark as called: ${markCalledUrl}` : ""].filter(Boolean).join("\n");
    results.push(await sendWhatsApp(ownerWa, {
      template: process.env.WHATSAPP_TEMPLATE_OWNER_ALERT,
      lang: process.env.WHATSAPP_TEMPLATE_LANG ?? "en",
      // Template body suggestion: "{{1}}\n{{2}}\nMark as called: {{3}}"
      params: [summary, leadLines(l).slice(3).map(([k, v]) => `${k}: ${v}`).join(" | "), markCalledUrl ?? "-"],
      text,
    }));
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (ownerEmail) {
    const html = `<h2 style="font-family:sans-serif">${esc(summary)}</h2>
<table style="font-family:sans-serif;border-collapse:collapse">${leadLines(l).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#4b5b75">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join("")}</table>
${l.phoneE164 ? `<p><a href="tel:${esc(l.phoneE164)}">Call now</a> · <a href="https://wa.me/${esc(l.phoneE164.replace("+", ""))}">WhatsApp</a></p>` : ""}
${markCalledUrl ? `<p><a href="${esc(markCalledUrl)}" style="background:#F5A800;color:#07173F;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:600">Mark as called</a></p>` : ""}`;
    results.push(await sendEmail(ownerEmail, summary, html));
  }
  return results;
}

export async function autoReplyCustomer(l: Lead) {
  if (!l.phoneE164) return "customer: no phone";
  const name = l.name?.split(" ")[0] ?? "";
  const text = l.locale === "te"
    ? `నమస్తే ${name}! తెలంగాణ సోలార్‌ను సంప్రదించినందుకు ధన్యవాదాలు. మా బృందం ${site.callbackHours} గంటల్లో మీకు కాల్ చేస్తుంది.`
    : `Hi ${name}! Thanks for contacting Telangana Solar. Our team will call you within ${site.callbackHours} hours.`;
  return sendWhatsApp(l.phoneE164, {
    template: process.env.WHATSAPP_TEMPLATE_CUSTOMER_REPLY,
    lang: l.locale === "te" ? "te" : "en",
    // Template body suggestion: "Hi {{1}}! Thanks for contacting Telangana Solar. Our team will call you within {{2}} hours."
    params: [name || "there", String(site.callbackHours)],
    text,
  });
}
