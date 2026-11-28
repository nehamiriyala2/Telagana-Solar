import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { districts } from "@/data/districts";
import { SCHEMES } from "@/config/schemes";
import { publishedPosts, publishedSchemes } from "@/lib/public-content";

const PAGES = [
  "", "/solutions", "/solutions/homes", "/solutions/farms", "/solutions/business",
  "/savings-calculator", "/find-my-solar-plan", "/schemes", "/subsidy-loans", "/projects", "/guides", "/about", "/contact", "/privacy", "/terms",
];

/** Static pages + published schemes and guides from the admin (built-in schemes without a database). */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const entry = (p: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
    alternates: { languages: { en: `${base}${p}`, te: `${base}/te${p}` } },
  });
  const [schemes, posts] = await Promise.all([publishedSchemes("en"), publishedPosts("en")]);
  const schemeSlugs = schemes ? schemes.map((s) => s.slug) : SCHEMES.map((s) => s.slug);
  return [
    ...PAGES.map((p) => entry(p, p === "" ? 1 : p.startsWith("/solutions") || p === "/savings-calculator" ? 0.9 : 0.6)),
    ...schemeSlugs.map((slug) => entry(`/schemes/${slug}`, 0.8)),
    ...posts.map((p) => entry(`/guides/${p.slug}`, 0.6)),
    ...districts.map((d) => entry(`/solar-installation/${d.slug}`, site.serviceAreas.includes(d.slug as never) ? 0.8 : 0.5)),
  ];
}
