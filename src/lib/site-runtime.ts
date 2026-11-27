import { site } from "@/config/site";

/** Contact details saved in Admin → Settings, applied over src/config/site.ts (same values for every visitor). */
export type SiteOverrides = { name?: string; phone10?: string; whatsapp10?: string; email?: string; social?: Partial<Record<"facebook" | "instagram" | "youtube" | "linkedin", string>> };

export function applySiteOverrides(o: SiteOverrides) {
  const s = site as unknown as { name: string; phone: string; whatsapp: string; email: string; social: Record<string, string | null> };
  if (o.name) s.name = o.name;
  if (o.phone10 && /^[6-9]\d{9}$/.test(o.phone10)) s.phone = `+91 ${o.phone10.slice(0, 5)} ${o.phone10.slice(5)}`;
  if (o.whatsapp10 && /^[6-9]\d{9}$/.test(o.whatsapp10)) s.whatsapp = `91${o.whatsapp10}`;
  if (o.email) s.email = o.email;
  for (const [k, v] of Object.entries(o.social ?? {})) if (k in s.social) s.social[k] = v || null;
}
