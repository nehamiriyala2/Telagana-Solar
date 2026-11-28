import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CircleCheck, ExternalLink, FileText, HandHelping, Info, Landmark, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page/page-hero";
import { SectionTitle } from "@/components/page/section-title";
import { Button } from "@/components/ui/button";
import { CheckTick } from "@/components/ui/check-pill";
import { SCHEME_ICONS } from "@/components/home/schemes-section";
import { TiltCard } from "@/components/motion/tilt-card";
import { BlurReveal, DrawLine, Stagger, StaggerItem } from "@/components/motion/primitives";
import { SCHEMES, type SchemeSlug } from "@/config/schemes";
import { schemesPage as D } from "@/data/schemes";
import { titleEmphasis } from "@/data/pages";
import { routing } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";
import { cn, pick } from "@/lib/utils";
import { Wave } from "@/components/page/tone-section";
import Image from "next/image";
import { BannerArt, Sunlight } from "@/components/page/banner-art";
import { pmSuryaGharSign, solutionBanners } from "@/data/solution-hero";
import { schemeView } from "@/lib/public-schemes";

/**
 * Scheme page: hero → at a glance → benefit → who can apply → documents → steps (self-drawing line) → how we help → other schemes.
 * Text comes from Admin → Schemes (published only); built-in message text is the fallback without a database.
 */
/** Scheme logos for the "Other schemes" cards (falls back to the icon where no logo is supplied). */
const SCHEME_LOGOS: Partial<Record<string, string>> = {
  "pm-surya-ghar": "/images/ui/scheme-logos/pm-surya-ghar.webp",
  "net-metering": "/images/ui/scheme-logos/net-metering.webp",
  "state-schemes": "/images/ui/scheme-logos/state-schemes.webp",
  "pm-kusum": "/images/ui/scheme-logos/pm-kusum.webp",
};
/** Schemes whose "logo" is a photo (shown as a rounded thumbnail rather than a transparent mark). */
const LOGO_IS_PHOTO = new Set(["pm-kusum"]);

/** Document pictures, in document order per scheme (bill · aadhaar · bank · house). */
const DI = "/images/ui/doc-icons";
const DOC_PICS: Partial<Record<string, string[]>> = {
  "pm-surya-ghar": ["bill", "aadhaar", "bank", "house"],
  "pm-kusum": ["bill", "aadhaar", "bank", "bill"],
  "net-metering": ["bill", "bill", "aadhaar", "bill"],
  "state-schemes": ["bill", "bill", "aadhaar", "bank"],
};

/** Step pictures, in step order per scheme (a step without one shows its number). */
const SI = "/images/ui/step-icons";
const UIP = "/images/ui";
const STEP_PICS: Partial<Record<string, string[]>> = {
  "pm-surya-ghar": [`${SI}/apply.webp`, `${SI}/check.webp`, `${UIP}/steps/install.webp`, `${SI}/meter.webp`, `${UIP}/steps/paperwork.webp`],
  "pm-kusum": [`${UIP}/steps/learn.webp`, `${SI}/apply.webp`, `${UIP}/steps/paperwork.webp`, `${UIP}/steps/install.webp`, `${SI}/agreement.webp`],
  "net-metering": [`${SI}/apply.webp`, `${SI}/check.webp`, `${SI}/agreement.webp`, `${SI}/meter.webp`, `${SI}/grid.webp`],
  "state-schemes": [`${UIP}/steps/learn.webp`, `${SI}/check.webp`, `${SI}/apply.webp`, `${UIP}/steps/install.webp`, `${UIP}/steps/paperwork.webp`],
};

export const revalidate = 300;
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SCHEMES.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const v = await schemeView(slug, locale);
  if (!v) return {};
  return pageMeta({ locale, path: `/schemes/${slug}`, title: v.name, description: v.short });
}

