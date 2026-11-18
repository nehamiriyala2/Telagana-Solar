import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CircleCheck, ExternalLink, FileText, HandHelping, Info } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { Button } from "@/components/ui/button";
import { EditMark } from "@/components/ui/badge";
import { SCHEME_ICONS } from "@/components/home/schemes-section";
import { FinalCta } from "@/components/home/home-sections";
import { TiltCard } from "@/components/motion/tilt-card";
import { BlurReveal, DrawLine, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SCHEMES, type SchemeSlug } from "@/config/schemes";
import { schemesPage as D } from "@/data/schemes";
import { titleEmphasis } from "@/data/pages";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";
import { Wave } from "@/components/page/tone-section";
import Image from "next/image";
import { BannerArt, Sunlight } from "@/components/page/banner-art";
import { pmSuryaGharSign, solutionBanners } from "@/data/solution-hero";

/** Scheme page: hero → at a glance → benefit → who can apply → documents → steps (self-drawing line) → how we help → other schemes. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SCHEMES.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!SCHEMES.some((s) => s.slug === slug)) return {};
  const t = await getTranslations({ locale, namespace: `schemes.items.${slug}` });
  return pageMeta({ locale, path: `/schemes/${slug}`, title: t("name"), description: t("short") });
}

export default async function SchemePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const scheme = SCHEMES.find((s) => s.slug === slug);
  if (!scheme) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("schemes");
  const k = (key: string) => t(`items.${slug}.${key}`);
  const L = (v: { en: string; te: string }) => pick(v, locale);
  const Icon = SCHEME_ICONS[slug as SchemeSlug];
  const others = SCHEMES.filter((s) => s.slug !== slug);
  const timeline = L(D.timelineValue);

  return (
    <div data-accent={slug}>
      <PageHero eyebrow={t("eyebrow")} title={k("name")} emphasis={L(titleEmphasis[slug as SchemeSlug])} subtitle={k("short")} Icon={Icon} calcType={scheme.audience === "farm" ? "farm" : "home"} underline
        art={slug in solutionBanners ? <BannerArt kind={slug as "pm-surya-ghar" | "pm-kusum" | "net-metering" | "state-schemes"} locale={locale} /> : undefined}>
        <dl className="grid gap-3 sm:grid-cols-3">
          <Glance label={t("cardWho")} value={k("cardWho")} />
          <Glance label={t("cardBenefit")} value={k("cardBenefit")} />
          <Glance label={L(D.timeline)} value={timeline.includes("[EDIT") ? <EditMark label={timeline} /> : timeline} />
        </dl>
      </PageHero>

      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <BlurReveal className="relative overflow-hidden rounded-[1.75rem] p-7 md:p-10" style={{ background: "radial-gradient(ellipse 70% 80% at 100% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%), linear-gradient(135deg, var(--accent-soft), #ffffff)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent)" }}>
              <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full border-2" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }} />
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: "var(--accent)" }} />
              <p className="eyebrow-pill relative">{t("benefit")}</p>
              <p className="relative mt-5 font-heading text-[1.25rem] font-bold leading-snug text-navy md:text-[1.5rem]">{k("benefit")}</p>
              <p className="relative mt-5 flex gap-2 text-caption font-semibold text-gold-ink"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />{t("note")}</p>
            </BlurReveal>

            {slug === "pm-surya-ghar" && (
              <BlurReveal className="zoom-frame relative overflow-hidden rounded-[1.75rem] border border-white bg-white p-2 shadow-[0_30px_60px_-34px_rgb(7_23_63/0.5)]">
                <div className="relative overflow-hidden rounded-[1.4rem]">
                  <Image src={pmSuryaGharSign.src} alt={pick(pmSuryaGharSign.alt, locale)} width={pmSuryaGharSign.width} height={pmSuryaGharSign.height}
                    sizes="(min-width: 1024px) 40rem, 100vw" className="zoom-img block h-auto w-full" />
                  <Sunlight sun={pmSuryaGharSign.sun} />
                </div>
              </BlurReveal>
            )}

            <BlurReveal className="rounded-[1.75rem] border border-line bg-white p-7 shadow-soft md:p-9">
              <h2 className="font-heading text-h3 font-extrabold tracking-[-0.02em] text-navy">{t("who")}</h2>
              <Stagger className="mt-5 space-y-3">
                {["w1", "w2", "w3"].map((w) => (
                  <StaggerItem key={w} className="flex gap-3 rounded-2xl p-4 text-navy" style={{ background: "var(--accent-soft)" }}><CircleCheck className="mt-0.5 size-5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden />{k(w)}</StaggerItem>
                ))}
              </Stagger>
            </BlurReveal>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <BlurReveal delay={0.08} className="rounded-[1.75rem] border border-line bg-white p-7 shadow-soft md:p-9">
              <h2 className="font-heading text-h3 font-extrabold tracking-[-0.02em] text-navy">{t("documents")}</h2>
              <Stagger className="mt-5 grid gap-2">
                {["d1", "d2", "d3", "d4"].map((d) => (
                  <StaggerItem key={d} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-navy"><span className="icon-royal grid size-9 shrink-0 place-items-center rounded-xl"><FileText className="size-4" aria-hidden /></span>{k(d)}</StaggerItem>
                ))}
              </Stagger>
            </BlurReveal>
            <BlurReveal delay={0.12} className="tone tone-navy rounded-[1.75rem] p-7 md:p-9">
              <h2 className="flex items-center gap-3 font-heading text-h3 font-extrabold tracking-[-0.02em] text-white"><span className="grid size-10 place-items-center rounded-xl text-navy" style={{ background: "var(--accent)" }}><HandHelping className="size-5" aria-hidden /></span>{t("help")}</h2>
              <ul className="mt-5 space-y-3">
                {["h1", "h2", "h3", "h4"].map((h) => <li key={h} className="flex gap-2.5 text-white/90"><CircleCheck className="mt-0.5 size-5 shrink-0 text-[#FFD76A]" aria-hidden />{k(h)}</li>)}
              </ul>
            </BlurReveal>
            <Button asChild variant="outline" size="lg" className="w-full">
              <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer">{t("official")}<ExternalLink aria-hidden /></a>
            </Button>
          </div>
        </div>
      </section>

      {/* Steps with a self-drawing line */}
      <section className="tone tone-navy pb-16 pt-24 md:pb-24 md:pt-32">
        <span aria-hidden className="tone-beam" />
        <Wave color="#FFFFFF" position="top" />
        <div className="container-page max-w-4xl">
          <SectionTitle tone="dark" title={t("steps")} />
          <div className="relative">
            <DrawLine className="absolute bottom-8 left-[27px] top-8 w-1 rounded-full bg-[linear-gradient(180deg,var(--accent),#FFD76A)]" />
            <Stagger as="ol" className="relative space-y-5">
              {["s1", "s2", "s3", "s4", "s5"].map((s, i) => (
                <StaggerItem key={s} className="flex items-center gap-5">
                  <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl font-heading text-h4 font-extrabold text-navy ring-8 ring-[#0A2462]" style={{ background: "linear-gradient(135deg, #FFD76A, var(--accent))" }}>{i + 1}</span>
                  <p className="card-dark-glass flex-1 p-5 font-semibold text-white">{k(s)}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Other schemes */}
      <section className="tone tone-cream py-16 md:py-24">
        <div className="container-page">
          <SectionTitle title={L(D.otherTitle)} />
          <Stagger className="grid gap-5 md:grid-cols-3">
            {others.map((s) => {
              const OIcon = SCHEME_ICONS[s.slug];
              return (
                <StaggerItem key={s.slug} className="list-none">
                  <TiltCard max={6} className="h-full rounded-[1.75rem]">
                    <Link href={`/schemes/${s.slug}`} className="group flex h-full flex-col rounded-[1.75rem] border border-line bg-white p-6 shadow-soft transition-colors hover:border-gold/50">
                      <span className="icon-royal grid size-12 place-items-center rounded-2xl"><OIcon className="size-6" aria-hidden /></span>
                      <span className="mt-5 font-heading text-[1.125rem] font-bold text-navy">{t(`items.${s.slug}.name`)}</span>
                      <span className="mt-1 text-caption text-muted">{t(`items.${s.slug}.short`)}</span>
                      <span className="mt-auto flex items-center gap-1.5 pt-5 text-caption font-semibold text-royal">{t("learnMore")}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                    </Link>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <FinalCta defaultType={scheme.audience === "farm" ? "farm" : "home"} />
    </div>
  );
}

function Glance({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card-glass-light p-4 hover:transform-none">
      <dt className="text-[0.75rem] font-bold uppercase tracking-wide text-royal">{label}</dt>
      <dd className="mt-1 text-caption font-semibold text-navy">{value}</dd>
    </div>
  );
}
