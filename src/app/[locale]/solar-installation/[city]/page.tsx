import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CircleCheck, ClipboardCheck, FileCheck2, Info, MapPin, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Solutions } from "@/components/home/solutions";
import { HowItWorks } from "@/components/home/how-it-works";
import { districts } from "@/data/districts";
import { routing } from "@/i18n/routing";
import { JsonLd, localBusinessJsonLd, pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";
import { districtContent } from "@/lib/public-content";

/**
 * City landing pages: /solar-installation/hyderabad, /te/solar-installation/warangal …
 * One page per Telangana district (33). Templated text, plus what staff write in Admin → Districts
 * (summary, about, popular solar types, local notes, SEO). A district switched off there returns 404.
 */
export const revalidate = 300;
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => districts.map((d) => ({ locale, city: d.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; city: string }> }): Promise<Metadata> {
  const { locale, city } = await params;
  const d = districts.find((x) => x.slug === city);
  if (!d) return {};
  const t = await getTranslations({ locale, namespace: "city" });
  const name = pick(d.name, locale);
  const c = await districtContent(city, locale);
  return pageMeta({ locale, path: `/solar-installation/${city}`, title: c?.seoTitle || t("title", { city: name }), description: c?.seoDesc || c?.summary || t("subtitle", { city: name }) });
}

export default async function CityPage({ params }: { params: Promise<{ locale: string; city: string }> }) {
  const { locale, city } = await params;
  const d = districts.find((x) => x.slug === city);
  if (!d) notFound();
  setRequestLocale(locale);
  const c = await districtContent(city, locale);
  if (c && !c.published) notFound();
  const t = await getTranslations("city");
  const name = pick(d.name, locale);
  const te = locale === "te";
  const nearby = [...districts]
    .filter((x) => x.slug !== d.slug)
    .sort((a, b) => Math.hypot(a.lat - d.lat, a.lng - d.lng) - Math.hypot(b.lat - d.lat, b.lng - d.lng))
    .slice(0, 6);

  return (
    <>
      <JsonLd data={localBusinessJsonLd(locale, d.slug)} />
      <PageHero eyebrow={name} title={t("title", { city: name })} subtitle={c?.summary || t("subtitle", { city: name })} Icon={MapPin} />

      {c && (c.about.length > 0 || c.solarTypes.length > 0 || c.localNotes.length > 0) && (
        <section className="bg-section-white py-14 md:py-20">
          <div className="container-page grid gap-8 lg:grid-cols-12">
            {c.about.length > 0 && (
              <div className="lg:col-span-7">
                <h2 className="text-h3 font-bold text-ink">{te ? `${name}లో సోలార్` : `Solar in ${name}`}</h2>
                <div className="mt-4 space-y-4 text-body">{c.about.map((para, i) => <p key={i}>{para}</p>)}</div>
              </div>
            )}
            <div className="space-y-6 lg:col-span-5">
              {c.solarTypes.length > 0 && (
                <div className="card-glass-light p-6">
                  <h2 className="font-heading text-h4 font-bold text-ink">{te ? "ఇక్కడ ఎక్కువగా ఎంచుకునేవి" : "Popular here"}</h2>
                  <ul className="mt-3 space-y-2">{c.solarTypes.map((x) => <li key={x} className="flex gap-2 text-ink"><CircleCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />{x}</li>)}</ul>
                </div>
              )}
              {c.localNotes.length > 0 && (
                <div className="rounded-[1.25rem] border border-line bg-white p-6 shadow-soft">
                  <h2 className="flex items-center gap-2 font-heading text-h4 font-bold text-ink"><Info className="size-5 text-gold-ink" aria-hidden />{te ? "స్థానిక వివరాలు" : "Local notes"}</h2>
                  <div className="mt-3 space-y-3 text-caption text-body">{c.localNotes.map((para, i) => <p key={i}>{para}</p>)}</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-premium-light py-16 md:py-24">
        <div className="container-page">
          <SectionHeading premium title={t("whyTitle", { city: name })} />
          <ul className="grid gap-4 md:grid-cols-3">
            {([["p1", ClipboardCheck], ["p2", FileCheck2], ["p3", Zap]] as const).map(([k, Icon], i) => (
              <Reveal key={k} delay={i * 0.06}>
                <li className="card-glass-light h-full list-none p-6">
                  <span className="float-soft icon-primary-hover grid size-12 place-items-center rounded-2xl"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                  <h3 className="mt-5 font-heading font-bold text-ink">{t(`${k}.title`)}</h3>
                  <p className="mt-1 text-caption text-muted">{t(`${k}.desc`, { city: name })}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Solutions />
      <HowItWorks premium />

      <section className="container-page pb-8 pt-4">
        <h2 className="mb-4 text-h4 text-ink">{t("areasTitle")}</h2>
        <ul className="flex flex-wrap gap-2">
          {nearby.map((n) => (
            <li key={n.slug}>
              <Link href={`/solar-installation/${n.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-caption font-semibold text-ink shadow-soft transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold">
                <MapPin className="size-4 text-primary-hover" aria-hidden />{pick(n.name, locale)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
