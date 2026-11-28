import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeIndianRupee, Banknote, CalendarClock, FileText, Landmark } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { PhotoTile } from "@/components/ui/photo-tile";
import { UI_IMAGES } from "@/data/section-photos";
import { BlurReveal as Reveal } from "@/components/motion/primitives";
import { titleEmphasis } from "@/data/pages";
import { pick } from "@/lib/utils";
import { Wave } from "@/components/page/tone-section";
import { BannerArt } from "@/components/page/banner-art";
import { EmiCalculator } from "@/components/calculator/emi-calculator";
import { SubsidyTimeline } from "@/components/page/subsidy-timeline";
import { pageMeta } from "@/lib/seo";
import { Develop } from "@/components/motion/develop";

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
          <div className="lg:col-span-7">
            <SubsidyTimeline items={(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((s) => ({ title: t(`${s}.title`), desc: t(`${s}.desc`), img: UI_IMAGES.subsidySteps[s] }))} />
          </div>
        </div>
      </section>

      {/* EMI */}
      <section className="tone tone-blue pb-16 pt-24 md:pb-24 md:pt-32">
        <span aria-hidden className="tone-beam" />
        <Wave color="#F5F0E6" position="top" />
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
                <Develop key={k} index={i} kind="row">
                  <li className="card-dark-glass flex items-center gap-5 p-4">
                    <PhotoTile src={UI_IMAGES.pay[k]} alt="" className="size-[72px] shrink-0 rounded-xl bg-white/10 text-white" fallback={<Icon className="size-7" strokeWidth={1.6} aria-hidden />} />
                    <div><h3 className="font-heading font-bold text-white">{t(`${k}.title`)}</h3><p className="on-dark-muted mt-1 text-caption">{t(`${k}.desc`)}</p></div>
                  </li>
                </Develop>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.25rem] bg-[#F5F0E6] p-6 text-ink shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] md:p-9">
            <SectionTitle title={t("docsTitle")} className="mb-6 md:mb-6" />
            <ul className="grid gap-3">
              {(["d1", "d2", "d3", "d4", "d5"] as const).map((k, i) => (
                <Develop key={k} index={i} kind="row">
                  <li className="flex items-center gap-4 rounded-2xl border border-card-line bg-white p-2 pr-4 text-ink transition-colors hover:border-primary/40"><PhotoTile src={UI_IMAGES.docs[k]} alt="" className="h-12 w-20 shrink-0 rounded-lg bg-tint-ice text-primary" fallback={<FileText className="size-4" aria-hidden />} /><span className="font-medium">{t(k)}</span></li>
                </Develop>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
