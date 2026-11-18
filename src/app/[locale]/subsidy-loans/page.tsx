import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeIndianRupee, Banknote, CalendarClock, FileText, Landmark } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { BlurReveal as Reveal, DrawLine } from "@/components/motion/primitives";
import { titleEmphasis } from "@/data/pages";
import { pick } from "@/lib/utils";
import { EmiCalculator } from "@/components/calculator/emi-calculator";
import { FaqSection, FinalCta } from "@/components/home/home-sections";
import { JsonLd, faqJsonLd, pageMeta } from "@/lib/seo";

const FAQ = ["q2", "q3", "q6", "q7", "q1", "q8"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "subsidyPage" });
  return pageMeta({ locale, path: "/subsidy-loans", title: t("eyebrow"), description: t("subtitle") });
}

export default async function SubsidyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("subsidyPage");
  const tc = await getTranslations("common");
  const tf = await getTranslations("faq");

  return (
    <>
      <JsonLd data={faqJsonLd(FAQ.map((k) => ({ q: tf(`${k}.q`), a: tf(`${k}.a`) })))} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} emphasis={pick(titleEmphasis.subsidy, locale)} subtitle={t("subtitle")} Icon={BadgeIndianRupee} calcType="home" tone="dark" />

      {/* Step-by-step subsidy guide */}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page">
          <SectionTitle title={t("stepsTitle")} subtitle={tc("subsidyNote")} />
          <ol className="relative max-w-3xl">
            <DrawLine className="absolute bottom-6 left-[26px] top-6 w-1 rounded-full bg-[linear-gradient(180deg,#FFC72C,#F5A800,#4DA3FF)]" />
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((s, i) => (
              <Reveal key={s} delay={i * 0.06}>
                <li className="relative flex gap-5 pb-8 last:pb-0">
                  <span className="icon-sun relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl font-heading text-h4 font-extrabold ring-8 ring-white">{i + 1}</span>
                  <div className="card-glass-light flex-1 p-5">
                    <h3 className="font-heading text-[1.125rem] font-bold text-navy">{t(`${s}.title`)}</h3>
                    <p className="mt-1 text-caption text-muted">{t(`${s}.desc`)}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* EMI */}
      <section className="bg-premium-light py-16 md:py-24">
        <div className="container-page">
          <SectionTitle title={t("emiTitle")} subtitle={t("emiSubtitle")} />
          <Reveal className="rounded-[2rem] border border-white bg-white/70 p-3 shadow-[0_40px_90px_-50px_rgb(7_23_63/0.45)] backdrop-blur-xl md:p-6"><EmiCalculator /></Reveal>
        </div>
      </section>

      {/* Ways to pay + documents */}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle title={t("loansTitle")} className="mb-8 md:mb-8" />
            <ul className="space-y-4">
              {([["l1", Banknote], ["l2", Landmark], ["l3", CalendarClock]] as const).map(([k, Icon], i) => (
                <Reveal key={k} delay={i * 0.06}>
                  <li className="card-glass-light flex gap-4 p-5">
                    <span className="float-soft icon-royal grid size-12 shrink-0 place-items-center rounded-2xl"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                    <div><h3 className="font-heading font-bold text-navy">{t(`${k}.title`)}</h3><p className="mt-1 text-caption text-muted">{t(`${k}.desc`)}</p></div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle title={t("docsTitle")} className="mb-8 md:mb-8" />
            <ul className="grid gap-3">
              {(["d1", "d2", "d3", "d4", "d5"] as const).map((k, i) => (
                <Reveal key={k} delay={i * 0.04}>
                  <li className="flex items-center gap-3 rounded-2xl border border-line bg-cream px-4 py-3.5 text-navy transition-colors hover:border-gold/50"><span className="icon-sun grid size-9 shrink-0 place-items-center rounded-xl"><FileText className="size-4" aria-hidden /></span>{t(k)}</li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FaqSection keys={FAQ} title={t("faqTitle")} premium />
      <FinalCta />
    </>
  );
}
