import { z } from "zod";
import { adminRoute, jsonBody } from "@/lib/admin/api";
import { HttpError } from "@/lib/admin/lead-service";
import { refreshPublicSite } from "@/lib/admin/cms/store";
import { saveSettings } from "@/lib/admin/settings-store";
import { BANNER_KEY, BannerSchema, TRUST_KEY, TrustSchema, bannedPhrase } from "@/lib/admin/site-content";

export const dynamic = "force-dynamic";

/** PUT { trust?: 4 items, banner?: {...} } → saved in settings with history. Content editors and admins. */
export const PUT = adminRoute("content.edit", async (req, staff) => {
  const body = z.object({ trust: TrustSchema.optional(), banner: BannerSchema.optional() }).strict().parse(await jsonBody(req));
  const texts = [...(body.trust ?? []).flatMap((t) => Object.values(t)), ...(body.banner ? [body.banner.text_en, body.banner.text_te] : [])];
  const bad = bannedPhrase(texts);
  if (bad) throw new HttpError(400, "banned_phrase", bad);
  const values: Record<string, unknown> = {};
  if (body.trust) values[TRUST_KEY] = body.trust;
  if (body.banner) values[BANNER_KEY] = body.banner;
  const changed = await saveSettings(values, staff);
  if (changed.length) refreshPublicSite();
  return Response.json({ ok: true, changed });
});
