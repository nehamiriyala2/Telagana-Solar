"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CirclePlay } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { CountUp } from "@/components/motion/count-up";
import { Skyline } from "@/components/illustrations/skyline";
import { ASSETS } from "@/lib/assets";
import { pick } from "@/lib/utils";
import { EASE } from "@/components/motion/reveal";

export function Hero({ sunHours }: { sunHours: number }) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sunY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const skyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /** CSS-only entrance (see --animate-rise): content is painted before JS hydrates. */
  const enter = (i: number) => ({ style: { animationDelay: `${0.1 + i * 0.09}s` } });

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]" aria-labelledby="hero-title">
      {/* Sky */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#FAF8F3_0%,#FFF4DA_48%,#FFD68A_78%,#FFB45C_100%)] dark:bg-[linear-gradient(180deg,#07122a_0%,#0f2247_45%,#3b2a45_75%,#8a4a2a_100%)]" />

      {/* Sun + rays */}
      <motion.div aria-hidden style={{ y: reduce ? 0 : sunY }} className="absolute left-1/2 top-[58%] -z-10 -translate-x-1/2 md:top-[52%]">
        <motion.div
          initial={reduce ? false : { y: 220, opacity: 0.4 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
          className="relative grid place-items-center"
        >
          <div className="absolute size-[900px] animate-rays rounded-full opacity-50 [background:repeating-conic-gradient(from_0deg,rgb(255_184_0/0.18)_0deg_4deg,transparent_4deg_16deg)] [mask-image:radial-gradient(circle,black_10%,transparent_62%)]" />
          <div className="absolute size-[520px] rounded-full bg-[radial-gradient(circle,rgb(255_184_0/0.55),rgb(255_138_0/0.18)_45%,transparent_70%)] blur-2xl" />
          <div className="size-44 rounded-full bg-[radial-gradient(circle_at_40%_35%,#FFE7A3,#FFB800_45%,#FF8A00)] shadow-[0_0_120px_40px_rgb(255_170_0/0.45)] md:size-56" />
        </motion.div>
      </motion.div>

      {/* Drifting light beams */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-[-20%] h-[140%] w-24 rotate-[24deg] bg-gradient-to-b from-gold/0 via-gold/15 to-gold/0 blur-2xl"
            style={{ left: `${18 + i * 28}%` }}
            animate={reduce ? undefined : { x: [0, 60, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
          />
        ))}
      </div>

      {/* Skyline (coded) or generated hero render */}
      <motion.div aria-hidden={!ASSETS.hero.ready} style={{ y: reduce ? 0 : skyY }} className="absolute inset-x-0 bottom-0 -z-10 h-[42%] md:h-[48%]">
        {ASSETS.hero.ready ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ASSETS.hero.src} srcSet={`${ASSETS.hero.src} 1x, ${ASSETS.hero.src2x} 2x`} alt={pick(ASSETS.hero.alt, locale)} fetchPriority="high" className="size-full object-cover object-bottom" />
        ) : (
          <Skyline className="size-full" />
        )}
      </motion.div>

      <motion.div style={{ y: reduce ? 0 : textY, opacity: fade }} className="container-page relative flex flex-1 flex-col items-center pt-10 text-center md:pt-16">
        <p {...enter(0)} className="animate-rise eyebrow glass mb-6 rounded-full px-4 py-1.5 !text-fg">{t("eyebrow")}</p>
        <h1 {...enter(1)} id="hero-title" className="animate-rise max-w-4xl text-hero md:text-hero-lg">
          {t("title")}
        </h1>
        <p {...enter(2)} className="animate-rise mt-6 max-w-xl text-muted md:text-body-lg">{t("subtitle")}</p>
        <div {...enter(3)} className="animate-rise mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Magnetic>
            <Button asChild size="lg">
              <Link href="/finder">{t("cta")}<ArrowRight /></Link>
            </Button>
          </Magnetic>
          <Button asChild size="lg" variant="outline">
            <a href="#how-it-works"><CirclePlay />{t("secondary")}</a>
          </Button>
        </div>

        <dl {...enter(4)} className="animate-rise glass mt-12 grid w-full max-w-lg grid-cols-3 gap-2 rounded-2xl p-4 text-center md:mt-14">
          <Stat value={sunHours} fmt={(n) => n.toFixed(1)} label={t("stat1")} />
          <Stat value={90} fmt={(n) => `${Math.round(n)}%`} label={t("stat2")} />
          <Stat value={25} fmt={(n) => `${Math.round(n)}+`} label={t("stat3")} />
        </dl>
      </motion.div>
      <div className="h-[22vh] md:h-[26vh]" />
    </section>
  );
}

function Stat({ value, fmt, label }: { value: number; fmt: (n: number) => string; label: string }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-[0.75rem] leading-tight text-muted md:text-caption">{label}</dt>
      <dd className="font-heading text-h4 font-extrabold"><CountUp value={value} format={fmt} /></dd>
    </div>
  );
}
