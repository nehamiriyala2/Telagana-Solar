"use client";
import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useInView, type Variants } from "framer-motion";
import { motionState, useInViewOnce, useMedia, useStill } from "@/components/motion/kit";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { UI_IMAGES } from "@/data/section-photos";
import { EASE, EASE_POP, FLOW } from "@/lib/motion";

const KEYS = ["sun", "panels", "inverter", "home", "meter", "grid"] as const;
const LAST = KEYS.length - 1;
/** When the gold dot first travels: after the last step's text has appeared. */
const DOT_START = FLOW.firstStep + LAST * FLOW.stagger + FLOW.textAt + FLOW.text;

/**
 * "Sun → Panels → Inverter → Home → Net meter → Grid" (home page, inside Solar60).
 * Pattern 1 "energy travels along the path". Desktop: plays once, step by step in order, when the card is ~30% in
 * view; then a small gold dot travels Sun → Grid along the arrows every few seconds while the card is on screen. Phones: each step plays as it scrolls in, with a
 * vertical connector drawing downward. Timings: src/lib/motion.ts (FLOW).
 */
export function EnergyFlow() {
  const t = useTranslations("solar60");
  const still = useStill();
  const desktop = useMedia("(min-width: 768px)");
  const ref = useRef<HTMLDivElement>(null);
  const started = useInViewOnce(ref);
  const onScreen = useInView(ref, { amount: 0.05 });

  const card: Variants = {
    hide: { opacity: 0, y: FLOW.cardRise },
    show: { opacity: 1, y: 0, transition: { duration: FLOW.cardFade, ease: EASE } },
  };

  return (
    <motion.div ref={ref} variants={card} {...motionState(still, started)}
      className={`mt-6 rounded-[1.25rem] border border-card-line bg-white p-6 shadow-[0_10px_30px_rgb(11_31_58/0.10)] md:p-8 ${onScreen ? "is-live" : ""}`}
      style={{ "--ef-glow": `${FLOW.sunGlow}s`, "--ef-rays": `${FLOW.sunRays}s` } as CSSProperties}>
      <div className="relative">
      {/* travelling gold dot (desktop): track runs from the Sun's centre to the Grid's centre at arrow height;
          the wrapper moves by its own width (transform only) and passes behind the picture circles */}
      {!still && desktop && started && onScreen && (
        <span aria-hidden className="pointer-events-none absolute top-[46px] hidden md:block"
          style={{ left: "calc((100% - 40px) / 12)", width: `calc(${LAST} * ((100% - 40px) / 6 + 8px))` }}>
          <motion.span className="absolute inset-0"
            initial={{ x: "0%", opacity: 0 }}
            animate={{ x: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: FLOW.dotTravel, ease: "easeInOut", times: [0, 0.08, 0.92, 1], repeat: Infinity,
              repeatDelay: FLOW.dotEvery - FLOW.dotTravel, delay: DOT_START - FLOW.firstStep }}>
            <span className="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B8913F] shadow-[0_0_0_3px_rgb(184_145_63/0.22),0_0_12px_3px_rgb(184_145_63/0.55)]" />
          </motion.span>
        </span>
      )}
      <ol className="relative grid gap-5 md:grid-cols-6 md:gap-2">
        {KEYS.map((key, i) => (
          <Step key={key} i={i} still={still} desktop={desktop} cardStarted={started}
            img={UI_IMAGES.flow[key]} title={t(`flow.${key}.title`)} desc={t(`flow.${key}.desc`)} />
        ))}
      </ol>
      </div>
    </motion.div>
  );
}

function Step({ i, still, desktop, cardStarted, img, title, desc }: {
  i: number; still: boolean; desktop: boolean | null; cardStarted: boolean; img: string; title: string; desc: string;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const selfInView = useInViewOnce(ref, 0.6);
  // Desktop: the whole row plays in order from the card trigger. Phone: each step plays as it enters.
  const show = desktop === true ? cardStarted : desktop === false ? selfInView : false;
  const base = desktop ? FLOW.firstStep + i * FLOW.stagger : 0;
  const at = (d: number, duration: number, ease: readonly number[] = EASE) => ({ delay: base + d, duration, ease: ease as [number, number, number, number] });

  const circle: Variants = { hide: { opacity: 0, scale: FLOW.circleFrom }, show: { opacity: 1, scale: 1, transition: at(0, FLOW.circle) } };
  const badge: Variants = { hide: { scale: 0 }, show: { scale: 1, transition: at(FLOW.badgeAt, FLOW.badge, EASE_POP) } };
  const text: Variants = { hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: at(FLOW.textAt, FLOW.text) } };
  const arrow: Variants = { hide: { scaleX: 0 }, show: { scaleX: 1, transition: at(FLOW.arrowAt, FLOW.arrow) } };
  const down: Variants = { hide: { scaleY: 0 }, show: { scaleY: 1, transition: at(FLOW.textAt, FLOW.mobileLine) } };
  const state = motionState(still, show);

  return (
    <li ref={ref} className="relative flex items-center gap-4 md:flex-col md:items-center md:gap-3 md:text-center">
      {/* phone: vertical connector to the next step, drawing downward */}
      {i < LAST && (
        <span aria-hidden className="absolute left-8 top-16 -bottom-5 w-0.5 md:hidden">
          <motion.span variants={down} {...state} className="block h-full w-full origin-top rounded-full bg-primary/25" />
        </span>
      )}

      <motion.span variants={circle} {...state} className="relative z-10 shrink-0">
        <span className="group/c relative block transition-transform duration-150 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0">
          {i === 0 && (
            <>
              <span aria-hidden className="ef-glow loop pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgb(184_145_63/0.45)_0%,transparent_70%)]" />
              <span aria-hidden className="ef-rays loop pointer-events-none absolute -inset-[7px] rounded-full opacity-60 [background:repeating-conic-gradient(rgb(184_145_63/0.55)_0deg_3deg,transparent_3deg_20deg)] [mask:radial-gradient(circle,transparent_64%,#000_65%)]" />
            </>
          )}
          {/* hover shadow (opacity only) */}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full opacity-0 shadow-[0_10px_22px_-8px_rgb(11_31_58/0.45)] transition-opacity duration-150 group-hover/c:opacity-100" />
          <span aria-hidden className="relative block size-16 overflow-hidden rounded-full bg-[#F5F0E6] md:size-20">
            <Image src={img} alt="" fill sizes="80px" className="object-cover" />
          </span>
          <motion.span variants={badge} {...state} className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-primary text-[0.75rem] font-bold text-white ring-2 ring-white tabular-nums">{i + 1}</motion.span>
        </span>
      </motion.span>

      {/* desktop: arrow to the next step draws left → right */}
      {i < LAST && (
        <span aria-hidden className="absolute -right-3 top-9 hidden size-5 md:block lg:-right-2.5">
          <motion.span variants={arrow} {...state} className="block size-5 origin-left">
            <ArrowRight className="absolute inset-0 size-5 text-primary/60" />
          </motion.span>
        </span>
      )}

      <motion.span variants={text} {...state} className="block">
        <span className="block font-heading text-[1.0625rem] font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-[0.875rem] text-body">{desc}</span>
      </motion.span>
    </li>
  );
}
