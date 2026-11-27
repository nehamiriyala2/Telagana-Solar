import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeIndianRupee, HandHeart, Headset, ShieldCheck, Sun, UserRound } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { UI_IMAGES } from "@/data/section-photos";
import { StatCounter } from "@/components/page/stat-counter";
import { EditMark } from "@/components/ui/badge";
import { TiltCard } from "@/components/motion/tilt-card";
import { BlurReveal, Marquee, Stagger, StaggerItem } from "@/components/motion/primitives";
import { team } from "@/config/content";
import { site } from "@/config/site";
import { districts } from "@/data/districts";
import { aboutPage as D } from "@/data/about";
import { titleEmphasis } from "@/data/pages";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";
import { Wave } from "@/components/page/tone-section";
import { BannerArt } from "@/components/page/banner-art";
import { Bento } from "@/components/page/bento";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMeta({ locale, path: "/about", title: t("eyebrow"), description: t("subtitle") });
}

/** Renders a string, turning any "[EDIT]" inside it into a visible marker. */
function WithEdit({ text }: { text: string }) {
  const parts = text.split("[EDIT]");
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && <EditMark className="mr-1" />}{p}</span>)}</>;
}

const VALUES = [["v1", HandHeart], ["v2", ShieldCheck], ["v3", BadgeIndianRupee], ["v4", Headset]] as const;

/** About: hero → story + mission → values (tilt cards) → how we work (self-drawing line) → reach (counter + districts marquee) → team → CTA. */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = await getLocale();
  const L = (v: { en: string; te: string }) => pick(v, locale);

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        emphasis={L(titleEmphasis.about)}
        subtitle={t("subtitle")}
        Icon={Sun}
        art={
          <BannerArt
            kind="about"
            locale={locale}
            className="max-w-xl lg:max-w-none lg:w-[110%] xl:w-[118%] 2xl:w-[124%] lg:origin-right xl:-mr-6 2xl:-mr-10"
            cardClassName="p-2.5 sm:p-3 rounded-[1.25rem] sm:rounded-[1.25rem] border-white/80 bg-white/45 shadow-[0_40px_90px_-30px_rgb(41_52_64/0.38),0_0_0_1px_rgb(255_255_255/0.8)]"
          />
        }
        motif="waves"
        reveal="slide"
        underline
        artSpan="wide"
        gapClassName="gap-8 lg:gap-10 xl:gap-14"
      />

      {/* Story + mission */}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page grid gap-6 lg:grid-cols-12">
          <BlurReveal className="flex flex-col justify-center rounded-[1.25rem] border border-line bg-white p-7 shadow-soft md:p-10 lg:col-span-5">
            <p className="eyebrow-pill">{L(D.storyEyebrow)}</p>
            <h2 className="mt-5 font-heading text-h3 font-extrabold tracking-[-0.02em] text-ink">{t("storyTitle")}</h2>
            <div className="mt-5 space-y-3.5 text-muted leading-relaxed text-[0.9375rem] md:text-body">
              {t("story")
                .split("\n\n")
                .map((paragraph, idx) => (
                  <p key={idx} className={idx === 2 ? "font-semibold text-ink/90 pt-0.5" : ""}>
                    {paragraph}
                  </p>
                ))}
            </div>
          </BlurReveal>
          <BlurReveal
            delay={0.08}
            className="relative flex flex-col justify-center overflow-hidden rounded-[1.25rem] border border-[#64758A]/45 bg-transparent p-7 ring-1 ring-gold/30 md:p-12 lg:col-span-7"
          >
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-transparent" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/80 px-3.5 py-1 text-caption font-bold uppercase tracking-[0.08em] text-gold-ink backdrop-blur-sm">
                <Sun className="size-3.5 text-gold-ink" aria-hidden />
                {t("missionTitle")}
              </span>
              <blockquote className="mt-6 font-heading text-[1.625rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-ink md:text-[2.25rem]">
                <span aria-hidden className="mr-1 text-gold">“</span>{t("mission")}<span aria-hidden className="text-gold">”</span>
              </blockquote>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* Values */}
      <section className="tone tone-white py-16 md:py-24">
        <div className="container-page">
          <SectionTitle index="01" title={t("valuesTitle")} emphasis={L(D.valuesEmphasis)} />
          <Bento tones={["gold", "navy", "mint", "blue"]} items={VALUES.map(([k, Icon], i) => ({ title: t(`${k}.title`), desc: t(`${k}.desc`), Icon, photo: UI_IMAGES.values[i] }))} />
        </div>
      </section>

      {/* How we work */}
      <section className="tone tone-navy pb-16 pt-24 md:pb-24 md:pt-32">
        <span aria-hidden className="tone-beam" />
        <Wave color="#FFFFFF" position="top" />
        <div className="container-page">
          <SectionTitle tone="dark" index="02" title={L(D.promiseTitle)} emphasis={L(D.promiseEmphasis)} />
          <Stagger as="ol" className="grid gap-px overflow-hidden rounded-[1.25rem] bg-card-line p-px shadow-[0_24px_60px_-24px_rgb(0_0_0/0.45)] sm:grid-cols-2 md:grid-cols-4">
            {D.promise.map((p, i) => (
              <StaggerItem key={i} className="zoom-frame group relative flex flex-col bg-white">
                <span className="relative block aspect-[8/5] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={UI_IMAGES.working[i]} alt="" loading="lazy" className="zoom-img size-full object-cover" />
                  <span aria-hidden className="absolute bottom-3 left-4 grid size-11 place-items-center rounded-xl bg-primary font-heading text-[1rem] font-extrabold text-white ring-2 ring-white tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <div className="flex-1 p-6">
                  <h3 className="font-heading text-[1.25rem] font-bold text-ink">{L(p.title)}</h3>
                  <p className="mt-2 text-[0.9375rem] text-body">{L(p.desc)}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>


      {/* Reach */}
      <section className="tone tone-cream py-16 md:py-20">
        <div className="container-page mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <BlurReveal>
            <p className="font-heading text-[clamp(4rem,12vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-ink">
              {site.stats.districts !== null ? <StatCounter value={site.stats.districts} /> : <EditMark />}
            </p>
            <p className="mt-2 font-heading text-[1.25rem] font-bold text-ink md:text-[1.5rem]">{L(D.reachTitle)}</p>
          </BlurReveal>
          <BlurReveal delay={0.1}><p className="max-w-sm text-muted">{L(D.reachNote)}</p></BlurReveal>
        </div>
        <Marquee speed={70} items={districts.map((d) => <span key={d.slug} className="block rounded-full border border-gold/30 bg-white/80 px-5 py-2.5 font-semibold text-ink shadow-soft">{pick(d.name, locale)}</span>)} />
      </section>

      {/* Team / Founders */}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page">
          <SectionTitle title={t("teamTitle")} />
          <Stagger className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <StaggerItem key={i} className="list-none">
                <TiltCard max={5} className="h-full rounded-[1.25rem]">
                  <div className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-soft transition-all duration-300 hover:border-gold/50 hover:shadow-card hover:-translate-y-1">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-mist">
                      {m.photo ? (
                        <Image
                          src={m.photo}
                          alt={m.name ?? ""}
                          width={600}
                          height={750}
                          className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-primary-hover/60">
                          <UserRound className="size-20" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                      <h3 className="font-heading text-[1.25rem] font-bold text-ink">{m.name}</h3>
                      <p className="mt-1 text-caption font-semibold text-primary-hover uppercase tracking-wider">{m.role ? pick(m.role, loc) : ""}</p>
                      <span aria-hidden className="mt-3 h-0.5 w-8 rounded-full bg-gold" />
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
