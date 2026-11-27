import "server-only";
import { cache } from "react";
import { isDbConfigured, q } from "@/lib/admin/db";
import { parseLines } from "@/lib/admin/cms/schema";

/**
 * Published admin content for the public site. Drafts are never returned.
 * Every function returns null (or []) when MySQL isn't available, and the page then uses its built-in text.
 * Telugu falls back to English field by field.
 */
type Row = Record<string, unknown>;
const tr = (r: Row, key: string, locale: string): string => {
  const te = r[`${key}_te`], en = r[`${key}_en`];
  return String((locale === "te" && typeof te === "string" && te.trim() ? te : en) ?? "");
};
const linesOf = (text: string) => text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const pickLines = (v: unknown, locale: string) => { const l = parseLines(v); return locale === "te" && l.te.length ? l.te : l.en; };

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback;
  try { return await fn(); } catch (e) { console.error("[public-content]", (e as Error).message); return fallback; }
}

/* ───────── Schemes ───────── */

export type PublicScheme = {
  slug: string; name: string; short: string; authority: string; benefit: string; who: string[]; documents: string[]; steps: string[];
  officialUrl: string | null; status: "active" | "paused" | "closed"; lastVerified: Date | null;
};

/** Published rows only: draft text is never loaded by the public site (not even into dev debug data). */
const publishedSchemeRows = cache(() => safe(() => q<Row>("SELECT * FROM schemes WHERE status = 'published' AND deleted_at IS NULL ORDER BY sort_order, id"), null as Row[] | null));

function toScheme(r: Row, locale: string): PublicScheme {
  return {
    slug: String(r.slug), name: tr(r, "name", locale), short: tr(r, "summary", locale), authority: tr(r, "authority", locale),
    benefit: tr(r, "benefit", locale), who: linesOf(tr(r, "eligibility", locale)), documents: pickLines(r.documents, locale), steps: pickLines(r.steps, locale),
    officialUrl: (r.official_url as string) || null, status: (r.scheme_status as PublicScheme["status"]) ?? "active", lastVerified: (r.last_verified_at as Date) ?? null,
  };
}

/** Published schemes in display order, or null when the database isn't available. */
export async function publishedSchemes(locale: string): Promise<PublicScheme[] | null> {
  const rows = await publishedSchemeRows();
  return rows ? rows.map((r) => toScheme(r, locale)) : null;
}

/** "missing" = no such scheme (or a draft) → 404. null = no database → use built-in text. */
export async function schemeBySlug(slug: string, locale: string): Promise<PublicScheme | "missing" | null> {
  const rows = await publishedSchemeRows();
  if (!rows) return null;
  const r = rows.find((x) => x.slug === slug);
  return r ? toScheme(r, locale) : "missing";
}

/* ───────── Districts ───────── */

export type PublicDistrict = { published: boolean; summary: string; about: string[]; solarTypes: string[]; localNotes: string[]; seoTitle: string; seoDesc: string; heroImage: string | null; discom: string };

export const districtContent = cache(async (slug: string, locale: string): Promise<PublicDistrict | null> => {
  // Content columns only for published districts; an unpublished one returns just its flag (→ 404).
  const rows = await safe(() => q<Row>("SELECT * FROM districts WHERE slug = ? AND published = 1", [slug]), null as Row[] | null);
  if (rows && !rows.length) {
    const hidden = await safe(() => q<Row>("SELECT published FROM districts WHERE slug = ?", [slug]), [] as Row[]);
    if (hidden.length) return { published: false, summary: "", about: [], solarTypes: [], localNotes: [], seoTitle: "", seoDesc: "", heroImage: null, discom: "" };
  }
  const r = rows?.[0];
  if (!r) return null;
  const paras = (t: string) => t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return {
    published: Boolean(r.published), summary: tr(r, "summary", locale), about: paras(tr(r, "about", locale)),
    solarTypes: linesOf(tr(r, "solar_types", locale)), localNotes: paras(tr(r, "local_notes", locale)),
    seoTitle: tr(r, "seo_title", locale), seoDesc: tr(r, "seo_desc", locale), heroImage: (r.hero_image as string) || null, discom: String(r.discom ?? ""),
  };
});

/* ───────── Projects ───────── */

