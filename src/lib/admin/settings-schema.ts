import { z } from "zod";

/**
 * Business settings edited in Admin → Settings. Pure (shared by the form and the API).
 * Public pages read a whitelisted subset of these in Step 5, falling back to src/config/site.ts.
 */
export type SettingKind = "text" | "textarea" | "phone10" | "email" | "url" | "emails" | "social";
export type SettingDef = { key: string; label: string; group: "business" | "social" | "seo" | "alerts"; kind: SettingKind; hint?: string; required?: boolean; max?: number };

export const SOCIAL_KEYS = ["facebook", "instagram", "youtube", "linkedin", "x"] as const;

export const SETTING_DEFS: SettingDef[] = [
  { key: "business_name", label: "Business name", group: "business", kind: "text", required: true, max: 120 },
  { key: "phone", label: "Phone", group: "business", kind: "phone10", hint: "10-digit mobile. Shown on the site as +91.", required: true },
  { key: "whatsapp", label: "WhatsApp number", group: "business", kind: "phone10", hint: "10-digit number used for WhatsApp buttons.", required: true },
  { key: "email", label: "Email", group: "business", kind: "email", required: true },
  { key: "address", label: "Address", group: "business", kind: "textarea", max: 400 },
  { key: "map_link", label: "Google Maps link", group: "business", kind: "url" },
  { key: "office_hours", label: "Office hours", group: "business", kind: "text", hint: "e.g. Mon–Sat, 9 am – 7 pm", max: 120 },
  { key: "social_links", label: "Social links", group: "social", kind: "social" },
  { key: "seo_title_en", label: "Default SEO title (English)", group: "seo", kind: "text", hint: "About 50–60 characters.", max: 90 },
  { key: "seo_title_te", label: "Default SEO title (Telugu)", group: "seo", kind: "text", max: 120 },
  { key: "seo_desc_en", label: "Default SEO description (English)", group: "seo", kind: "textarea", hint: "About 140–160 characters.", max: 300 },
  { key: "seo_desc_te", label: "Default SEO description (Telugu)", group: "seo", kind: "textarea", max: 400 },
  { key: "alert_recipients", label: "Alert recipients", group: "alerts", kind: "emails", hint: "Who gets lead alerts and the daily summary. One email per line." },
];

export const SETTING_KEYS = SETTING_DEFS.map((d) => d.key);
export const GROUP_LABEL = { business: "Business details", social: "Social links", seo: "Search (SEO)", alerts: "Alerts" } as const;

const url = z.string().trim().max(500).refine((v) => v === "" || /^https?:\/\/[^\s]+\.[^\s]+/.test(v), "Enter a full link starting with https://");

export function schemaFor(def: SettingDef): z.ZodType {
  const max = def.max ?? 200;
  switch (def.kind) {
    case "phone10": return z.string().trim().regex(/^[6-9]\d{9}$/, "Enter 10 digits starting with 6, 7, 8 or 9 (no +91).");
    case "email": return z.string().trim().max(190).email("Enter a valid email.");
    case "url": return url;
    case "emails": return z.array(z.string().trim().email("Each line must be a valid email.")).max(10, "Up to 10 emails.");
    case "social": return z.object(Object.fromEntries(SOCIAL_KEYS.map((k) => [k, url.optional()]))).strict();
    default: {
      const s = z.string().trim().max(max, `Keep it under ${max} characters.`);
      return def.required ? s.min(1, "This can’t be empty.") : s;
    }
  }
}

/** Validates { key: value } changes. Unknown keys are rejected. */
export function validateSettings(changes: Record<string, unknown>): { ok: true; values: Record<string, unknown> } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(changes)) {
    const def = SETTING_DEFS.find((d) => d.key === k);
    if (!def) { errors[k] = "Unknown setting."; continue; }
    const r = schemaFor(def).safeParse(v);
    if (r.success) values[k] = r.data; else errors[k] = r.error.issues[0]?.message ?? "Invalid value.";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values };
}
