import { useTranslations } from "next-intl";
import { ArrowRight, BadgeIndianRupee, Gauge, Headset, MapPinned, Route } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { PackageCard } from "@/components/cards/package-card";
import { GuideTrigger } from "@/components/tools/triggers";
import { WhatsAppButton } from "@/components/ui/contact-buttons";
import type { GuidePersona } from "@/config/personas";
import { featuredPackages } from "@/config/packages";

/** `premium` is the homepage look; other pages keep the default. */
export function Packages({ premium = false, blue = false }: { premium?: boolean; blue?: boolean }) {
  const t = useTranslations("packages");
  return (
    <section className={blue ? "tone tone-blue py-16 md:py-24" : premium ? "dot-grid bg-premium-sky relative isolate overflow-hidden py-16 md:py-24" : "section"} aria-labelledby="pkg-title">
      {blue && <span aria-hidden className="tone-beam" />}
      {premium && <div aria-hidden className="orb -left-24 top-1/4 size-96 bg-yellow/20" />}
      <div className="container-page">
        <SectionHeading premium={premium} tone={blue ? "dark" : "light"} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <div className="grid gap-6 pt-3 md:grid-cols-3">
          {featuredPackages.map((p, i) => <Reveal key={p.id} delay={i * 0.08} className="h-full"><PackageCard pkg={p} premium={premium} /></Reveal>)}
        </div>
      </div>
    </section>
  );
}

export function SubsidyBand() {
  const t = useTranslations();
  return (
    <section className="container-page py-6" aria-labelledby="sub-title">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[1.25rem] bg-[#EEF0F8] px-6 py-12 md:px-14 md:py-16">
          <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-80 animate-glow rounded-full bg-transparent" />
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <h2 id="sub-title" className="text-h2 md:text-h2-lg">{t("subsidyBand.title")}</h2>
              <p className="mt-4 text-body md:text-body-lg">{t("subsidyBand.body")}</p>
              <p className="mt-4 inline-block rounded-xl bg-white/70 px-4 py-2 text-caption font-semibold">{t("common.subsidyNote")}</p>
            </div>
            <Button asChild size="lg" variant="solid"><Link href="/subsidy-loans">{t("subsidyBand.cta")}<ArrowRight aria-hidden /></Link></Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const WHY = [
  { key: "local", Icon: MapPinned },
  { key: "transparent", Icon: BadgeIndianRupee },
  { key: "endToEnd", Icon: Route },
  { key: "netMeter", Icon: Gauge },
  { key: "support", Icon: Headset },
] as const;

export function WhyUs() {
  const t = useTranslations("why");
  return (
    <section className="section bg-cream" aria-labelledby="why-title">
      <div className="container-page">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {WHY.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={i * 0.06}>
              <li className="h-full list-none rounded-card border border-line bg-white p-6 shadow-soft transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift">
                <span className="grid size-12 place-items-center rounded-2xl bg-gold-soft text-gold-ink"><Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
                <h3 className="mt-5 font-heading text-[1.0625rem] font-bold">{t(`${key}.title`)}</h3>
                <p className="mt-2 text-caption text-muted">{t(`${key}.desc`)}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FaqSection({ keys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"], title, premium = false }: { keys?: string[]; title?: string; premium?: boolean }) {
  const t = useTranslations("faq");
  const tc = useTranslations("common");
  if (premium) {
    return (
      <section className="bg-cloud py-16 md:py-24" aria-labelledby="faq-title">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading premium align="left" eyebrow={t("eyebrow")} title={title ?? t("title")} className="mb-6" />
              <div className="rounded-[1.25rem] border border-[#E8E8E6] bg-wash-green p-6">
                <p className="text-[0.9375rem] text-body">{tc("askWhatsapp")}</p>
                <WhatsAppButton place="faq-card" className="mt-4 w-full" label={tc("askOnWhatsapp")} message={tc("askMessage")} />
              </div>
            </div>
          </div>
          <Reveal className="lg:col-span-8"><Accordion premium items={keys.map((k) => ({ q: t(`${k}.q`), a: t(`${k}.a`) }))} /></Reveal>
        </div>
      </section>
    );
  }
  return (
    <section className="section" aria-labelledby="faq-title">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow={t("eyebrow")} title={title ?? t("title")} />
        <Reveal><Accordion items={keys.map((k) => ({ q: t(`${k}.q`), a: t(`${k}.a`) }))} /></Reveal>
      </div>
    </section>
  );
}

const TYPE_TO_PERSONA: Record<"home" | "farm" | "business", GuidePersona> = { home: "urban", farm: "farmer", business: "shop" };

/** Full-width deep-blue gradient band with a curved top edge, a 1px lighter top line and a subtle sun-ray pattern:
 *  white H2, white "Find My Solar Plan" button + green WhatsApp button. */
export function FinalCta({ title, defaultType }: { title?: string; defaultType?: "home" | "farm" | "business" }) {
  const t = useTranslations();
  return (
    <section id="book" className="sun-rays band-dark band-curve on-dark mb-12 scroll-mt-24 rounded-b-[50%_3rem] pb-24 md:mb-16 md:pb-32" aria-labelledby="cta-title">
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="cta-title" className="font-heading text-h2 font-extrabold text-white md:text-h2-lg">{title ?? t("cta.title")}</h2>
          <p className="on-dark-muted mx-auto mt-4 max-w-xl md:text-body-lg">{t("cta.subtitle")}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GuideTrigger size="lg" variant="accent" persona={defaultType ? TYPE_TO_PERSONA[defaultType] : undefined}>{t("common.bookVisit")}<ArrowRight aria-hidden /></GuideTrigger>
            <WhatsAppButton place="final-banner" size="lg" label={t("common.askOnWhatsapp")} message={t("common.askMessage")} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
