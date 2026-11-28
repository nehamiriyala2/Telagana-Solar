"use client";
import { useEffect, useState } from "react";
import { MotionGlobalConfig } from "framer-motion";

/**
 * prefers-reduced-motion, hydration-safe: false on the server and on the first client render (so the HTML matches),
 * then the real value. When it is on, every Framer Motion animation on the page completes instantly, so people who
 * asked for less motion see the final state straight away and no loops run.
 */
export function useStill() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setStill(m.matches); MotionGlobalConfig.instantAnimations = m.matches; };
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  return still;
}
