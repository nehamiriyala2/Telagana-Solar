import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BatteryCharging, Building, CircleCheck, Droplets, Factory, GraduationCap, Home, Hospital, Hotel, Leaf, ReceiptIndianRupee,
  Store, Sun, Tractor, Warehouse, Wheat, Zap,
} from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { BlurReveal as Reveal } from "@/components/motion/primitives";
import { HomeHeroArt } from "@/components/page/home-hero-art";
import { Bento, type BentoTone } from "@/components/page/bento";
import { BannerArt } from "@/components/page/banner-art";
import { titleEmphasis } from "@/data/pages";
import { pick } from "@/lib/utils";
import { PackageCard } from "@/components/cards/package-card";
import { HowItWorks } from "@/components/home/how-it-works";
import { FaqSection } from "@/components/home/home-sections";
import { businessPackages, homePackages, pumpSizesHp } from "@/config/packages";
import { routing } from "@/i18n/routing";
import { JsonLd, faqJsonLd, pageMeta } from "@/lib/seo";
import { SOLUTION_BENEFIT_PHOTOS, UI_IMAGES } from "@/data/section-photos";
import { PhotoTile } from "@/components/ui/photo-tile";
import { CheckPill } from "@/components/ui/check-pill";
import { Develop } from "@/components/motion/develop";

const SLUGS = ["homes", "farms", "business"] as const;
type Slug = (typeof SLUGS)[number];
const TYPE: Record<Slug, "home" | "farm" | "business"> = { homes: "home", farms: "farm", business: "business" };
const HERO_ICON = { homes: Home, farms: Wheat, business: Store } as const;
const BENEFIT_ICONS = {
  homes: [ReceiptIndianRupee, CircleCheck, Zap, Sun],
  farms: [Droplets, Sun, CircleCheck, Tractor],
  business: [ReceiptIndianRupee, Sun, CircleCheck, Leaf],
} as const;
/** Each solution gets its own colour treatment for the benefit cards. */
const BENTO_TONES: Record<Slug, BentoTone[]> = {
  homes: ["navy", "gold", "mint", "blue"],
  farms: ["green", "gold", "cream", "navy"],
  business: ["blue", "navy", "gold", "mint"],
};
const FAQ_KEYS: Record<Slug, string[]> = { homes: ["q1", "q2", "q3", "q7", "q8"], farms: ["q1", "q4", "q5", "q6"], business: ["q1", "q3", "q6", "q7", "q8"] };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!SLUGS.includes(slug as Slug)) return {};
  const t = await getTranslations({ locale, namespace: `solutionPages.${slug}` });
  return pageMeta({ locale, path: `/solutions/${slug}`, title: t("eyebrow"), description: t("subtitle") });
}

