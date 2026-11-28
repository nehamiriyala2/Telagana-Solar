"use client";
/**
 * Shared motion kit for the public site. Every pattern uses these pieces with its own choreography;
 * all timings live in src/lib/motion.ts.
 * - useInViewOnce: true once the element is ~30% in view (entrance animations play once)
 * - useMedia: a CSS media query as a boolean (null until mounted)
 * - useStill: prefers-reduced-motion → show final state, no loops
 * - motionState: the initial/animate pair every variant-driven element uses
 * Re-exports the existing <Reveal>, <DrawLine> and <CountUp> so pages import one place.
 */
import { useEffect, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { IN_VIEW_AMOUNT } from "@/lib/motion";

export { Reveal } from "./reveal";
export { DrawLine } from "./primitives";
export { CountUp } from "./count-up";
export { useStill } from "./use-still";

export function useInViewOnce(ref: RefObject<Element | null>, amount = IN_VIEW_AMOUNT) {
  return useInView(ref, { once: true, amount });
}

export function useMedia(query: string) {
  const [match, setMatch] = useState<boolean | null>(null);
  useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setMatch(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, [query]);
  return match;
}

/** initial/animate props for variants named "hide" / "show". Reduced motion starts (and stays) on "show". */
export function motionState(still: boolean, show: boolean) {
  return { initial: still ? "show" : "hide", animate: still || show ? "show" : "hide" } as const;
}
