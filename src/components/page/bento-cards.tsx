"use client";
import { useRef, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { PhotoTile } from "@/components/ui/photo-tile";
import { motionState, useInViewOnce, useMedia, useStill } from "@/components/motion/kit";
import { CARDS as C, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Item = { title: string; desc: string; icon: ReactNode; iconLg: ReactNode; photo?: string };

/**
 * Numbered benefit cards (solution pages, About values): white card, gold number with a line, photo, title, text.
 * Motion: Pattern 3 "cards developing like photos" (timings: src/lib/motion.ts → CARDS). Cards in a row enter
 * left → right: card fades up → number slides in → gold line draws → photo wipes in bottom → top → text fades up.
 * Each number turns from soft to deep gold once the previous card's line has finished.
 */
export function BentoCards({ items, className }: { items: Item[]; className?: string }) {
  const lg = useMedia("(min-width: 1024px)");
  const sm = useMedia("(min-width: 640px)");
  const cols = lg ? 4 : sm ? 2 : 1;
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((it, i) => <BentoCard key={i} i={i} col={i % cols} ready={lg !== null} {...it} />)}
    </ul>
  );
}

function BentoCard({ i, col, ready, title, desc, icon, iconLg, photo }: Item & { i: number; col: number; ready: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInViewOnce(ref);
  const still = useStill();
  const st = motionState(still, seen && ready);
  const s = col * C.stagger;
  const go = (delay: number, duration: number) => ({ delay, duration, ease: EASE });
  // the number deepens when the previous card's line finishes (first card: right after its number lands)
  const deepAt = col === 0 ? s + C.numberAt + C.number * 0.6 : (col - 1) * C.stagger + C.lineAt + C.line;

  const card: Variants = { hide: { opacity: 0, y: C.cardRise }, show: { opacity: 1, y: 0, transition: go(s, C.card) } };
  const num: Variants = { hide: { opacity: 0, x: -C.numberShift }, show: { opacity: 1, x: 0, transition: go(s + C.numberAt, C.number) } };
  const deep: Variants = { hide: { opacity: 0 }, show: { opacity: 1, transition: go(deepAt, C.deepen) } };
  const line: Variants = { hide: { scaleX: 0 }, show: { scaleX: 1, transition: go(s + C.lineAt, C.line) } };
  const wipe: Variants = { hide: { clipPath: "inset(100% 0% 0% 0%)" }, show: { clipPath: "inset(0% 0% 0% 0%)", transition: go(s + C.imageAt, C.image) } };
  const text: Variants = { hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: go(s + C.textAt, C.text) } };
  const n = String(i + 1).padStart(2, "0");

  return (
    <li ref={ref} className="group list-none">
      <motion.div variants={card} {...st} className="h-full">
        {/* hover (pointer devices only): lift 6px; overrides the generic card hover so it is exactly 6px */}
        <div className="card-premium relative flex h-full flex-col overflow-hidden p-4 [transform:none]! duration-200 ease-out hover:[transform:translateY(-6px)]! motion-reduce:hover:[transform:none]!">
          <span aria-hidden className="flex items-center gap-2 px-1 font-heading text-[1.75rem] font-extrabold leading-none tabular-nums">
            <motion.span variants={num} {...st} className="relative">
              <span className="text-accent/45">{n}</span>
              <motion.span variants={deep} {...st} className="absolute inset-0 text-accent">{n}</motion.span>
            </motion.span>
            <span className="mr-5 h-px flex-1">
              <span className="block h-full origin-left transition-transform duration-300 ease-out group-hover:scale-x-[1.12]">
                <motion.span variants={line} {...st} className="block h-full origin-left bg-accent/60" />
              </span>
            </span>
          </span>
          {photo ? (
            <motion.div variants={wipe} {...st} className="relative z-10 mt-3 overflow-hidden rounded-2xl">
              <div className="transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100">
                <PhotoTile src={photo} alt="" className="aspect-[5/4] w-full rounded-2xl bg-tint-ice text-primary"
                  fallback={iconLg} />
              </div>
            </motion.div>
          ) : (
            <motion.span variants={wipe} {...st} className="relative z-10 mt-3 grid size-14 place-items-center rounded-2xl bg-tint-ice text-primary">{icon}</motion.span>
          )}
          <motion.div variants={text} {...st} className="relative z-10 mt-5 px-1 pb-1">
            <h3 className="font-heading text-[1.1875rem] font-bold leading-snug text-ink">{title}</h3>
            <p className="mt-2 text-[0.9375rem] text-body">{desc}</p>
          </motion.div>
        </div>
      </motion.div>
    </li>
  );
}
