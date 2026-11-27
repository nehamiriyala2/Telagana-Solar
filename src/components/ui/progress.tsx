"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Animated progress bar, value 0..1. */
export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-primary/10", className)}
    >
      <motion.div
        className="h-full rounded-full bg-sun"
        initial={false}
        animate={{ width: `${v * 100}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
