import "server-only";
import { cache } from "react";
import { isDbConfigured, q } from "@/lib/admin/db";
import { loadSiteContent } from "@/lib/admin/site-content-store";
import { DEFAULT_BANNER, DEFAULT_TRUST, type Banner, type TrustItem } from "@/lib/admin/site-content";
import { CALC_KEY, DEFAULT_CALC, normalizeCalc, type CalcSettings, type Discom } from "@/lib/calc-settings";
import type { SiteOverrides } from "@/lib/site-runtime";

export type PublicSettings = { calc: CalcSettings; districtDiscom: Record<string, Discom>; site: SiteOverrides; banner: Banner; trust: TrustItem[] };

const FALLBACK: PublicSettings = { calc: DEFAULT_CALC, districtDiscom: {}, site: {}, banner: DEFAULT_BANNER, trust: DEFAULT_TRUST };
const parse = (v: unknown) => (typeof v === "string" ? (() => { try { return JSON.parse(v); } catch { return null; } })() : v);

/**
 * Everything the public site takes from the admin, read once per request.
 * Without MySQL (e.g. a static preview) the site keeps using src/config and messages.
 */
export const loadPublicSettings = cache(async (): Promise<PublicSettings> => {
  if (!isDbConfigured()) return FALLBACK;
  try {
    const [rows, districts, content] = await Promise.all([
      q<{ key: string; value: unknown }>("SELECT `key`, value FROM settings WHERE `key` IN (?, 'business_name', 'phone', 'whatsapp', 'email', 'social_links')", [CALC_KEY]),
      q<{ slug: string; discom: Discom }>("SELECT slug, discom FROM districts"),
      loadSiteContent(),
    ]);
    const get = (k: string) => parse(rows.find((r) => r.key === k)?.value);
    const str = (k: string) => (typeof get(k) === "string" ? (get(k) as string) : undefined);
    return {
      calc: get(CALC_KEY) ? normalizeCalc(get(CALC_KEY)) : DEFAULT_CALC,
      districtDiscom: Object.fromEntries(districts.map((d) => [d.slug, d.discom])),
      site: { name: str("business_name"), phone10: str("phone"), whatsapp10: str("whatsapp"), email: str("email"), social: (get("social_links") as SiteOverrides["social"]) ?? undefined },
      banner: content.banner, trust: content.trust,
    };
  } catch {
    return FALLBACK;
  }
});
