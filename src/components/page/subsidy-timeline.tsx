"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, type Variants } from "framer-motion";
import { PhotoTile } from "@/components/ui/photo-tile";
import { motionState, useInViewOnce, useStill } from "@/components/motion/kit";
import { EASE, TRACK as T } from "@/lib/motion";

type ScrollOffset = NonNullable<NonNullable<Parameters<typeof useScroll>[0]>["offset"]>;

type Item = { title: string; desc: string; img: string };

/**
 * Subsidy page "How the home subsidy works": numbered dots on a vertical line with cards beside them.
 * Pattern 5 "progress tracker that fills as you read" (timings: src/lib/motion.ts → TRACK):
 * the navy line fills with scroll progress; a dot lights up (with a ring pulse) when the fill reaches it and dims
 * again above it; each card slides in from the right once; the card nearest the viewport centre is highlighted.
 */
export function SubsidyTimeline({ items }: { items: Item[] }) {
  const still = useStill();
  const listRef = useRef<HTMLOListElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll({ target: listRef, offset: [`start ${T.start}`, `end ${T.end}`] as ScrollOffset });
  const { scrollY } = useScroll();
  const [lit, setLit] = useState(0);
  const [active, setActive] = useState(-1);
  const n = items.length;

  useMotionValueEvent(scrollYProgress, "change", (v) => setLit(v <= 0 ? 0 : Math.min(n, Math.floor(v * (n - 1) + 0.02) + 1)));
  // active card = the one whose centre is nearest the viewport centre (only while the list is on screen)
  const pickActive = useCallback(() => {
    const list = listRef.current?.getBoundingClientRect();
    if (!list || list.bottom < 0 || list.top > window.innerHeight) { setActive(-1); return; }
    const mid = window.innerHeight / 2;
    let best = -1, dist = Infinity;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < dist) { dist = d; best = i; }
    });
    setActive(best);
  }, []);
  useMotionValueEvent(scrollY, "change", pickActive);   // framer batches scroll updates once per frame
  useEffect(() => { pickActive(); setLit(scrollYProgress.get() > 0 ? Math.min(n, Math.floor(scrollYProgress.get() * (n - 1) + 0.02) + 1) : 0); }, [pickActive, scrollYProgress, n]);

  return (
    <ol ref={listRef} className="relative">
      <span aria-hidden className="absolute bottom-6 left-[13px] top-6 w-0.5 rounded-full bg-primary/15">
        <motion.span className="block h-full w-full origin-top rounded-full bg-primary" style={{ scaleY: still ? 1 : scrollYProgress }} />
      </span>
      {items.map((it, i) => (
        <Row key={it.title} i={i} item={it} lit={still || i < lit} active={i === active} still={still}
          cardRef={(el) => { cards.current[i] = el; }} />
      ))}
    </ol>
  );
}

function Row({ i, item, lit, active, still, cardRef }: {
  i: number; item: Item; lit: boolean; active: boolean; still: boolean; cardRef: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInViewOnce(ref, 0.3);
  const st = motionState(still, seen);
  const card: Variants = { hide: { opacity: 0, x: T.cardShift }, show: { opacity: 1, x: 0, transition: { duration: T.card, ease: EASE } } };
  const thumb: Variants = { hide: { scale: T.thumbFrom }, show: { scale: 1, transition: { duration: T.card + 0.15, ease: EASE } } };
  const dot = { initial: false as const, animate: lit && !still ? { scale: [1, 1.25, 1] } : { scale: 1 }, transition: { duration: T.dotPop, ease: EASE } };
  const pulse = { initial: false as const, animate: lit && !still ? { scale: [1, 2], opacity: [0.7, 0] } : { scale: 1, opacity: 0 }, transition: { duration: T.ringPulse, ease: "easeOut" as const } };
  const num = String(i + 1).padStart(2, "0");

  return (
    <li ref={ref} className="relative flex items-center gap-5 pb-5 last:pb-0">
      <motion.span {...dot} className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full">
        <motion.span aria-hidden {...pulse} className="absolute inset-0 rounded-full border-2 border-primary" />
        {/* dim state (below the fill) */}
        <span className="absolute inset-0 grid place-items-center rounded-full border border-primary/25 bg-white font-heading text-[0.8125rem] font-bold text-primary/55 ring-4 ring-cloud tabular-nums">{num}</span>
        {/* lit state: crossfades in when the fill reaches the dot */}
        <span className={`absolute inset-0 grid place-items-center rounded-full bg-primary font-heading text-[0.8125rem] font-bold text-white ring-4 ring-cloud tabular-nums transition-opacity duration-300 ${lit ? "opacity-100" : "opacity-0"}`}>{num}</span>
      </motion.span>

      <motion.div variants={card} {...st} className="min-w-0 flex-1">
        <div ref={cardRef} className="relative flex items-center gap-4 rounded-[1.25rem] border border-card-line bg-white p-2.5 pr-5 shadow-[0_10px_30px_rgb(11_31_58/0.10)] transition-transform duration-200 hover:-translate-y-1">
          {/* active card: soft gold border + slightly stronger shadow (opacity only) */}
          <span aria-hidden className={`pointer-events-none absolute -inset-px rounded-[1.25rem] border-2 border-[#B8913F]/70 shadow-[0_18px_40px_-14px_rgb(11_31_58/0.30)] transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDuration: `${T.active}s` }} />
          <span className="relative size-[72px] shrink-0 overflow-hidden rounded-xl">
            <motion.span variants={thumb} {...st} className="absolute inset-0">
              <PhotoTile src={item.img} alt="" className="size-full rounded-xl bg-tint-ice" />
            </motion.span>
          </span>
          <div className="relative min-w-0">
            <h3 className="font-heading text-[1.125rem] font-bold text-ink">{item.title}</h3>
            <p className="mt-1 text-[0.9375rem] text-body">{item.desc}</p>
          </div>
        </div>
      </motion.div>
    </li>
  );
}
