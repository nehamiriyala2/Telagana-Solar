import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { districts } from "@/data/districts";
import { SCHEMES } from "@/config/schemes";

const PAGES = [
  "", "/solutions", "/solutions/homes", "/solutions/farms", "/solutions/business",
  "/savings-calculator", "/find-my-solar-plan", "/schemes", "/subsidy-loans", "/projects", "/about", "/contact", "/privacy", "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const entry = (p: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
    alternates: { languages: { en: `${base}${p}`, te: `${base}/te${p}` } },
  });
  return [
    ...PAGES.map((p) => entry(p, p === "" ? 1 : p.startsWith("/solutions") || p === "/savings-calculator" ? 0.9 : 0.6)),
    ...SCHEMES.map((sc) => entry(`/schemes/${sc.slug}`, 0.8)),
    ...districts.map((d) => entry(`/solar-installation/${d.slug}`, site.serviceAreas.includes(d.slug as never) ? 0.8 : 0.5)),
  ];
}
