import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CircleCheck, Landmark, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { FinalCta } from "@/components/home/home-sections";
import { SCHEME_ICONS } from "@/components/home/schemes-section";
import { TiltCard } from "@/components/motion/tilt-card";
import { BlurReveal, DrawLine, Marquee, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SCHEMES } from "@/config/schemes";
import { districts } from "@/data/districts";
import { schemesPage as D } from "@/data/schemes";
import { titleEmphasis } from "@/data/pages";
import { pageMeta } from "@/lib/seo";
import { site } from "@/config/site";
import { pick } from "@/lib/utils";
import { Wave } from "@/components/page/tone-section";
import { SchemeHeroArt } from "@/components/page/scheme-hero-art";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "schemes" });
  return pageMeta({ locale, path: "/schemes", title: t("eyebrow"), description: t("subtitle") });
}

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** /schemes: hero → districts marquee → scheme cards → comparison → how we handle the paperwork → CTA. */
export default async function SchemesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("schemes");
  const L = (v: { en: string; te: string }) => pick(v, locale);

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        emphasis={L(titleEmphasis.schemes)}
        subtitle={t("subtitle")}
        Icon={Landmark}
        tone="dark"
        motif="orbits"
        reveal="slide"
        art={<SchemeHeroArt />}
        artSpan="wide"
        gapClassName="gap-8 lg:gap-8 xl:gap-12"
      />

      {/* Districts marquee */}
      <section aria-labelledby="districts-strip" className="relative overflow-hidden border-y border-[#1265D8]/10 bg-[radial-gradient(ellipse_50%_120%_at_50%_0%,rgb(255_215_106/0.18),transparent_60%),linear-gradient(180deg,#F4F9FF_0%,#E8F3FF_100%)] py-8 shadow-[inset_0_1px_0_#fff,0_18px_40px_-34px_rgb(7_27_73/0.45)] md:py-10">
        <p id="districts-strip" className="container-page mb-2 flex items-center justify-center gap-2 text-center text-caption font-bold uppercase tracking-[0.08em] text-[#1265D8] md:text-[0.9375rem]">
          <MapPin className="size-4" aria-hidden />{L(D.marqueeLabel)}
        </p>
        <Marquee speed={80} gap="pr-3 md:pr-4" items={
          districts.map((d) => {
            const main = (site.serviceAreas as readonly string[]).includes(d.slug);
            return (
              <Link key={d.slug} href={`/solar-installation/${d.slug}`} className={main ? "city-chip city-chip--main" : "city-chip"}>
                <MapPin className="size-4 md:size-[1.125rem]" aria-hidden />{pick(d.name, locale)}
                {main && <span aria-hidden className="size-2 rounded-full bg-[#FFB800] shadow-[0_0_8px_#FFB800]" />}
              </Link>
            );
          })
        } />
      </section>

      {/* Scheme cards */}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page">
          <Stagger className="grid gap-5 md:grid-cols-2">
            {SCHEMES.map((s) => {
              const Icon = SCHEME_ICONS[s.slug];
              return (
                <StaggerItem key={s.slug} className="list-none">
                  <TiltCard max={5} className="h-full rounded-[1.75rem]">
                    <Link href={`/schemes/${s.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white p-7 shadow-[0_24px_50px_-34px_rgb(7_23_63/0.35)] transition-[border-color,box-shadow] duration-500 hover:border-gold/50 hover:shadow-[0_34px_70px_-34px_rgb(7_23_63/0.45)] md:p-9">
                      <span aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgb(255_199_44/0.22),transparent_65%)] transition-transform duration-700 group-hover:scale-125" />
                      <span className="relative flex items-center justify-between gap-3">
                        <span className="icon-sun grid size-14 place-items-center rounded-2xl"><Icon className="size-7" aria-hidden /></span>
                        <span className="rounded-full bg-[#F1F7FF] px-3 py-1 text-caption font-bold text-royal">{t(`items.${s.slug}.tag`)}</span>
                      </span>
                      <h2 className="relative mt-6 font-heading text-[1.625rem] font-extrabold leading-tight tracking-[-0.02em] text-navy md:text-[2rem]">{t(`items.${s.slug}.name`)}</h2>
                      <p className="relative mt-2 text-muted">{t(`items.${s.slug}.short`)}</p>
                      <dl className="relative mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-[#F7FBFF] p-4"><dt className="text-[0.75rem] font-bold uppercase tracking-wide text-royal">{t("cardWho")}</dt><dd className="mt-1 text-caption text-navy">{t(`items.${s.slug}.cardWho`)}</dd></div>
                        <div className="rounded-2xl bg-[#FFF8E6] p-4"><dt className="text-[0.75rem] font-bold uppercase tracking-wide text-gold-ink">{t("cardBenefit")}</dt><dd className="mt-1 text-caption text-navy">{t(`items.${s.slug}.cardBenefit`)}</dd></div>
                      </dl>
                      <span className="relative mt-auto flex items-center gap-2 pt-6 font-semibold text-royal">{t("learnMore")}<ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden /></span>
                    </Link>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </Stagger>
          <p className="mt-6 text-center text-caption text-muted">{t("note")}</p>
        </div>
      </section>

      {/* Comparison */}
      <section className="tone tone-navy pb-16 pt-24 md:pb-24 md:pt-32" aria-label={L(D.compareTitle)}>
        <span aria-hidden className="tone-beam" />
        <Wave color="#FFFFFF" position="top" />
        <div className="container-page">
          <SectionTitle tone="dark" index="02" title={L(D.compareTitle)} emphasis={L(D.compareEmphasis)} />
          <BlurReveal className="hidden overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_24px_50px_-34px_rgb(7_23_63/0.35)] md:block">
            <table className="w-full text-left text-caption">
              <thead className="bg-[#F1F7FF] text-[0.75rem] uppercase tracking-wide text-royal">
                <tr>{(["scheme", "for", "who", "benefit", "via"] as const).map((c) => <th key={c} scope="col" className="px-5 py-4 font-bold">{L(D.compareCols[c])}</th>)}</tr>
              </thead>
              <tbody>
                {SCHEMES.map((s) => (
                  <tr key={s.slug} className="border-t border-line align-top transition-colors hover:bg-[#FFFBF2]">
                    <th scope="row" className="px-5 py-5"><Link href={`/schemes/${s.slug}`} className="font-heading text-[1rem] font-bold text-navy hover:text-royal">{t(`items.${s.slug}.name`)}</Link></th>
                    <td className="px-5 py-5"><span className="rounded-full bg-[#F1F7FF] px-2.5 py-1 font-bold text-royal">{t(`items.${s.slug}.tag`)}</span></td>
                    <td className="px-5 py-5 text-navy">{t(`items.${s.slug}.cardWho`)}</td>
                    <td className="px-5 py-5 text-navy">{t(`items.${s.slug}.cardBenefit`)}</td>
                    <td className="px-5 py-5"><a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap font-semibold text-royal hover:underline">{host(s.officialUrl)}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </BlurReveal>
          {/* Phones: one card per scheme */}
          <Stagger className="grid gap-4 md:hidden">
            {SCHEMES.map((s) => (
              <StaggerItem key={s.slug} className="list-none rounded-[1.5rem] border border-line bg-white p-5 shadow-soft">
                <Link href={`/schemes/${s.slug}`} className="font-heading text-[1.125rem] font-bold text-navy">{t(`items.${s.slug}.name`)}</Link>
                <dl className="mt-3 space-y-2 text-caption">
                  <div><dt className="font-bold text-royal">{L(D.compareCols.who)}</dt><dd className="text-navy">{t(`items.${s.slug}.cardWho`)}</dd></div>
                  <div><dt className="font-bold text-gold-ink">{L(D.compareCols.benefit)}</dt><dd className="text-navy">{t(`items.${s.slug}.cardBenefit`)}</dd></div>
                  <div><dt className="font-bold text-muted">{L(D.compareCols.via)}</dt><dd><a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-royal">{host(s.officialUrl)}</a></dd></div>
                </dl>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Process */}
      <section className="tone tone-cream py-16 md:py-24" aria-label={L(D.processTitle)}>
        <div className="container-page">
          <SectionTitle index="03" title={L(D.processTitle)} emphasis={L(D.processEmphasis)} />
          <div className="relative">
            <DrawLine axis="x" className="absolute left-[12%] right-[12%] top-7 hidden h-1 rounded-full bg-[linear-gradient(90deg,#FFC72C,#F5A800,#4DA3FF)] md:block" />
            <DrawLine className="absolute bottom-6 left-7 top-6 w-1 rounded-full bg-[linear-gradient(180deg,#FFC72C,#F5A800,#4DA3FF)] md:hidden" />
            <Stagger as="ol" className="relative grid gap-8 md:grid-cols-4 md:gap-6">
              {D.process.map((p, i) => (
                <StaggerItem key={i} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
                  <span className="icon-sun relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl font-heading text-h4 font-extrabold ring-8 ring-[#FFF9E9]">{i + 1}</span>
                  <div>
                    <h3 className="font-heading text-[1.125rem] font-bold text-navy">{L(p.title)}</h3>
                    <p className="mt-1 text-caption text-muted">{L(p.desc)}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <BlurReveal className="mt-12 flex flex-wrap justify-center gap-3">
            {SCHEMES.map((s) => (
              <Link key={s.slug} href={`/schemes/${s.slug}`} className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-caption font-semibold text-navy transition-colors hover:border-gold">
                <CircleCheck className="size-4 text-leaf" aria-hidden />{t(`items.${s.slug}.name`)}
              </Link>
            ))}
          </BlurReveal>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
