import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeIndianRupee, Banknote, CalendarClock, FileText, Landmark } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
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
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} Icon={BadgeIndianRupee} calcType="home" />

      {/* Step-by-step subsidy guide */}
      <section className="section" aria-labelledby="steps-title">
        <div className="container-page">
          <SectionHeading title={t("stepsTitle")} subtitle={tc("subsidyNote")} />
          <ol className="relative mx-auto max-w-3xl">
            <span aria-hidden className="absolute bottom-6 left-[23px] top-6 w-0.5 bg-gradient-to-b from-gold via-amber to-sky" />
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((s, i) => (
              <Reveal key={s} delay={i * 0.06}>
                <li className="relative flex gap-5 pb-8 last:pb-0">
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-gold font-heading font-extrabold text-navy ring-8 ring-white">{i + 1}</span>
                  <div className="rounded-card border border-line bg-white p-5 shadow-soft">
                    <h3 className="font-heading text-[1.0625rem] font-bold">{t(`${s}.title`)}</h3>
                    <p className="mt-1 text-caption text-muted">{t(`${s}.desc`)}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* EMI */}
      <section className="section bg-sky-tint/60" aria-labelledby="emi-title">
        <div className="container-page">
          <SectionHeading title={t("emiTitle")} subtitle={t("emiSubtitle")} />
          <Reveal><EmiCalculator /></Reveal>
        </div>
      </section>

      {/* Ways to pay + documents */}
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-h2">{t("loansTitle")}</h2>
            <ul className="space-y-4">
              {([["l1", Banknote], ["l2", Landmark], ["l3", CalendarClock]] as const).map(([k, Icon], i) => (
                <Reveal key={k} delay={i * 0.06}>
                  <li className="flex gap-4 rounded-card border border-line bg-white p-5 shadow-soft">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-tint text-sky-ink"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                    <div><h3 className="font-heading font-bold">{t(`${k}.title`)}</h3><p className="mt-1 text-caption text-muted">{t(`${k}.desc`)}</p></div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-h2">{t("docsTitle")}</h2>
            <ul className="grid gap-3">
              {(["d1", "d2", "d3", "d4", "d5"] as const).map((k, i) => (
                <Reveal key={k} delay={i * 0.04}>
                  <li className="flex items-center gap-3 rounded-2xl border border-line bg-cream px-4 py-3.5"><FileText className="size-5 text-sky-ink" aria-hidden />{t(k)}</li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FaqSection keys={FAQ} title={t("faqTitle")} />
      <FinalCta />
    </>
  );
}