export default async function SolutionPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!SLUGS.includes(slug as Slug)) notFound();
  setRequestLocale(locale);
  const s = slug as Slug;
  const t = await getTranslations();
  const p = (k: string) => t(`solutionPages.${s}.${k}`);
  const tf = await getTranslations("faq");

  return (
    <>
      <JsonLd data={faqJsonLd(FAQ_KEYS[s].map((k) => ({ q: tf(`${k}.q`), a: tf(`${k}.a`) })))} />
      <PageHero eyebrow={p("eyebrow")} title={p("title")} emphasis={pick(titleEmphasis[s], locale)} subtitle={p("subtitle")} Icon={HERO_ICON[s]} calcType={TYPE[s]} underline art={s === "homes" ? <HomeHeroArt locale={locale} /> : <BannerArt kind={s} locale={locale} />} />

      {/* Benefits */}
      <section className="tone tone-white py-16 md:py-24">
        <div className="container-page">
          <Bento tones={BENTO_TONES[s]} items={(["b1", "b2", "b3", "b4"] as const).map((b, i) => ({ title: p(`${b}.title`), desc: p(`${b}.desc`), Icon: BENEFIT_ICONS[s][i], photo: SOLUTION_BENEFIT_PHOTOS[s]?.[i] }))} />
        </div>
      </section>

      {s === "homes" && (
        <section className="tone tone-cream py-16 md:py-24" aria-labelledby="pk">
          <div className="container-page">
            <SectionTitle index="01" title={p("packagesTitle")} subtitle={p("packagesSubtitle")} />
            <div className="grid gap-6 pt-3 sm:grid-cols-2 lg:grid-cols-4">
              {homePackages.map((pk, i) => <Reveal key={pk.id} delay={(i % 4) * 0.06} className="h-full"><PackageCard pkg={pk} premium /></Reveal>)}
            </div>
            <p className="mt-6 text-center text-caption text-muted">{t("common.estimatesNote")} {t("common.subsidyNote")}</p>
          </div>
        </section>
      )}

      {s === "farms" && (
        <>
          <section className="tone tone-cream py-16 md:py-24">
            <div className="container-page">
              <SectionTitle index="01" title={p("pumpsTitle")} subtitle={p("pumpsSubtitle")} />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pumpSizesHp.map((hp, i) => (
                  <Develop key={hp} index={i % 4}>
                    <li className="card-glass-light h-full list-none p-4">
                      <PhotoTile src={UI_IMAGES.pumps[i]} alt="" className="dv-photo aspect-[3/2] w-full rounded-2xl bg-tint-ice text-primary" fallback={<Droplets className="size-8" aria-hidden />} />
                      <h3 className="mt-4 px-1 font-heading text-h4 font-bold text-ink">{t("solutionPages.farms.hp", { value: hp })}</h3>
                      <p className="mt-2 px-1 pb-1 text-[0.9375rem] text-body">{p("pumpDesc")}</p>
                    </li>
                  </Develop>
                ))}
              </ul>
            </div>
          </section>
          <section className="tone tone-mint py-16 md:py-24">
            <div className="container-page">
              <SectionTitle index="02" title={p("usesTitle")} />
              <ul className="grid gap-4 md:grid-cols-3">
                {([["u1", Droplets], ["u2", Warehouse], ["u3", BatteryCharging]] as const).map(([u, Icon], i) => (
                  <Develop key={u} index={i % 3}>
                    <li className="card-glass-light h-full list-none p-3">
                      <PhotoTile src={UI_IMAGES.farmUses[u]} alt="" className="dv-photo aspect-[16/9] w-full rounded-2xl bg-tint-mint text-green-text" fallback={<Icon className="size-8" aria-hidden />} />
                      <div className="px-2 pt-4">
                        <h3 className="font-heading text-h4 font-bold text-ink">{p(`${u}.title`)}</h3>
                      </div>
                      <p className="mt-2 px-2 pb-2 text-[0.9375rem] text-body">{p(`${u}.desc`)}</p>
                    </li>
                  </Develop>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      {s === "business" && (
        <>
          <section className="tone tone-sky py-16 md:py-24">
            <div className="container-page">
              <SectionTitle index="01" title={p("segmentsTitle")} />
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {([["shops", Store], ["schools", GraduationCap], ["hospitals", Hospital], ["factories", Factory], ["offices", Building], ["hotels", Hotel]] as const).map(([k, Icon], i) => (
                  <Develop key={k} index={i % 3}>
                    <li className="card-glass-light flex h-full list-none flex-col gap-4 p-3 sm:flex-row sm:items-center">
                      <PhotoTile src={UI_IMAGES.segments[k]} alt="" className="dv-photo aspect-[16/10] w-full shrink-0 rounded-xl bg-tint-ice text-primary sm:w-1/2" fallback={<Icon className="size-8" strokeWidth={1.6} aria-hidden />} />
                      <span className="px-1 pb-1 font-heading text-[1.125rem] font-bold leading-snug text-ink">{p(k)}</span>
                    </li>
                  </Develop>
                ))}
              </ul>
            </div>
          </section>
          <section className="tone tone-cream py-16 md:py-24">
            <div className="container-page">
              <SectionTitle index="02" title={p("packagesTitle")} subtitle={p("packagesSubtitle")} />
              <div className="grid gap-6 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                {businessPackages.map((pk, i) => <Reveal key={pk.id} delay={i * 0.06} className="h-full"><PackageCard pkg={pk} premium /></Reveal>)}
              </div>
              <p className="mt-6 text-center text-caption text-muted">{t("common.estimatesNote")}</p>
            </div>
          </section>
        </>
      )}

      {/* What's included */}
      <section className="tone tone-navy py-16 md:py-24">
        <span aria-hidden className="tone-beam" />
        <div className="container-page grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <SectionTitle tone="dark" title={t("solutionPages.includedTitle")} className="mb-0 md:mb-0" />
            <span aria-hidden className="check-heading-bar" />
          </div>
          <ul className="grid gap-4 lg:col-span-8 lg:grid-cols-2">
            {(["i1", "i2", "i3", "i4", "i5", "i6"] as const).map((k, i) => (
              <Develop key={k} index={i} kind="row" className="h-full">
                <CheckPill className="h-full">{p(k)}</CheckPill>
              </Develop>
            ))}
          </ul>
        </div>
      </section>

      <HowItWorks premium />
      <FaqSection keys={FAQ_KEYS[s]} title={t("solutionPages.faqTitle")} premium />
    </>
  );
}
