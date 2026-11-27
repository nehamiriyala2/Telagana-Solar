"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** `premium` renders each question as its own ivory card with a gold plus/minus; smooth height open/close. */
export function Accordion({ items, defaultOpen = 0, premium = false }: { items: { q: string; a: string }[]; defaultOpen?: number | null; premium?: boolean }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className={premium ? "space-y-3" : "divide-y divide-line rounded-card border border-line bg-cloud shadow-soft"}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={premium ? cn("overflow-hidden rounded-2xl border bg-cloud transition-[border-color,box-shadow] duration-500", isOpen ? "border-gold/60 shadow-soft" : "border-line hover:border-gold/50") : undefined}>
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={`acc-${i}`} onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left font-heading text-[1.125rem] font-semibold text-ink md:px-7">
                {it.q}
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-300", isOpen ? "border-primary bg-primary text-card" : "border-primary/40 text-primary")}>
                  {isOpen ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`acc-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <p className="px-5 pb-6 text-body md:px-7">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
