import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Award, BadgeIndianRupee, HandHeart, Headset, ShieldCheck, Sun, UserRound } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { EditMark } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { FinalCta } from "@/components/home/home-sections";
import { certifications, team } from "@/config/content";
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

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = await getLocale();

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} Icon={Sun} />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <Reveal className="rounded-card border border-line bg-white p-7 shadow-soft md:p-10">
            <h2 className="text-h3">{t("storyTitle")}</h2>
            <p className="mt-4 text-muted"><WithEdit text={t("story")} /></p>
          </Reveal>
          <Reveal delay={0.08} className="rounded-card bg-[linear-gradient(135deg,#FFF1D6,#FFFBF2)] p-7 md:p-10">
            <h2 className="text-h3">{t("missionTitle")}</h2>
            <p className="mt-4 text-navy-700 md:text-body-lg">{t("mission")}</p>
          </Reveal>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-page">
          <SectionHeading title={t("valuesTitle")} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([["v1", HandHeart], ["v2", ShieldCheck], ["v3", BadgeIndianRupee], ["v4", Headset]] as const).map(([k, Icon], i) => (
              <Reveal key={k} delay={i * 0.06}>
                <li className="h-full list-none rounded-card border border-line bg-white p-6 shadow-soft">
                  <span className="grid size-12 place-items-center rounded-2xl bg-sky-tint text-sky-ink"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                  <h3 className="mt-5 font-heading font-bold">{t(`${k}.title`)}</h3>
                  <p className="mt-1 text-caption text-muted">{t(`${k}.desc`)}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <SectionHeading title={t("teamTitle")} />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <li className="list-none rounded-card border border-line bg-white p-6 text-center shadow-soft">
                  <span className="mx-auto grid size-24 place-items-center overflow-hidden rounded-full bg-sky-tint text-sky-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {m.photo ? <img src={m.photo} alt={m.name ?? ""} loading="lazy" className="size-full object-cover" /> : <UserRound className="size-10" aria-hidden />}
                  </span>
                  <p className="mt-4 font-heading font-bold">{m.name ?? <EditMark label="[EDIT] name" />}</p>
                  <p className="mt-1 text-caption text-muted">{m.role ? pick(m.role, loc) : <EditMark label="[EDIT] role" />}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-sky-tint/60">
        <div className="container-page">
          <SectionHeading title={t("certTitle")} subtitle={t("certNote")} />
          <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {certifications.map((c) => (
              <li key={c.name} className="flex flex-col items-center gap-3 rounded-card border border-line bg-white p-6 text-center shadow-soft">
                <Award className="size-8 text-sky-ink" aria-hidden />
                <span className="font-semibold">{c.name.includes("[EDIT]") ? <WithEdit text={c.name} /> : c.name}</span>
                {c.detail && <span className="text-caption text-muted">{c.detail}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