export default async function SchemePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const v = await schemeView(slug, locale);
  if (!v) notFound();
  const t = await getTranslations("schemes");
  const L = (x: { en: string; te: string }) => pick(x, locale);
  const emphasis = titleEmphasis[slug as SchemeSlug] as { en: string; te: string } | undefined;
  const Icon = SCHEME_ICONS[slug as SchemeSlug] ?? Landmark;
  const others = v.others;
  const timeline = L(D.timelineValue);
  const hasTimeline = Boolean(timeline && !timeline.includes("[EDIT"));

  return (
    <div data-accent={slug}>
      <PageHero eyebrow={t("eyebrow")} title={v.name} emphasis={emphasis ? L(emphasis) : undefined} subtitle={v.short} Icon={Icon} calcType={v.audience === "farm" ? "farm" : "home"} underline
        art={slug in solutionBanners ? <BannerArt kind={slug as "pm-surya-ghar" | "pm-kusum" | "net-metering" | "state-schemes"} locale={locale} /> : undefined}>
        <dl className={cn("grid gap-3", hasTimeline ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          <Glance label={t("cardWho")} value={v.cardWho} />
          <Glance label={t("cardBenefit")} value={v.cardBenefit} />
          {hasTimeline && <Glance label={L(D.timeline)} value={timeline} />}
        </dl>
      </PageHero>

      {v.status !== "active" && (
        <p role="status" className="container-page mt-6 flex items-center gap-2 rounded-2xl border border-[#f5d27a] bg-[#fff8e6] px-5 py-3 font-semibold text-[#7a5300]">
          <TriangleAlert className="size-5 shrink-0" aria-hidden />
          {locale === "te" ? (v.status === "paused" ? "ఈ పథకం ప్రస్తుతం నిలిపివేయబడింది. తాజా సమాచారం కోసం వాట్సాప్‌లో అడగండి." : "ఈ పథకం ముగిసింది. మీకు ఇతర ఎంపికలు చెబుతాం.")
            : v.status === "paused" ? "This scheme is paused right now. Ask us on WhatsApp for the latest." : "This scheme has closed. Ask us about other options."}
        </p>
      )}
      <section className="bg-section-white py-16 md:py-24">
        <div className="container-page grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <BlurReveal className="relative overflow-hidden rounded-[1.25rem] p-7 md:p-10" style={{ background: "radial-gradient(ellipse 70% 80% at 100% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%), linear-gradient(135deg, var(--accent-soft), #FFFFFF)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent)" }}>
              <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full border-2" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }} />
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: "var(--accent)" }} />
              <p className="eyebrow-pill relative">{t("benefit")}</p>
              <p className="relative mt-5 font-heading text-[1.25rem] font-bold leading-snug text-ink md:text-[1.5rem]">{v.benefit}</p>
              <p className="relative mt-5 flex gap-2 text-caption font-semibold text-gold-ink"><Info className="mt-0.5 size-4 shrink-0" aria-hidden />{t("note")}</p>
            </BlurReveal>

            {slug === "pm-surya-ghar" && (
              <BlurReveal className="zoom-frame relative overflow-hidden rounded-[1.25rem] border border-white bg-white p-2 shadow-[0_30px_60px_-34px_rgb(11_31_58/0.5)]">
                <div className="relative overflow-hidden rounded-[1.4rem]">
                  <Image src={pmSuryaGharSign.src} alt={pick(pmSuryaGharSign.alt, locale)} width={pmSuryaGharSign.width} height={pmSuryaGharSign.height}
                    sizes="(min-width: 1024px) 40rem, 100vw" className="zoom-img block h-auto w-full" />
                  <Sunlight sun={pmSuryaGharSign.sun} />
                </div>
              </BlurReveal>
            )}

            <BlurReveal className="rounded-[1.25rem] border border-line bg-white p-7 shadow-soft md:p-9">
              <h2 className="font-heading text-h3 font-extrabold tracking-[-0.02em] text-ink">{t("who")}</h2>
              <Stagger className="mt-5 space-y-3">
                {v.who.map((w) => (
                  <StaggerItem key={w} className="flex gap-3 rounded-2xl p-4 text-ink" style={{ background: "var(--accent-soft)" }}><CircleCheck className="mt-0.5 size-5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden />{w}</StaggerItem>
                ))}
              </Stagger>
            </BlurReveal>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <BlurReveal delay={0.08} className="rounded-[1.25rem] border border-line bg-white p-7 shadow-soft md:p-9">
              <h2 className="font-heading text-h3 font-extrabold tracking-[-0.02em] text-ink">{t("documents")}</h2>
              <Stagger className="mt-5 grid gap-2">
                {v.documents.map((d, i) => (
                  <StaggerItem key={d} className="flex items-center gap-4 rounded-2xl bg-cream px-4 py-3 text-ink">
                    {DOC_PICS[slug]?.[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${DI}/${DOC_PICS[slug]![i]}.webp`} alt="" aria-hidden className="h-10 w-12 shrink-0 object-contain !bg-none" loading="lazy" />
                    ) : (
                      <span className="icon-primary-hover grid size-9 shrink-0 place-items-center rounded-xl"><FileText className="size-4" aria-hidden /></span>
                    )}
                    {d}
                  </StaggerItem>
                ))}
              </Stagger>
            </BlurReveal>
            <BlurReveal delay={0.12} className="tone tone-navy rounded-[1.25rem] p-7 md:p-9">
              <h2 className="flex items-center gap-3 font-heading text-h3 font-extrabold tracking-[-0.02em] text-white"><span className="grid size-10 place-items-center rounded-xl text-ink" style={{ background: "var(--accent)" }}><HandHelping className="size-5" aria-hidden /></span>{t("help")}</h2>
              <ul className="mt-5 space-y-3">
                {v.help.map((h) => <li key={h} className="flex items-start gap-3.5 text-white"><CheckTick />{h}</li>)}
              </ul>
            </BlurReveal>
            {v.officialUrl && (
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href={v.officialUrl} target="_blank" rel="noopener noreferrer">{t("official")}<ExternalLink aria-hidden /></a>
              </Button>
            )}
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
            <DrawLine className="absolute bottom-8 left-[30px] top-8 w-1 rounded-full bg-[#F5F0E6]/30" />
            <Stagger as="ol" className="relative space-y-5">
              {v.steps.map((s, i) => {
                const pic = STEP_PICS[slug]?.[i];
                return (
                <StaggerItem key={`${i}-${s}`} className="flex items-center gap-5">
                  <span className="relative z-10 grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#FBF8F1] font-heading text-h4 font-extrabold text-[#0B1F3A] shadow-[0_6px_16px_rgb(0_0_0/0.25)]">
                    {pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pic} alt="" aria-hidden className="size-full object-contain p-1.5 !bg-none" loading="lazy" />
                    ) : i + 1}
                  </span>
                  <p className="card-dark-glass flex-1 p-5 font-semibold text-white">{s}</p>
                </StaggerItem>
                );
              })}
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
              const OIcon = SCHEME_ICONS[s.slug as SchemeSlug] ?? Landmark;
              return (
                <StaggerItem key={s.slug} className="list-none">
                  <TiltCard max={6} className="h-full rounded-[1.25rem]">
                    <Link href={`/schemes/${s.slug}`} className="group flex h-full flex-col rounded-[1.25rem] border border-line bg-white p-6 shadow-soft transition-colors hover:border-gold/50">
                      {SCHEME_LOGOS[s.slug] ? (
                        <span className="flex h-20 items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={SCHEME_LOGOS[s.slug]} alt="" aria-hidden className={LOGO_IS_PHOTO.has(s.slug) ? "h-20 w-auto max-w-full rounded-xl object-cover" : "max-h-16 w-auto max-w-full object-contain !bg-none"} loading="lazy" />
                        </span>
                      ) : (
                        <span className="icon-primary-hover grid size-12 place-items-center rounded-2xl"><OIcon className="size-6" aria-hidden /></span>
                      )}
                      <span className="mt-5 font-heading text-[1.125rem] font-bold text-ink">{s.name}</span>
                      <span className="mt-1 text-caption text-muted">{s.short}</span>
                      <span className="mt-auto flex items-center gap-1.5 pt-5 text-caption font-semibold text-primary-hover">{t("learnMore")}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                    </Link>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>
    </div>
  );
}

function Glance({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card-glass-light p-4 hover:transform-none">
      <dt className="text-[0.75rem] font-bold uppercase tracking-wide text-primary-hover">{label}</dt>
      <dd className="mt-1 text-caption font-semibold text-ink">{value}</dd>
    </div>
  );
}
