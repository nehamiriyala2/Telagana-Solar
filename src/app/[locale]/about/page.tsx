import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Award, BadgeIndianRupee, HandHeart, Headset, ShieldCheck, Sun, UserRound } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { StatCounter } from "@/components/page/stat-counter";
import { EditMark } from "@/components/ui/badge";
import { TiltCard } from "@/components/motion/tilt-card";
import { BlurReveal, DrawLine, Marquee, Stagger, StaggerItem } from "@/components/motion/primitives";
import { FinalCta } from "@/components/home/home-sections";
import { certifications, team } from "@/config/content";
import { site } from "@/config/site";
import { districts } from "@/data/districts";
import { aboutPage as D } from "@/data/about";
import { titleEmphasis } from "@/data/pages";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";

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

/** About: hero → story + mission → values (tilt cards) → how we work (self-drawing line) → reach (counter + districts marquee) → team → certifications → CTA. */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = await getLocale();
  const L = (v: { en: string; te: string }) => pick(v, locale);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} emphasis={L(titleEmphasis.about)} subtitle={t("subtitle")} Icon={Sun} />

      {/* Story + mission */}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page grid gap-6 lg:grid-cols-12">
          <BlurReveal className="rounded-[1.75rem] border border-line bg-white p-7 shadow-soft md:p-10 lg:col-span-5">
            <p className="eyebrow-pill">{L(D.storyEyebrow)}</p>
            <h2 className="mt-5 font-heading text-h3 font-extrabold tracking-[-0.02em] text-navy">{t("storyTitle")}</h2>
            <p className="mt-4 text-muted md:text-body-lg"><WithEdit text={t("story")} /></p>
          </BlurReveal>
          <BlurReveal delay={0.08} className="bg-premium-sun relative overflow-hidden rounded-[1.75rem] p-7 ring-1 ring-gold/25 md:p-12 lg:col-span-7">
            <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full border-2 border-yellow/50 shadow-[0_0_60px_-10px_rgb(255_199_44/0.6)]" />
            <h2 className="relative text-caption font-bold uppercase tracking-[0.08em] text-gold-ink">{t("missionTitle")}</h2>
            <blockquote className="relative mt-5 font-heading text-[1.625rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-navy md:text-[2.25rem]">
              <span aria-hidden className="mr-1 text-gold">“</span>{t("mission")}<span aria-hidden className="text-gold">”</span>
            </blockquote>
          </BlurReveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-premium-light py-16 md:py-24">
        <div className="container-page">
          <SectionTitle title={t("valuesTitle")} emphasis={L(D.valuesEmphasis)} />
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(([k, Icon], i) => (
              <StaggerItem key={k} className="list-none">
                <TiltCard className="h-full rounded-[1.75rem]">
                  <div className="card-glass-light h-full p-7 hover:transform-none">
                    <span className="float-soft icon-royal grid size-14 place-items-center rounded-2xl" style={{ animationDelay: `${i * -1.4}s` }}><Icon className="size-7" strokeWidth={1.6} aria-hidden /></span>
                    <h3 className="mt-6 font-heading text-[1.25rem] font-extrabold text-navy">{t(`${k}.title`)}</h3>
                    <p className="mt-2 text-muted">{t(`${k}.desc`)}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* How we work */}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page">
          <SectionTitle title={L(D.promiseTitle)} emphasis={L(D.promiseEmphasis)} />
          <div className="relative">
            <DrawLine axis="x" className="absolute left-[12%] right-[12%] top-7 hidden h-1 rounded-full bg-[linear-gradient(90deg,#FFC72C,#F5A800,#4DA3FF)] md:block" />
            <DrawLine className="absolute bottom-6 left-7 top-6 w-1 rounded-full bg-[linear-gradient(180deg,#FFC72C,#F5A800,#4DA3FF)] md:hidden" />
            <Stagger as="ol" className="relative grid gap-8 md:grid-cols-4 md:gap-6">
              {D.promise.map((p, i) => (
                <StaggerItem key={i} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
                  <span className="icon-sun relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl font-heading text-h4 font-extrabold ring-8 ring-white">{i + 1}</span>
                  <div>
                    <h3 className="font-heading text-[1.125rem] font-bold text-navy">{L(p.title)}</h3>
                    <p className="mt-1 text-caption text-muted">{L(p.desc)}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Reach */}
      <section className="bg-premium-sun overflow-hidden py-16 md:py-20">
        <div className="container-page mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <BlurReveal>
            <p className="font-heading text-[clamp(4rem,12vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-navy">
              {site.stats.districts !== null ? <StatCounter value={site.stats.districts} /> : <EditMark />}
            </p>
            <p className="mt-2 font-heading text-[1.25rem] font-bold text-navy md:text-[1.5rem]">{L(D.reachTitle)}</p>
          </BlurReveal>
          <BlurReveal delay={0.1}><p className="max-w-sm text-muted">{L(D.reachNote)}</p></BlurReveal>
        </div>
        <Marquee speed={70} items={districts.map((d) => <span key={d.slug} className="block rounded-full border border-gold/30 bg-white/80 px-5 py-2.5 font-semibold text-navy shadow-soft">{pick(d.name, locale)}</span>)} />
      </section>

      {/* Team */}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page">
          <SectionTitle title={t("teamTitle")} />
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <StaggerItem key={i} className="list-none">
                <TiltCard max={6} className="h-full rounded-[1.75rem]">
                  <div className="h-full rounded-[1.75rem] border border-line bg-white p-7 text-center shadow-soft">
                    <span className="mx-auto grid size-28 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#EAF4FF,#FFF3D1)] text-royal ring-4 ring-white shadow-soft">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {m.photo ? <img src={m.photo} alt={m.name ?? ""} loading="lazy" className="size-full object-cover" /> : <UserRound className="size-12" aria-hidden />}
                    </span>
                    <p className="mt-5 font-heading text-[1.125rem] font-bold text-navy">{m.name ?? <EditMark label="[EDIT] name" />}</p>
                    <p className="mt-1 text-caption text-muted">{m.role ? pick(m.role, loc) : <EditMark label="[EDIT] role" />}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-premium-light py-16 md:py-24">
        <div className="container-page">
          <SectionTitle title={t("certTitle")} subtitle={t("certNote")} align="center" />
          <Stagger className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {certifications.map((c) => (
              <StaggerItem key={c.name} className="card-glass-light flex list-none flex-col items-center gap-3 p-6 text-center">
                <span className="icon-sun grid size-12 place-items-center rounded-2xl"><Award className="size-6" aria-hidden /></span>
                <span className="font-semibold text-navy">{c.name.includes("[EDIT]") ? <WithEdit text={c.name} /> : c.name}</span>
                {c.detail && <span className="text-caption text-muted">{c.detail}</span>}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
