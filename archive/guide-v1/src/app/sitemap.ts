import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const PATHS = ["", "/finder", "/what-can-solar-run", "/bill-calculator", "/schemes", "/installers"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.8,
    alternates: { languages: { en: `${BASE}${p}`, te: `${BASE}/te${p}` } },
  }));
}
