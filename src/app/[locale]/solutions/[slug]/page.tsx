import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BatteryCharging, Building, CircleCheck, Droplets, Factory, GraduationCap, Home, Hospital, Hotel, Leaf, ReceiptIndianRupee,
  Store, Sun, Tractor, Warehouse, Wheat, Zap,
} from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { PackageCard } from "@/components/cards/package-card";
import { HowItWorks } from "@/components/home/how-it-works";
import { FaqSection, FinalCta } from "@/components/home/home-sections";
import { businessPackages, homePackages, pumpSizesHp } from "@/config/packages";
import { routing } from "@/i18n/routing";
import { JsonLd, faqJsonLd, pageMeta } from "@/lib/seo";

const SLUGS = ["homes", "farms", "business"] as const;
type Slug = (typeof SLUGS)[number];
const TYPE: Record<Slug, "home" | "farm" | "business"> = { homes: "home", farms: "farm", business: "business" };
const HERO_ICON = { homes: Home, farms: Wheat, business: Store } as const;
const BENEFIT_ICONS = {
  homes: [ReceiptIndianRupee, CircleCheck, Zap, Sun],
  farms: [Droplets, Sun, CircleCheck, Tractor],
  business: [ReceiptIndianRupee, Sun, CircleCheck, Leaf],
} as const;
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
      <PageHero eyebrow={p("eyebrow")} title={p("title")} subtitle={p("subtitle")} Icon={HERO_ICON[s]} calcType={TYPE[s]} />

      {/* Benefits */}
      <section className="section pt-12 md:pt-16">
        <div className="container-page">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["b1", "b2", "b3", "b4"] as const).map((b, i) => {
              const Icon = BENEFIT_ICONS[s][i];
              return (
                <Reveal key={b} delay={i * 0.06}>
                  <li className="h-full list-none rounded-card border border-line bg-white p-6 shadow-soft transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift">
                    <span className="grid size-12 place-items-center rounded-2xl bg-sky-tint text-sky-ink"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                    <h2 className="mt-5 font-heading text-[1.0625rem] font-bold">{p(`${b}.title`)}</h2>
                    <p className="mt-2 text-caption text-muted">{p(`${b}.desc`)}</p>
                  </li>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {s === "homes" && (
        <section className="section bg-cream" aria-labelledby="pk">
          <div className="container-page">
            <SectionHeading title={p("packagesTitle")} subtitle={p("packagesSubtitle")} />
            <div className="grid gap-6 pt-3 sm:grid-cols-2 lg:grid-cols-4">
              {homePackages.map((pk, i) => <Reveal key={pk.id} delay={(i % 4) * 0.06} className="h-full"><PackageCard pkg={pk} /></Reveal>)}
            </div>
            <p className="mt-6 text-center text-caption text-muted">{t("common.estimatesNote")} {t("common.subsidyNote")}</p>
          </div>
        </section>
      )}

      {s === "farms" && (
        <>
          <section className="section bg-cream">
            <div className="container-page">
              <SectionHeading title={p("pumpsTitle")} subtitle={p("pumpsSubtitle")} />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pumpSizesHp.map((hp, i) => (
                  <Reveal key={hp} delay={i * 0.06}>
                    <li className="h-full list-none rounded-card border border-line bg-white p-6 shadow-soft transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift">
                      <Droplets className="size-8 text-sky" aria-hidden />
                      <h3 className="mt-4 text-h4">{t("solutionPages.farms.hp", { value: hp })}</h3>
                      <p className="mt-2 text-caption text-muted">{p("pumpDesc")}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
          <section className="section">
            <div className="container-page">
              <SectionHeading title={p("usesTitle")} />
              <ul className="grid gap-4 md:grid-cols-3">
                {([["u1", Droplets], ["u2", Warehouse], ["u3", BatteryCharging]] as const).map(([u, Icon], i) => (
                  <Reveal key={u} delay={i * 0.06}>
                    <li className="h-full list-none rounded-card border border-line bg-gradient-to-b from-[#EAF7EE] to-white p-6 shadow-soft">
                      <Icon className="size-8 text-whatsapp" aria-hidden />
                      <h3 className="mt-4 text-h4">{p(`${u}.title`)}</h3>
                      <p className="mt-2 text-caption text-muted">{p(`${u}.desc`)}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      {s === "business" && (
        <>
          <section className="section bg-cream">
            <div className="container-page">
              <SectionHeading title={p("segmentsTitle")} />
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {([["shops", Store], ["schools", GraduationCap], ["hospitals", Hospital], ["factories", Factory], ["offices", Building], ["hotels", Hotel]] as const).map(([k, Icon], i) => (
                  <Reveal key={k} delay={(i % 3) * 0.06}>
                    <li className="flex h-full list-none items-center gap-4 rounded-card border border-line bg-white p-5 shadow-soft transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-tint text-sky-ink"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                      <span className="font-heading font-bold">{p(k)}</span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
          <section className="section">
            <div className="container-page">
              <SectionHeading title={p("packagesTitle")} subtitle={p("packagesSubtitle")} />
              <div className="grid gap-6 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                {businessPackages.map((pk, i) => <Reveal key={pk.id} delay={i * 0.06} className="h-full"><PackageCard pkg={pk} /></Reveal>)}
              </div>
              <p className="mt-6 text-center text-caption text-muted">{t("common.estimatesNote")}</p>
            </div>
          </section>
        </>
      )}

      {/* What's included */}
      <section className={s === "farms" ? "section bg-cream" : "section"}>
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4"><h2 className="text-h2 md:text-h2-lg">{t("solutionPages.includedTitle")}</h2></Reveal>
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {(["i1", "i2", "i3", "i4", "i5", "i6"] as const).map((k, i) => (
              <Reveal key={k} delay={i * 0.04}>
                <li className="flex h-full list-none items-start gap-3 rounded-2xl border border-line bg-white p-4">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />{p(k)}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <HowItWorks />
      <FaqSection keys={FAQ_KEYS[s]} title={t("solutionPages.faqTitle")} />
      <FinalCta title={t("solutionPages.ctaTitle", { type: t(`types.${TYPE[s]}.long`) })} defaultType={TYPE[s]} />
    </>
  );
}
