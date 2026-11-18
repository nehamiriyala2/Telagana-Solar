import { useTranslations } from "next-intl";
import { ArrowRight, Calculator } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { GuideTrigger, SubsidyTrigger } from "@/components/tools/triggers";
import { HeroMedia } from "./hero-media";

/**
 * Home hero.
 * - Large screens (lg+): full-bleed cinematic photo (solar house at sunrise) with the copy over a soft navy fade.
 * - Phones/tablets: bright white/light-blue layout, copy first, then the complete photo in a rounded frame
 *   so the whole house, roof and panels are always visible (no awkward crop behind the text).
 * Text paints instantly (CSS entrance), so it never delays LCP.
 */
export function Hero() {
  const t = useTranslations("hero");
  const d = (i: number) => ({ style: { animationDelay: `${0.05 + i * 0.08}s` } });
  return (
    <section
      className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_70%_45%_at_0%_0%,rgb(255_199_44/0.16),transparent_60%),linear-gradient(180deg,#F1F7FF_0%,#FFFFFF_100%)] lg:flex lg:min-h-[720px] lg:items-center lg:bg-none"
      aria-labelledby="hero-title"
    >
      <HeroMedia alt={t("imageAlt")} className="max-lg:hidden" />

      <div className="container-page relative w-full pb-12 pt-10 md:pt-14 lg:pb-36 lg:pt-16">
        <div className="max-w-[40rem]">
          <p {...d(0)} className="eyebrow-pill hero-pill animate-rise backdrop-blur">{t("eyebrow")}</p>
          <h1 {...d(1)} id="hero-title" className="mt-5 animate-rise text-[2.5rem] font-extrabold leading-[1.06] text-navy sm:text-[3.25rem] lg:text-[4.25rem] lg:text-white lg:[text-shadow:0_4px_30px_rgb(7_23_63/0.45)]">
            {t("titleA")}<span className="text-gold-gradient drop-shadow-[0_2px_16px_rgb(255_199_44/0.35)]">{t("titleGold")}</span>{t("titleB")}
          </h1>
          <p {...d(2)} lang={t("altLang")} className="mt-4 animate-rise border-l-4 border-yellow pl-3 font-heading text-[1.125rem] font-bold text-royal md:text-h4 lg:text-[#A9D2FF] lg:[text-shadow:0_2px_14px_rgb(7_23_63/0.8)]">{t("altLine")}</p>
          <p {...d(3)} className="mt-4 max-w-xl animate-rise text-muted md:text-body-lg lg:text-silver lg:[text-shadow:0_2px_14px_rgb(7_23_63/0.85)]">{t("subtitle")}</p>
          <div {...d(4)} className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row">
            <Magnetic className="inline-block">
              <GuideTrigger size="lg" className="btn-shine w-full shadow-[0_14px_34px_-12px_rgb(245_168_0/0.85)] sm:w-auto">{t("primary")}<ArrowRight aria-hidden /></GuideTrigger>
            </Magnetic>
            <SubsidyTrigger variant="outline" size="lg" className="shadow-[0_10px_26px_-16px_rgb(7_23_63/0.35)] hover:border-yellow lg:border-white/35 lg:bg-white/10 lg:text-white lg:shadow-none lg:backdrop-blur-md lg:hover:bg-white/15">
              <Calculator aria-hidden />{t("secondary")}
            </SubsidyTrigger>
          </div>
          <p {...d(5)} className="mt-4 animate-rise text-caption text-muted lg:text-silver lg:[text-shadow:0_2px_12px_rgb(7_23_63/0.9)]">{t("note")}</p>
        </div>

        {/* Phones/tablets: the complete photo, framed */}
        <div {...d(6)} className="relative mt-10 animate-rise lg:hidden">
          <div aria-hidden className="absolute -inset-3 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_30%_60%,rgb(255_199_44/0.35),transparent_70%)] blur-xl" />
          <div className="overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-30px_rgb(7_23_63/0.45)] ring-1 ring-white">
            <HeroMedia inline alt={t("imageAlt")} />
          </div>
        </div>
      </div>

      {/* Curved edge into the light section below (large screens) */}
      <svg aria-hidden viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-14 w-full max-lg:hidden md:h-20">
        <path d="M0 90 V40 C 240 90 480 0 720 30 C 960 60 1200 10 1440 40 V90 Z" fill="#FFFFFF" />
      </svg>
    </section>
  );
}
