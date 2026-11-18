"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** `premium` (homepage) renders each question as its own card with a gold accent when open. */
export function Accordion({ items, defaultOpen = 0, premium = false }: { items: { q: string; a: string }[]; defaultOpen?: number | null; premium?: boolean }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className={premium ? "space-y-3" : "divide-y divide-line rounded-card border border-line bg-white shadow-soft"}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={premium ? cn("overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow] duration-500", isOpen ? "border-gold/50 shadow-[0_18px_40px_-24px_rgb(245_168_0/0.6)]" : "border-line shadow-soft hover:border-royal/30") : undefined}>
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={`acc-${i}`} onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left font-heading text-[1.0625rem] font-bold md:px-7">
                {it.q}
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-300", isOpen ? "bg-gold text-navy" : "bg-sky-tint text-sky-ink")}>
                  <Plus className={cn("size-4 transition-transform duration-300", isOpen && "rotate-45")} aria-hidden />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`acc-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <p className="px-5 pb-6 text-muted md:px-7">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
