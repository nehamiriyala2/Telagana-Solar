import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Calculator } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { HeroVisual } from "@/components/hero3d/hero-visual";
import { GuideTrigger, SubsidyTrigger } from "@/components/tools/triggers";

/**
 * Home hero (premium). Text paints instantly (CSS-only entrance). Right side: lazy 3D scene with a static fallback.
 * Background: sky-blue → warm sun gradient, dot texture, floating glow orbs, faint Telangana map + Charminar
 * outline, gold sun-ring arcs, and a curved edge into the navy section below.
 */
export function Hero() {
  const t = useTranslations("hero");
  const d = (i: number) => ({ style: { animationDelay: `${0.05 + i * 0.08}s` } });
  return (
    <section className="dot-grid relative isolate overflow-hidden bg-[linear-gradient(160deg,#EAF4FF_0%,#F7FBFF_38%,#FFF8E6_72%,#FFEFC2_100%)]" aria-labelledby="hero-title">
      {/* Glow orbs */}
      <div aria-hidden className="orb -right-32 -top-32 size-[640px] bg-[radial-gradient(circle,rgb(255_199_44/0.55),rgb(245_168_0/0.12)_50%,transparent_70%)]" />
      <div aria-hidden className="orb -left-40 top-1/3 size-[520px] bg-[radial-gradient(circle,rgb(77_163_255/0.35),transparent_65%)]" style={{ animationDelay: "-6s" }} />
      {/* Gold sun-ring arcs (logo motif) */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-1/2 -z-10 hidden size-[900px] -translate-y-1/2 rounded-full border border-yellow/40 lg:block" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-1/2 -z-10 hidden size-[700px] -translate-y-1/2 rounded-full border-2 border-gold/30 shadow-[0_0_80px_-20px_rgb(255_199_44/0.6)] lg:block" />
      <Image src="/brand/outline-gold.webp" alt="" aria-hidden width={800} height={528}
        className="pointer-events-none absolute -left-24 top-8 -z-10 w-[720px] max-w-none opacity-[0.08] md:-left-16" />

      <div className="container-page grid items-center gap-8 pb-24 pt-10 md:pb-32 md:pt-14 lg:grid-cols-12 lg:gap-6 lg:pt-16">
        <div className="lg:col-span-6">
          <p {...d(0)} className="eyebrow-pill animate-rise">{t("eyebrow")}</p>
          <h1 {...d(1)} id="hero-title" className="mt-5 animate-rise text-[2.625rem] font-extrabold leading-[1.05] text-navy sm:text-[3.25rem] lg:text-[4.25rem]">
            {t("titleA")}<span className="text-gold-gradient drop-shadow-[0_2px_12px_rgb(255_199_44/0.35)]">{t("titleGold")}</span>{t("titleB")}
          </h1>
          <p {...d(2)} lang={t("altLang")} className="mt-4 animate-rise border-l-4 border-gold pl-3 font-heading text-[1.125rem] font-bold text-royal md:text-h4">{t("altLine")}</p>
          <p {...d(3)} className="mt-4 max-w-xl animate-rise text-navy-700 md:text-body-lg">{t("subtitle")}</p>
          <div {...d(4)} className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row">
            <Magnetic className="inline-block">
              <GuideTrigger size="lg" className="btn-shine w-full shadow-[0_14px_34px_-12px_rgb(245_168_0/0.75)] sm:w-auto">{t("primary")}<ArrowRight aria-hidden /></GuideTrigger>
            </Magnetic>
            <SubsidyTrigger variant="outline" size="lg" className="border-navy/20 bg-white/80 backdrop-blur">
              <Calculator aria-hidden />{t("secondary")}
            </SubsidyTrigger>
          </div>
          <p {...d(5)} className="mt-3 animate-rise text-caption text-muted">{t("note")}</p>
        </div>
        <div className="relative lg:col-span-6">
          <HeroVisual />
        </div>
      </div>

      {/* Curved edge into the navy section */}
      <svg aria-hidden viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-14 w-full md:h-20">
        <path d="M0 90 V40 C 240 90 480 0 720 30 C 960 60 1200 10 1440 40 V90 Z" fill="#07173F" />
      </svg>
    </section>
  );
}
