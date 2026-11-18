"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Counts up to `value` when first visible, then tweens between later values.
 * `format` turns the number into display text (₹, lakh, decimals…).
 */
export function CountUp({ value, format = (n) => Math.round(n).toString(), duration = 0.9, className }: {
  value: number; format?: (n: number) => string; duration?: number; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const from = useRef(0);
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setDisplay(format(value)); from.current = value; return; }
    const controls = animate(from.current, value, {
      duration, ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(v)),
      onComplete: () => { from.current = value; },
    });
    return () => { controls.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, reduce]);

  return <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>{display}</span>;
}
