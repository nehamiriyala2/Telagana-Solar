"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useStill } from "./use-still";

/**
 * Counts up to `value` when first visible, then tweens between later values.
 * `format` turns the number into display text (₹, lakh, decimals…).
 */
export function CountUp({ value, format = (n) => Math.round(n).toString(), duration = 0.9, className }: {
  value: number; format?: (n: number) => string; duration?: number; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useStill();
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

/**
 * Counts up the first number inside already-formatted text ("₹78k", "₹3,003", "4.3 years", "4 kW"), keeping the
 * prefix, suffix, decimals and digit grouping. Screen readers get the final text straight away.
 */
export function CountUpText({ text, duration = 1.2, className }: { text: string; duration?: number; className?: string }) {
  const m = text.match(/\d[\d,]*(\.\d+)?/);
  if (!m) return <span className={className}>{text}</span>;
  const raw = m[0];
  const target = Number(raw.replace(/,/g, ""));
  const decimals = m[1] ? m[1].length - 1 : 0;
  const grouped = raw.includes(",");
  const fmt = (n: number) => {
    const v = n.toFixed(decimals);
    const s = grouped ? Number(v).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : v;
    return text.replace(raw, s);
  };
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden><CountUp value={target} format={fmt} duration={duration} /></span>
    </span>
  );
}
