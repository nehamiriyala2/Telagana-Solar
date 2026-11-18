"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Segmented control / filter chips with an animated active pill. */
export function ChoiceChips<T extends string>({
  options, value, onChange, label, layoutId, className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  layoutId: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex flex-wrap gap-1 rounded-3xl border border-line bg-surface p-1", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative min-h-10 rounded-full px-4 py-2 text-caption font-medium transition-colors duration-300",
              active ? "text-navy" : "text-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-sun"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
