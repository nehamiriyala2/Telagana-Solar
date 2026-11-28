import { z } from "zod";
import { adminRoute, jsonBody } from "@/lib/admin/api";
import { tx } from "@/lib/admin/db";
import { HttpError } from "@/lib/admin/lead-service";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { refreshPublicSite } from "@/lib/admin/cms/store";
import { bannedPhrase } from "@/lib/admin/site-content";

export const dynamic = "force-dynamic";

const text = (max: number) => z.string().trim().max(max);
const Body = z.object({
  name_en: text(120).min(2), name_te: text(120).min(2),
  discom: z.enum(["TGSPDCL", "TGNPDCL"]),
  region: text(60),
  summary_en: text(2000), summary_te: text(3000),
  about_en: text(6000), about_te: text(9000),
  solar_types_en: text(1500), solar_types_te: text(2500),
  local_notes_en: text(3000), local_notes_te: text(4500),
  seo_title_en: text(160), seo_title_te: text(200),
  seo_desc_en: text(320), seo_desc_te: text(400),
  hero_image: text(255).refine((v) => v === "" || /^\/(media\/)?[\w\-./]+\.(webp|jpg|jpeg|png|avif)$/i.test(v) || /^https:\/\/\S+$/.test(v), "Use a path like /images/hyderabad.webp or a full https:// link."),
  published: z.boolean(),
  scheme_ids: z.array(z.number().int().positive()).max(50),
}).strict();

const TEXTS = ["summary_en", "summary_te", "about_en", "about_te", "solar_types_en", "solar_types_te", "local_notes_en", "local_notes_te", "seo_title_en", "seo_title_te", "seo_desc_en", "seo_desc_te"] as const;
const FIELDS = ["name_en", "name_te", "discom", "region", ...TEXTS, "hero_image", "published"] as const;

/** PATCH a district (admin). Changes are logged in settings_history as district:<slug> (old → new). */
export const PATCH = adminRoute<{ slug: string }>(ROUTE_PERMS["districts.update"], async (req, staff, { slug }) => {
  const input = Body.parse(await jsonBody(req));
  const changed = await tx(async (conn) => {
    const [rows] = await conn.execute("SELECT * FROM districts WHERE slug = ? FOR UPDATE", [slug]);
    const cur = (rows as Record<string, unknown>[])[0];
    if (!cur) throw new HttpError(404, "not_found");
    const curId = Number(cur.id);
    const [links] = await conn.execute("SELECT scheme_id FROM scheme_districts WHERE district_id = ? ORDER BY scheme_id", [curId]);
    const oldSchemes = (links as { scheme_id: number }[]).map((l) => l.scheme_id);
    const newSchemes = [...new Set(input.scheme_ids)].sort((a, b) => a - b);

    const bad = bannedPhrase(TEXTS.map((k) => input[k]));
    if (bad) throw new HttpError(400, "banned_phrase", bad);
    const next: Record<string, unknown> = {
      ...input, published: input.published ? 1 : 0, hero_image: input.hero_image || null, region: input.region || null,
      ...Object.fromEntries(TEXTS.map((k) => [k, input[k] || null])),
    };
    const diff = FIELDS.filter((f) => String(cur[f] ?? "") !== String(next[f] ?? ""));
    if (diff.length) await conn.execute(`UPDATE districts SET ${diff.map((f) => `\`${f}\` = ?`).join(", ")} WHERE id = ?`, [...diff.map((f) => next[f] as never), curId]);

    const schemesChanged = JSON.stringify(oldSchemes) !== JSON.stringify(newSchemes);
    if (schemesChanged) {
      if (newSchemes.length) {
        const [valid] = await conn.query("SELECT id FROM schemes WHERE id IN (?) AND deleted_at IS NULL", [newSchemes]);
        if ((valid as unknown[]).length !== newSchemes.length) throw new HttpError(400, "invalid_scheme");
      }
      await conn.execute("DELETE FROM scheme_districts WHERE district_id = ?", [curId]);
      if (newSchemes.length) await conn.query("INSERT INTO scheme_districts (scheme_id, district_id) VALUES ?", [newSchemes.map((s) => [s, curId])]);
    }
    if (!diff.length && !schemesChanged) return [];
    const pick = (o: Record<string, unknown>, keys: readonly string[]) => Object.fromEntries(keys.map((k) => [k, o[k] ?? null]));
    await conn.execute("INSERT INTO settings_history (`key`, old_value, new_value, changed_by) VALUES (?, ?, ?, ?)", [
      `district:${slug}`,
      JSON.stringify({ ...pick(cur, diff), ...(schemesChanged ? { scheme_ids: oldSchemes } : {}) }),
      JSON.stringify({ ...pick(next, diff), ...(schemesChanged ? { scheme_ids: newSchemes } : {}) }),
      staff.id,
    ]);
    return [...diff, ...(schemesChanged ? ["schemes"] : [])];
  });
  if (changed.length) refreshPublicSite();
  return Response.json({ ok: true, changed });
});
