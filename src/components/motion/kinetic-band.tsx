"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Kinetic typography band: the brand line in huge type, two rows that slide in opposite directions as the
 * page scrolls (filled row + outlined row, with small suns between phrases). Purely decorative repetition of
 * text that exists elsewhere, so it is aria-hidden except for one readable copy. Static for reduced motion.
 */
export function KineticBand({ phrases, tone = "light", className }: { phrases: string[]; tone?: "light" | "dark"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-22%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], reduce ? ["-22%", "-22%"] : ["-22%", "0%"]);
  const dark = tone === "dark";
  const row = [...phrases, ...phrases, ...phrases];

  const Sun = () => (
    <span aria-hidden className="mx-[0.35em] inline-block size-[0.42em] -translate-y-[0.08em] rounded-full bg-gold align-middle" />
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden py-10 md:py-14", className)}>
      <p className="sr-only">{phrases.join(" ")}</p>
      <motion.div aria-hidden style={{ x: x1 }} className={cn("kinetic-row", dark ? "text-white" : "text-ink")}>
        {row.map((p, i) => (
          <span key={i}>{i % 2 ? <span className="text-gold-shine">{p}</span> : p}<Sun /></span>
        ))}
      </motion.div>
      <motion.div aria-hidden style={{ x: x2, ["--stroke" as string]: dark ? "rgb(43 108 176 / 0.6)" : "rgb(30 64 175 / 0.35)" }} className="kinetic-row kinetic-outline mt-2">
        {row.map((p, i) => <span key={i}>{p}<span className="mx-[0.35em]">✦</span></span>)}
      </motion.div>
    </div>
  );
}
