import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ClipboardCheck, FileCheck2, MapPin, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Solutions } from "@/components/home/solutions";
import { HowItWorks } from "@/components/home/how-it-works";
import { FinalCta, Packages } from "@/components/home/home-sections";
import { districts } from "@/data/districts";
import { routing } from "@/i18n/routing";
import { JsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";

/**
 * City landing pages: /solar-installation/hyderabad, /te/solar-installation/warangal …
 * One page per Telangana district (33). Content is templated; add city-specific
 * paragraphs or projects later for stronger local SEO.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => districts.map((d) => ({ locale, city: d.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; city: string }> }): Promise<Metadata> {
  const { locale, city } = await params;
  const d = districts.find((x) => x.slug === city);
  if (!d) return {};
  const t = await getTranslations({ locale, namespace: "city" });
  const name = pick(d.name, locale);
  return pageMeta({ locale, path: `/solar-installation/${city}`, title: t("title", { city: name }), description: t("subtitle", { city: name }) });
}

export default async function CityPage({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale, city } = await params;
  const d = districts.find((x) => x.slug === city);
  if (!d) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("city");
  const name = pick(d.name, locale);
  const nearby = [...districts]
    .filter((x) => x.slug !== d.slug)
    .sort((a, b) => Math.hypot(a.lat - d.lat, a.lng - d.lng) - Math.hypot(b.lat - d.lat, b.lng - d.lng))
    .slice(0, 6);

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale, d.slug)} />
      <PageHero eyebrow={name} title={t("title", { city: name })} subtitle={t("subtitle", { city: name })} Icon={MapPin} />

      <section className="section pt-12 md:pt-16">
        <div className="container-page">
          <SectionHeading title={t("whyTitle", { city: name })} />
          <ul className="grid gap-4 md:grid-cols-3">
            {([["p1", ClipboardCheck], ["p2", FileCheck2], ["p3", Zap]] as const).map(([k, Icon], i) => (
              <Reveal key={k} delay={i * 0.06}>
                <li className="h-full list-none rounded-card border border-line bg-white p-6 shadow-soft">
                  <span className="grid size-12 place-items-center rounded-2xl bg-sky-tint text-sky-ink"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                  <h3 className="mt-5 font-heading font-bold">{t(`${k}.title`)}</h3>
                  <p className="mt-1 text-caption text-muted">{t(`${k}.desc`, { city: name })}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Solutions />
      <Packages />
      <HowItWorks />

      <section className="container-page pb-8">
        <h2 className="mb-4 text-h4">{t("areasTitle")}</h2>
        <ul className="flex flex-wrap gap-2">
          {nearby.map((n) => (
            <li key={n.slug}>
              <Link href={`/solar-installation/${n.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-caption font-semibold transition-colors hover:border-gold">
                <MapPin className="size-4 text-sky-ink" aria-hidden />{pick(n.name, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FinalCta />
    </>
  );
}
