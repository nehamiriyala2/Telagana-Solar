import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeIndianRupee, Banknote, CalendarClock, FileText, Landmark } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { BlurReveal as Reveal, DrawLine } from "@/components/motion/primitives";
import { titleEmphasis } from "@/data/pages";
import { pick } from "@/lib/utils";
import { Wave } from "@/components/page/tone-section";
import { BannerArt } from "@/components/page/banner-art";
import { EmiCalculator } from "@/components/calculator/emi-calculator";
import { pageMeta } from "@/lib/seo";

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

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} emphasis={pick(titleEmphasis.subsidy, locale)} subtitle={t("subtitle")} Icon={BadgeIndianRupee} calcType="home" tone="dark" motif="grid" underline art={<BannerArt kind="subsidy-loans" locale={locale} />} />

      {/* Step-by-step subsidy guide */}
      <section className="tone tone-cream py-16 md:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5"><SectionTitle index="01" title={t("stepsTitle")} subtitle={tc("subsidyNote")} className="lg:sticky lg:top-28" /></div>
          <ol className="relative lg:col-span-7">
            <DrawLine className="absolute bottom-6 left-[26px] top-6 w-1 rounded-full bg-gold/70" />
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((s, i) => (
              <Reveal key={s} delay={i * 0.06}>
                <li className="relative flex gap-5 pb-8 last:pb-0">
                  <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-primary font-heading text-h4 font-extrabold text-[#F0BE4A] ring-8 ring-[#F7FAFD]">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 rounded-[1.25rem] border border-[#F0BE4A]/25 bg-white p-5 shadow-[0_18px_40px_-30px_rgb(27_69_112/0.35)] transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-[#F0BE4A]/60">
                    <h3 className="font-heading text-[1.125rem] font-bold text-ink">{t(`${s}.title`)}</h3>
                    <p className="mt-1 text-caption text-muted">{t(`${s}.desc`)}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* EMI */}
      <section className="tone tone-blue pb-16 pt-24 md:pb-24 md:pt-32">
        <span aria-hidden className="tone-beam" />
        <Wave color="#F7FAFD" position="top" />
        <div className="container-page">
          <SectionTitle tone="dark" index="02" title={t("emiTitle")} subtitle={t("emiSubtitle")} />
          <Reveal className="rounded-[1.25rem] bg-white p-3 shadow-[0_50px_100px_-40px_rgb(0_0_0/0.55)] ring-1 ring-white/40 md:p-6"><EmiCalculator /></Reveal>
        </div>
      </section>

      {/* Ways to pay + documents */}
      <section className="tone tone-navy py-16 md:py-24">
        <span aria-hidden className="tone-beam" />
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle tone="dark" index="03" title={t("loansTitle")} className="mb-8 md:mb-8" />
            <ul className="space-y-4">
              {([["l1", Banknote], ["l2", Landmark], ["l3", CalendarClock]] as const).map(([k, Icon], i) => (
                <Reveal key={k} delay={i * 0.06}>
                  <li className="card-dark-glass flex gap-4 p-5">
                    <span className="float-soft grid size-12 shrink-0 place-items-center rounded-2xl bg-gold text-ink"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                    <div><h3 className="font-heading font-bold text-white">{t(`${k}.title`)}</h3><p className="on-dark-muted mt-1 text-caption">{t(`${k}.desc`)}</p></div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.25rem] bg-[#F7FAFD] p-6 text-ink shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] md:p-9">
            <SectionTitle title={t("docsTitle")} className="mb-6 md:mb-6" />
            <ul className="grid gap-3">
              {(["d1", "d2", "d3", "d4", "d5"] as const).map((k, i) => (
                <Reveal key={k} delay={i * 0.04}>
                  <li className="flex items-center gap-3 rounded-2xl border border-[#F0BE4A]/25 bg-white px-4 py-3.5 text-ink transition-colors hover:border-gold/60"><span className="icon-sun grid size-9 shrink-0 place-items-center rounded-xl"><FileText className="size-4" aria-hidden /></span>{t(k)}</li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
