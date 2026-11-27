import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeIndianRupee, Banknote, CalendarClock, FileText, Landmark } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { PhotoTile } from "@/components/ui/photo-tile";
import { UI_IMAGES } from "@/data/section-photos";
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
            <DrawLine className="absolute bottom-6 left-[13px] top-6 w-0.5 rounded-full bg-primary/50" />
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((s, i) => (
              <Reveal key={s} delay={i * 0.06}>
                <li className="relative flex items-center gap-5 pb-5 last:pb-0">
                  <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full bg-primary font-heading text-[0.8125rem] font-bold text-white ring-4 ring-cloud">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex flex-1 items-center gap-4 rounded-[1.25rem] border border-card-line bg-white p-2.5 pr-5 shadow-[0_10px_30px_rgb(11_31_58/0.10)] transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40">
                    <PhotoTile src={UI_IMAGES.subsidySteps[s]} alt="" className="size-[72px] shrink-0 rounded-xl bg-tint-ice" />
                    <div className="min-w-0">
                      <h3 className="font-heading text-[1.125rem] font-bold text-ink">{t(`${s}.title`)}</h3>
                      <p className="mt-1 text-[0.9375rem] text-body">{t(`${s}.desc`)}</p>
                    </div>
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
                <Reveal key={k} delay={i * 0.06}>
                  <li className="card-dark-glass flex items-center gap-5 p-4">
                    <PhotoTile src={UI_IMAGES.pay[k]} alt="" className="size-[72px] shrink-0 rounded-xl bg-white/10 text-white" fallback={<Icon className="size-7" strokeWidth={1.6} aria-hidden />} />
                    <div><h3 className="font-heading font-bold text-white">{t(`${k}.title`)}</h3><p className="on-dark-muted mt-1 text-caption">{t(`${k}.desc`)}</p></div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.25rem] bg-[#F5F0E6] p-6 text-ink shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] md:p-9">
            <SectionTitle title={t("docsTitle")} className="mb-6 md:mb-6" />
            <ul className="grid gap-3">
              {(["d1", "d2", "d3", "d4", "d5"] as const).map((k, i) => (
                <Reveal key={k} delay={i * 0.04}>
                  <li className="flex items-center gap-4 rounded-2xl border border-card-line bg-white p-2 pr-4 text-ink transition-colors hover:border-primary/40"><PhotoTile src={UI_IMAGES.docs[k]} alt="" className="h-12 w-20 shrink-0 rounded-lg bg-tint-ice text-primary" fallback={<FileText className="size-4" aria-hidden />} /><span className="font-medium">{t(k)}</span></li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
