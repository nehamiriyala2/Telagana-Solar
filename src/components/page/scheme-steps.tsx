"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, type Variants } from "framer-motion";
import { motionState, useInViewOnce, useStill } from "@/components/motion/kit";
import { EASE, PATH as P } from "@/lib/motion";

type ScrollOffset = NonNullable<NonNullable<Parameters<typeof useScroll>[0]>["offset"]>;

/**
 * Scheme page "How to apply" steps on navy: picture tiles on the left joined by a vertical connector, rows on the right.
 * Pattern 4 "a path being walked down" (timings: src/lib/motion.ts → PATH). Driven by scroll position, not timers:
 * the gold connector grows as you scroll (and never shrinks back); when it reaches a tile, the tile pops in with a
 * soft glow and keeps a faint gold "completed" ring, then its row slides in from the right with one light sweep.
 */
export function SchemeSteps({ steps, pics }: { steps: string[]; pics: (string | null)[] }) {
  const still = useStill();
  const listRef = useRef<HTMLOListElement>(null);
  const seen = useInViewOnce(listRef, 0.15);
  const { scrollYProgress } = useScroll({ target: listRef, offset: [`start ${P.start}`, `end ${P.end}`] as ScrollOffset });
  const fill = useMotionValue(0);          // furthest progress so far: the walked path stays gold
  const [reached, setReached] = useState(0);
  const n = steps.length;

  const update = (v: number) => {
    if (v > fill.get()) fill.set(v);
    const k = n <= 1 ? n : Math.floor(v * (n - 1) + P.lead) + 1;
    setReached((r) => Math.max(r, Math.min(n, k)));
  };
  useMotionValueEvent(scrollYProgress, "change", (v) => { if (seen) update(v); });
  // first sight (or a page that loads already scrolled here): sync with the current position
  useEffect(() => { if (seen) update(scrollYProgress.get()); }, [seen]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = still ? n : reached;
  return (
    <div className="relative">
      <span aria-hidden className="absolute bottom-8 left-[30px] top-8 w-1 rounded-full bg-[#F5F0E6]/30">
        <motion.span className="block h-full w-full origin-top rounded-full bg-[#B8913F]" style={{ scaleY: still ? 1 : fill }} />
      </span>
      <ol ref={listRef} className="relative space-y-5">
        {steps.map((s, i) => <Step key={`${i}-${s}`} i={i} text={s} pic={pics[i] ?? null} on={i < done} still={still} />)}
      </ol>
    </div>
  );
}

function Step({ i, text, pic, on, still }: { i: number; text: string; pic: string | null; on: boolean; still: boolean }) {
  const st = motionState(still, on);
  const tile: Variants = { hide: { opacity: 0, scale: P.tileFrom }, show: { opacity: 1, scale: 1, transition: { duration: P.tile, ease: EASE } } };
  const glow: Variants = { hide: { opacity: 0 }, show: { opacity: still ? 0 : [0, 0.9, 0], transition: { duration: P.glow, ease: "easeOut" } } };
  const ring: Variants = { hide: { opacity: 0 }, show: { opacity: 1, transition: { delay: P.tile * 0.6, duration: 0.3 } } };
  const row: Variants = { hide: { opacity: 0, x: P.rowShift }, show: { opacity: 1, x: 0, transition: { delay: P.rowAt, duration: P.row, ease: EASE } } };
  const sweep: Variants = { hide: { x: "-100%", opacity: 0 }, show: { x: still ? "-100%" : ["-100%", "400%"], opacity: still ? 0 : [0, 1, 0], transition: { delay: P.rowAt + P.sweepAt, duration: P.sweep, ease: "easeInOut" } } };

  return (
    <li className="group flex items-center gap-5">
      <motion.span variants={tile} {...st} className="relative z-10 shrink-0">
        <motion.span aria-hidden variants={glow} {...st} className="pointer-events-none absolute -inset-3 rounded-3xl bg-[radial-gradient(circle,rgb(245_240_230/0.55)_0%,rgb(184_145_63/0.35)_45%,transparent_72%)]" />
        <span className="relative grid size-16 place-items-center overflow-hidden rounded-2xl bg-[#FBF8F1] font-heading text-h4 font-extrabold text-[#0B1F3A] shadow-[0_6px_16px_rgb(0_0_0/0.25)] transition-transform duration-200 ease-out group-hover:rotate-3 motion-reduce:group-hover:rotate-0">
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pic} alt="" aria-hidden className="size-full object-contain p-1.5 !bg-none" loading="lazy" />
          ) : i + 1}
        </span>
        {/* "completed": faint gold ring that stays */}
        <motion.span aria-hidden variants={ring} {...st} className="pointer-events-none absolute -inset-1 rounded-[1.15rem] ring-2 ring-[#B8913F]/60" />
      </motion.span>

      <motion.div variants={row} {...st} className="min-w-0 flex-1">
        <p className="card-dark-glass relative overflow-hidden p-5 font-semibold text-white">
          {/* hover: the row brightens slightly */}
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-white/[0.06] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          {/* one soft light sweep when the row arrives */}
          <motion.span aria-hidden variants={sweep} {...st} className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgb(245_240_230/0.18),transparent)]" />
          <span className="relative">{text}</span>
        </p>
      </motion.div>
    </li>
  );
}
