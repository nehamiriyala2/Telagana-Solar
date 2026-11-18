"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Handshake, Landmark, Languages, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const TRUST = [
  { key: "official", Icon: Landmark },
  { key: "neutral", Icon: Handshake },
  { key: "verified", Icon: BadgeCheck },
  { key: "telugu", Icon: Languages },
] as const;

export function TrustBadges() {
  const t = useTranslations("trust");
  return (
    <section className="section bg-surface-2/60" aria-labelledby="trust-title">
      <div className="container-page">
        <SectionHeading title={t("title")} />
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ key, Icon }, i) => (
            <Reveal key={key} delay={i * 0.06}>
              <li className="list-none">
                <span className="grid size-12 place-items-center rounded-2xl border border-gold/40 bg-gold-soft text-navy dark:bg-gold/10 dark:text-gold">
                  <Icon className="size-6" strokeWidth={1.6} aria-hidden />
                </span>
                <h3 className="mt-5 text-h4">{t(`items.${key}.title`)}</h3>
                <p className="mt-2 text-muted">{t(`items.${key}.desc`)}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq() {
  const t = useTranslations("faq");
  const [open, setOpen] = useState<string | null>("q1");
  const keys = ["q1", "q2", "q3", "q4", "q5"];
  return (
    <section className="section" aria-labelledby="faq-title">
      <div className="container-page max-w-3xl">
        <SectionHeading title={t("title")} />
        <div className="divide-y divide-line rounded-card border border-line bg-surface">
          {keys.map((k) => {
            const isOpen = open === k;
            return (
              <div key={k}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${k}`}
                    onClick={() => setOpen(isOpen ? null : k)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-heading text-[1.0625rem] font-bold md:text-[1.125rem]"
                  >
                    {t(`items.${k}.q`)}
                    <Plus className={cn("size-5 shrink-0 transition-transform duration-300", isOpen && "rotate-45")} aria-hidden />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`faq-${k}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="px-6 pb-6 text-muted">{t(`items.${k}.a`)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
