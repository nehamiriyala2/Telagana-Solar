import type { Metadata } from "next";
import { site } from "@/config/site";
import { districts } from "@/data/districts";

/** Per-page metadata with canonical + hreflang alternates + Open Graph. `path` excludes the locale prefix. */
export function pageMeta({ locale, path, title, description }: { locale: string; path: string; title: string; description: string }): Metadata {
  const p = path === "/" ? "" : path;
  const url = `${locale === "te" ? "/te" : ""}${p}` || "/";
  return {
    title,
    description,
    alternates: { canonical: url, languages: { en: p || "/", te: `/te${p}`, "x-default": p || "/" } },
    openGraph: {
      title, description, url, type: "website", siteName: site.name,
      locale: locale === "te" ? "te_IN" : "en_IN",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** schema.org LocalBusiness. Fields still marked [EDIT] in config are omitted, not invented. */
export function localBusinessJsonLd(locale: string, areaSlug?: string) {
  const area = areaSlug ? districts.find((d) => d.slug === areaSlug) : null;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `${site.url}/#business`,
    name: site.name,
    description: site.tagline[locale === "te" ? "te" : "en"],
    url: site.url,
    image: `${site.url}/og-image.png`,
    logo: `${site.url}/brand/ts-apple-icon.png`,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      ...(site.address.street ? { streetAddress: site.address.street } : {}),
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHours: site.hours,
    areaServed: area
      ? [{ "@type": "City", name: area.name.en }, { "@type": "State", name: "Telangana" }]
      : [{ "@type": "State", name: "Telangana" }, ...site.serviceAreas.map((s) => ({ "@type": "City", name: districts.find((d) => d.slug === s)?.name.en }))],
    knowsLanguage: ["en", "te"],
  };
  if (site.phone) data.telephone = site.phone;
  if (site.email) data.email = site.email;
  const sameAs = Object.values(site.social).filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
