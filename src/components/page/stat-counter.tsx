"use client";
import { CountUp } from "@/components/motion/count-up";

/** Animated number counter for server pages (counts up once when visible). */
export function StatCounter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  return <CountUp value={value} duration={1.4} format={(n) => `${prefix}${n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`} />;
}
