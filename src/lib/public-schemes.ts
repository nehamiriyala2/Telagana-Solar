import "server-only";
import { getTranslations } from "next-intl/server";
import { SCHEMES } from "@/config/schemes";
import { schemesPage as D } from "@/data/schemes";
import { pick } from "@/lib/utils";
import { publishedSchemes, schemeBySlug, type PublicScheme } from "@/lib/public-content";

/**
 * Scheme text for the public pages: Admin → Schemes (published only) merged with the built-in messages.
 * Short card texts (tag, who, benefit) exist in the messages for the 4 built-in schemes; new schemes use the admin fields.
 */
export type SchemeCard = { slug: string; name: string; short: string; tag: string; cardWho: string; cardBenefit: string; audience: string; officialUrl: string | null };
export type SchemeView = SchemeCard & { benefit: string; who: string[]; documents: string[]; steps: string[]; help: string[]; status: PublicScheme["status"]; others: SchemeCard[] };

const firstSentence = (t: string) => (t.split(/(?<=[.!?।])\s/)[0] ?? t).slice(0, 160);

async function messagesFor(locale: string) {
  const t = await getTranslations({ locale, namespace: "schemes" });
  const has = (slug: string, k: string) => t.has(`items.${slug}.${k}`);
  const get = (slug: string, k: string) => (has(slug, k) ? t(`items.${slug}.${k}`) : "");
  const list = (slug: string, prefix: string, n: number) => Array.from({ length: n }, (_, i) => get(slug, `${prefix}${i + 1}`)).filter(Boolean);
  return { get, list };
}

function card(slug: string, db: PublicScheme | null, m: Awaited<ReturnType<typeof messagesFor>>): SchemeCard {
  const known = SCHEMES.find((s) => s.slug === slug);
  return {
    slug, name: db?.name || m.get(slug, "name"), short: db?.short || m.get(slug, "short"),
    tag: m.get(slug, "tag") || (db?.authority ? db.authority.split(/[,(]/)[0].trim() : ""),
    cardWho: m.get(slug, "cardWho") || (db?.who[0] ?? ""), cardBenefit: m.get(slug, "cardBenefit") || firstSentence(db?.benefit ?? ""),
    audience: known?.audience ?? "home", officialUrl: db?.officialUrl ?? known?.officialUrl ?? null,
  };
}

/** Published schemes as cards (list page, home section). Without a database: the 4 built-in schemes. */
export async function schemeCards(locale: string): Promise<SchemeCard[]> {
  const [db, m] = await Promise.all([publishedSchemes(locale), messagesFor(locale)]);
  if (!db) return SCHEMES.map((s) => card(s.slug, null, m));
  return db.map((s) => card(s.slug, s, m));
}

/** Everything the scheme page shows, or null (→ 404) for an unknown or unpublished scheme. */
export async function schemeView(slug: string, locale: string): Promise<SchemeView | null> {
  const [db, m, cards] = await Promise.all([schemeBySlug(slug, locale), messagesFor(locale), schemeCards(locale)]);
  if (db === "missing") return null;
  if (!db && !SCHEMES.some((s) => s.slug === slug)) return null;
  const c = card(slug, db, m);
  const help = m.list(slug, "h", 4);
  return {
    ...c,
    benefit: db?.benefit || m.get(slug, "benefit"),
    who: db?.who.length ? db.who : m.list(slug, "w", 3),
    documents: db?.documents.length ? db.documents : m.list(slug, "d", 4),
    steps: db?.steps.length ? db.steps : m.list(slug, "s", 5),
    help: help.length ? help : D.process.map((p) => pick(p.title, locale)),
    status: db?.status ?? "active",
    others: cards.filter((x) => x.slug !== slug).slice(0, 3),
  };
}
