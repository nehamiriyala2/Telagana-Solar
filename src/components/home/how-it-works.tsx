"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue, type Variants } from "framer-motion";
import { motionState, useInViewOnce, useMedia, useStill } from "@/components/motion/kit";
import { useTranslations } from "next-intl";
import { Leaf } from "lucide-react";
import { UI_IMAGES } from "@/data/section-photos";
import { EASE, STEPS as M, STEP_GAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STEPS = ["s1", "s2", "s3", "s4", "s5"] as const;
const LAST = STEPS.length - 1;
/** When circle i activates (desktop sequence, seconds after the band is in view). */
const circleAt = (i: number) => M.firstCircle + i * STEP_GAP;


export function HowItWorks({ dark = false }: { premium?: boolean; dark?: boolean }) {
  const t = useTranslations("how");
  const still = useStill();
  const desktop = useMedia("(min-width: 1024px)");
  const ref = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const started = useInViewOnce(ref);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const state = motionState(still, started);

  const heading: Variants = { hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: M.heading, ease: EASE } } };
  const underline: Variants = { hide: { scaleX: 0 }, show: { scaleX: 1, transition: { delay: M.underlineAt, duration: M.underline, ease: EASE } } };
  const track = dark ? "bg-white/50" : "bg-primary/25";

  return (
    <section ref={ref} aria-labelledby="how-title"
      className={cn("relative isolate overflow-hidden py-16 md:py-24",
        dark ? "band-curve bg-[linear-gradient(180deg,#0B1F3A_0%,#0B1F3A_55%,#0B1F3A_100%)] text-white" : "bg-mist")}>
      {dark && <span aria-hidden className="deco-blob -right-32 top-10 size-[28rem] bg-white/15" />}
      <div className="container-page">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
          <motion.div variants={heading} {...state}>
            <p className={cn("inline-flex items-center gap-2 text-[0.8125rem] font-bold uppercase tracking-[0.18em]", dark ? "text-white" : "text-primary")}>
              <Leaf className={cn("size-4", dark ? "text-[#F1E7D2]" : "text-green")} aria-hidden />{t("eyebrow")}
            </p>
            <h2 id="how-title" className={cn("mt-3 font-heading text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold leading-[1.15] tracking-[-0.02em]", dark ? "text-white" : "text-ink")}>{t("title")}</h2>
          </motion.div>
          <motion.span aria-hidden variants={underline} {...state} className="mx-auto mt-4 block h-1 w-16 origin-center rounded-full bg-[#B8913F]" />
        </div>

        <div className="relative">
          {/* desktop: faint track + gold segments that draw circle to circle (static position, only scaleX animates) */}
          <span aria-hidden className={cn("absolute left-[10%] right-[10%] top-6 hidden h-0.5 lg:block", track)} />
          {STEPS.slice(0, LAST).map((k, i) => (
            <span key={k} aria-hidden className="absolute top-6 hidden h-0.5 lg:block" style={{ left: `${10 + i * 20}%`, width: "20%" }}>
              <motion.span className="block h-full w-full origin-left bg-[#B8913F]" {...state}
                variants={{ hide: { scaleX: 0 }, show: { scaleX: 1, transition: { delay: circleAt(i) + M.lineAt, duration: M.line, ease: "easeInOut" } } }} />
            </span>
          ))}

          <ol ref={listRef} className="relative grid gap-6 lg:grid-cols-5 lg:gap-5">
            {STEPS.map((k, i) => (
              <Step key={k} k={k} i={i} still={still} desktop={desktop} sectionStarted={started} progress={scrollYProgress} track={track}
                title={t(`${k}.title`)} desc={t(`${k}.desc`)} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({ k, i, still, desktop, sectionStarted, progress, track, title, desc }: {
  k: (typeof STEPS)[number]; i: number; still: boolean; desktop: boolean | null; sectionStarted: boolean;
  progress: MotionValue<number>; track: string; title: string; desc: string;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const selfInView = useInViewOnce(ref, 0.4);
  // Desktop: the row plays in order from the band trigger. Phone: each step plays as it scrolls in.
  const show = desktop === true ? sectionStarted : desktop === false ? selfInView : false;
  const base = desktop ? circleAt(i) : 0;
  const state = motionState(still, show);
  // phone: connector i → i+1 fills with scroll progress through the list
  const fill = useTransform(progress, [i / LAST, (i + 1) / LAST], [0, 1]);

  const circle: Variants = { hide: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: { delay: base, duration: M.circle, ease: EASE } } };
  const ring: Variants = { hide: { opacity: 0, scale: 1 }, show: { opacity: [0.9, 0], scale: [1, 1.8], transition: { delay: base + 0.05, duration: M.ringPulse, ease: "easeOut" } } };
  const card: Variants = { hide: { opacity: 0, y: M.cardRise }, show: { opacity: 1, y: 0, transition: { delay: base + M.cardAfterCircle, duration: M.card, ease: EASE } } };
  const image: Variants = { hide: { scale: M.imageFrom }, show: { scale: 1, transition: { delay: base + M.cardAfterCircle, duration: M.card + 0.2, ease: EASE } } };

  return (
    <li ref={ref} className="group relative grid grid-cols-[3rem_1fr] items-start gap-4 lg:flex lg:flex-col lg:items-center lg:gap-0 lg:text-center">
      {/* phone: vertical connector to the next circle */}
      {i < LAST && (
        <span aria-hidden className={cn("absolute left-6 top-12 -bottom-6 w-0.5 -translate-x-1/2 lg:hidden", track)}>
          <motion.span className="block h-full w-full origin-top bg-[#B8913F]" style={{ scaleY: still ? 1 : fill }} />
        </span>
      )}

      <motion.span variants={circle} {...state} className="relative z-10 grid size-12 place-items-center">
        <motion.span aria-hidden variants={ring} {...state} className="absolute inset-0 rounded-full border-2 border-[#B8913F]" />
        {/* hover on the card: the circle's ring brightens */}
        <span aria-hidden className="absolute -inset-1 rounded-full opacity-0 shadow-[0_0_0_3px_rgb(184_145_63/0.35),0_0_18px_2px_rgb(184_145_63/0.45)] transition-opacity duration-150 group-hover:opacity-100" />
        <span className="relative grid size-12 place-items-center rounded-full border-[3px] border-green bg-white font-heading text-[1.125rem] font-extrabold text-ink tabular-nums shadow-[0_6px_16px_-6px_rgb(11_31_58/0.4)]">{i + 1}</span>
      </motion.span>

      <motion.div variants={card} {...state} className="w-full lg:mt-5 lg:flex lg:flex-1">
        <div className="flex h-full w-full flex-1 flex-col items-start rounded-[1.25rem] border border-white/70 bg-white/95 p-5 text-left shadow-[0_14px_34px_-14px_rgb(11_31_58/0.35)] transition-transform duration-150 ease-out group-hover:-translate-y-1.5 motion-reduce:group-hover:translate-y-0 lg:items-center lg:text-center">
          <span aria-hidden className="relative block h-24 w-full max-w-[9rem] overflow-hidden">
            <motion.span variants={image} {...state} className="absolute inset-0 mix-blend-multiply">
              <Image src={UI_IMAGES.steps[k]} alt="" fill sizes="144px" className="object-contain" />
            </motion.span>
          </span>
          <h3 className="mt-4 font-heading text-[1.0625rem] font-bold leading-snug text-ink">{title}</h3>
          <p className="mt-2 text-[0.875rem] text-body">{desc}</p>
        </div>
      </motion.div>
    </li>
  );
}