export type PublicProject = {
  id: number; slug: string | null; title: string; type: "home" | "farm" | "business"; district: string | null; districtName: string | null; area: string | null;
  kw: number | null; installDate: Date | null; savingsMonth: number | null; story: string; customer: string | null; quote: string; featured: boolean;
  photos: { src: string; thumb: string; alt: string }[];
};

export async function publishedProjects(locale: string): Promise<PublicProject[] | null> {
  return safe(async () => {
    const rows = await q<Row>(`SELECT p.*, d.slug AS district_slug, d.name_en AS d_en, d.name_te AS d_te FROM projects p LEFT JOIN districts d ON d.id = p.district_id
      WHERE p.status = 'published' AND p.deleted_at IS NULL AND p.customer_permission = 1 ORDER BY p.featured DESC, p.sort_order, p.install_date DESC, p.id DESC LIMIT 200`);
    if (!rows.length) return [];
    const photos = await q<{ project_id: number; path: string; thumb_path: string; alt: string; is_cover: number }>(
      `SELECT project_id, path, thumb_path, alt, is_cover FROM project_photos WHERE project_id IN (${rows.map(() => "?").join(",")}) ORDER BY is_cover DESC, sort_order, id`, rows.map((r) => Number(r.id)));
    return rows.map((r) => ({
      id: Number(r.id), slug: (r.slug as string) ?? null,
      title: String((locale === "te" && r.title_te) || r.title), type: r.type === "shop" ? "business" : (r.type as "home" | "farm"),
      district: (r.district_slug as string) ?? null, districtName: (locale === "te" ? (r.d_te as string) : (r.d_en as string)) ?? null, area: (r.area as string) ?? null,
      kw: r.kw === null ? null : Number(r.kw), installDate: (r.install_date as Date) ?? null, savingsMonth: r.savings_month === null ? null : Number(r.savings_month),
      story: tr(r, "story", locale), customer: (r.customer_name as string) || null, quote: tr(r, "quote", locale), featured: Boolean(r.featured),
      photos: photos.filter((p) => p.project_id === Number(r.id)).map((p) => ({ src: p.path, thumb: p.thumb_path, alt: p.alt })),
    }));
  }, null);
}

/* ───────── FAQs, testimonials ───────── */

export async function publishedFaqs(locale: string): Promise<{ q: string; a: string }[] | null> {
  return safe(async () => (await q<Row>("SELECT * FROM faqs WHERE published = 1 AND deleted_at IS NULL ORDER BY sort_order, id")).map((r) => ({ q: tr(r, "question", locale), a: tr(r, "answer", locale) })), null);
}

export async function publishedTestimonials(locale: string) {
  return safe(async () => (await q<Row>("SELECT * FROM testimonials WHERE approved = 1 AND deleted_at IS NULL ORDER BY sort_order, id DESC LIMIT 12"))
    .map((r) => ({ id: Number(r.id), name: String(r.name), place: (r.place as string) ?? null, type: String(r.type), text: tr(r, "text", locale) })), [] as { id: number; name: string; place: string | null; type: string; text: string }[]);
}

/* ───────── Guides ───────── */

export type PublicPost = { slug: string; kind: string; title: string; excerpt: string; body: string; cover: string | null; coverAlt: string; seoTitle: string; seoDesc: string; publishedAt: Date | null; updatedAt: Date | null };

const toPost = (r: Row, locale: string): PublicPost => ({
  slug: String(r.slug), kind: String(r.kind), title: tr(r, "title", locale), excerpt: tr(r, "excerpt", locale), body: tr(r, "body", locale),
  cover: (r.cover_image as string) || null, coverAlt: String(r.cover_alt ?? ""), seoTitle: tr(r, "seo_title", locale), seoDesc: tr(r, "seo_desc", locale),
  publishedAt: (r.published_at as Date) ?? null, updatedAt: (r.updated_at as Date) ?? null,
});

export async function publishedPosts(locale: string): Promise<PublicPost[]> {
  return safe(async () => (await q<Row>("SELECT * FROM posts WHERE status = 'published' AND deleted_at IS NULL ORDER BY COALESCE(published_at, created_at) DESC LIMIT 100")).map((r) => toPost(r, locale)), []);
}

export async function postBySlug(slug: string, locale: string): Promise<PublicPost | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  return safe(async () => { const r = (await q<Row>("SELECT * FROM posts WHERE slug = ? AND status = 'published' AND deleted_at IS NULL", [slug]))[0]; return r ? toPost(r, locale) : null; }, null);
}
