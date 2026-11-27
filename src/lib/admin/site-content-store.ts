import "server-only";
import { q } from "./db";
import { BANNER_KEY, BannerSchema, DEFAULT_BANNER, DEFAULT_TRUST, TRUST_KEY, TrustSchema, type Banner, type TrustItem } from "./site-content";

const parse = (v: unknown) => (typeof v === "string" ? (() => { try { return JSON.parse(v); } catch { return null; } })() : v);

/** Saved trust bar + banner, or the defaults (also when MySQL is down). */
export async function loadSiteContent(): Promise<{ trust: TrustItem[]; banner: Banner; trustSaved: boolean }> {
  try {
    const rows = await q<{ key: string; value: unknown }>("SELECT `key`, value FROM settings WHERE `key` IN (?, ?)", [TRUST_KEY, BANNER_KEY]);
    const get = (k: string) => parse(rows.find((r) => r.key === k)?.value);
    const t = TrustSchema.safeParse(get(TRUST_KEY));
    const b = BannerSchema.safeParse(get(BANNER_KEY));
    return { trust: t.success ? t.data : DEFAULT_TRUST, banner: b.success ? b.data : DEFAULT_BANNER, trustSaved: t.success };
  } catch {
    return { trust: DEFAULT_TRUST, banner: DEFAULT_BANNER, trustSaved: false };
  }
}
