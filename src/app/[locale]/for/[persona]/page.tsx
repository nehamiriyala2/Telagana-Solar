import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page/page-hero";
import { SolarBackdrop } from "@/components/page/solar-backdrop";
import Image from "next/image";
import { PhotoCard } from "@/components/page/banner-art";
import { personaMedia } from "@/data/personas-media";
import { pick } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { SchemesSection } from "@/components/home/schemes-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { FaqSection } from "@/components/home/home-sections";
import { PERSONA_ICONS } from "@/components/tools/persona-icons";
import { PERSONAS, personaConfig, type Persona } from "@/config/personas";
import { routing } from "@/i18n/routing";
import { JsonLd, faqJsonLd, pageMeta } from "@/lib/seo";

/** One page per visitor type: /for/urban, /for/farmer, /te/for/landlord … */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => PERSONAS.map((persona) => ({ locale, persona })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; persona: string }> }): Promise<Metadata> {
  const { locale, persona } = await params;
  if (!PERSONAS.includes(persona as Persona)) return {};
  const t = await getTranslations({ locale, namespace: `personas.${persona}` });
  return pageMeta({ locale, path: `/for/${persona}`, title: t("title"), description: t("intro") });
}

export default async function PersonaPage({ params }: { params: Promise<{ locale: string; persona: string }> }) {
  const { locale, persona } = await params;
  if (!PERSONAS.includes(persona as Persona)) notFound();
  setRequestLocale(locale);
  const p = persona as Persona;
  const cfg = personaConfig[p];
  const t = await getTranslations();
  const tf = await getTranslations("faq");
  const Icon = PERSONA_ICONS[p];

  return (
    <>
      <JsonLd data={faqJsonLd(cfg.faq.map((k) => ({ q: tf(`${k}.q`), a: tf(`${k}.a`) })))} />
      <PageHero eyebrow={t(`personas.${p}.name`)} title={t(`personas.${p}.title`)} subtitle={t(`personas.${p}.intro`)} Icon={Icon} calcType={cfg.type}
        art={personaMedia[p] ? (
          <PhotoCard sun={personaMedia[p]!.page.sun}>
            <Image src={personaMedia[p]!.page.src} alt={pick(personaMedia[p]!.alt, locale)} width={personaMedia[p]!.page.width} height={personaMedia[p]!.page.height}
              priority sizes="(min-width: 1024px) 34rem, 100vw" className="banner-kenburns block h-auto w-full" />
          </PhotoCard>
        ) : undefined} />

      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="relative isolate h-full overflow-hidden rounded-[1.25rem] p-7 text-white shadow-lift md:p-9"><SolarBackdrop tone="dark" sun={{ x: "92%", y: "8%" }} particles={false} />
              <p className="text-caption font-bold uppercase tracking-wide text-yellow">{t("personaPage.recommendTitle")}</p>
              <p className="mt-3 font-heading text-h3 font-extrabold">{t(`personas.${p}.solution`)}</p>
              <p className="mt-4 text-caption text-silver">“{t(`personas.${p}.question`)}”</p>
              <Button asChild variant="primary" className="mt-6"><Link href={`/solutions/${cfg.solution}`}>{t("personaPage.seeSolution")}<ArrowRight aria-hidden /></Link></Button>
            </div>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {(["p1", "p2", "p3", "p4"] as const).map((k, i) => (
              <Reveal key={k} delay={i * 0.06}>
                <li className="card-glass-light flex h-full list-none gap-3 p-5">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />
                  <div>
                    <h2 className="font-heading font-bold text-ink">{t(`personas.${p}.${k}.title`)}</h2>
                    <p className="mt-1 text-caption text-muted">{t(`personas.${p}.${k}.desc`)}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <SchemesSection only={cfg.schemes} title={t("personaPage.schemesTitle")} premium />
      <HowItWorks premium />
      <FaqSection keys={cfg.faq} premium />
    </>
  );
}
