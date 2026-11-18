import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Lightbulb } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { FullCalculator } from "@/components/calculator/full-calculator";
import { FinalCta } from "@/components/home/home-sections";
import { StatCounter } from "@/components/page/stat-counter";
import { BlurReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { calculatorConfig as C } from "@/config/calculator";
import { calculatorPage as D } from "@/data/calculator-page";
import { titleEmphasis } from "@/data/pages";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculator" });
  return pageMeta({ locale, path: "/savings-calculator", title: t("eyebrow"), description: t("subtitle") });
}

/** Savings calculator: hero → the existing full calculator (unchanged) → how we estimate (live config values) → tips → CTA. */
export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("calculator");
  const L = (v: { en: string; te: string }) => pick(v, locale);
  const stats = [
    { key: "generation", value: C.generationPerKwMonth, prefix: "" },
    { key: "roof", value: C.sqftPerKw, prefix: "" },
    { key: "tariff", value: C.tariffPerUnit.home, prefix: "₹", decimals: 1 },
    { key: "life", value: C.lifetimeYears, prefix: "" },
  ];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} emphasis={L(titleEmphasis.calculator)} subtitle={t("subtitle")} ctas={false} align="center" motif="orbits" />

      <section className="relative -mt-8 pb-16 md:-mt-12 md:pb-24">
        <div className="container-page">
          <BlurReveal className="rounded-[2rem] border border-white bg-white/70 p-3 shadow-[0_40px_90px_-50px_rgb(7_23_63/0.45)] backdrop-blur-xl md:p-6">
            <FullCalculator />
          </BlurReveal>
        </div>
      </section>

      <section className="tone tone-navy py-16 md:py-24">
        <span aria-hidden className="tone-beam" />
        <div className="container-page">
          <SectionTitle tone="dark" index="01" title={L(D.assumptionsTitle)} emphasis={L(D.assumptionsEmphasis)} subtitle={L(D.assumptionsNote)} />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <StaggerItem key={s.key} className="card-dark-glass list-none p-6">
                <p className="font-heading text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] text-white">
                  <StatCounter value={s.value} prefix={s.prefix} decimals={s.decimals} />
                  <span className="ml-1 text-[1rem] font-bold text-[#FFD76A]">{L(D.stats[s.key].suffix).trim()}</span>
                </p>
                <p className="on-dark-muted mt-3 text-caption">{L(D.stats[s.key].label)}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <BlurReveal className="bg-premium-sun mt-10 rounded-[1.75rem] p-7 ring-1 ring-gold/25 md:p-9">
            <h2 className="flex items-center gap-3 font-heading text-h3 font-extrabold tracking-[-0.02em] text-navy"><span className="icon-sun grid size-10 place-items-center rounded-xl"><Lightbulb className="size-5" aria-hidden /></span>{L(D.tipsTitle)}</h2>
            <ul className="mt-5 grid gap-3 md:grid-cols-3">
              {D.tips.map((tip, i) => <li key={i} className="rounded-2xl bg-white/80 p-4 text-navy shadow-soft">{L(tip)}</li>)}
            </ul>
          </BlurReveal>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
