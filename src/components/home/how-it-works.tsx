"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Leaf } from "lucide-react";
import { UI_IMAGES } from "@/data/section-photos";
import { cn } from "@/lib/utils";

const STEPS = ["s1", "s2", "s3", "s4", "s5"] as const;

/**
 * "How it works": five numbered steps, each a white card with an illustration, joined by a thin line.
 * Used on every page that shows the process (home, solutions, persona and district pages), so the same
 * illustrations appear everywhere.
 * - `dark` (homepage): a light sky-blue gradient band with a curved top (kept airy, not heavy navy).
 * - light (inner pages): the same cards on tint A.
 */
export function HowItWorks({ dark = false }: { premium?: boolean; dark?: boolean }) {
  const t = useTranslations("how");
  return (
    <section aria-labelledby="how-title"
      className={cn("relative isolate overflow-hidden py-16 md:py-24",
        dark ? "band-curve bg-[linear-gradient(180deg,#2B6CB0_0%,#2B6CB0_55%,#2B6CB0_100%)] text-white" : "bg-mist")}>
      {dark && <span aria-hidden className="deco-blob -right-32 top-10 size-[28rem] bg-white/15" />}
      <div className="container-page">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-14">
          <p className={cn("inline-flex items-center gap-2 text-[0.8125rem] font-bold uppercase tracking-[0.18em]", dark ? "text-white" : "text-primary")}>
            <Leaf className={cn("size-4", dark ? "text-[#FDEBD6]" : "text-green")} aria-hidden />{t("eyebrow")}
          </p>
          <h2 id="how-title" className={cn("mt-3 font-heading text-[clamp(2rem,3.4vw,2.75rem)] font-extrabold leading-[1.15] tracking-[-0.02em]", dark ? "text-white" : "text-ink")}>{t("title")}</h2>
          <span aria-hidden className="mx-auto mt-4 block h-1 w-16 rounded-full bg-[#F2994A]" />
        </div>

        <div className="relative">
          <span aria-hidden className={cn("absolute left-[10%] right-[10%] top-6 hidden h-0.5 lg:block", dark ? "bg-white/50" : "bg-primary/25")} />
          <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            {STEPS.map((k, i) => (
              <motion.li key={k} className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                <span className="relative z-10 grid size-12 place-items-center rounded-full border-[3px] border-green bg-white font-heading text-[1.125rem] font-extrabold text-ink tabular-nums shadow-[0_6px_16px_-6px_rgb(28_47_71/0.4)]">{i + 1}</span>
                <div className="mt-5 flex w-full flex-1 flex-col items-center rounded-[1.25rem] border border-white/70 bg-white/95 p-5 text-center shadow-[0_14px_34px_-14px_rgb(28_47_71/0.35)]">
                  <span aria-hidden className="relative block h-24 w-full max-w-[9rem]">
                    <Image src={UI_IMAGES.steps[k]} alt="" fill sizes="144px" className="object-contain mix-blend-multiply" />
                  </span>
                  <h3 className="mt-4 font-heading text-[1.0625rem] font-bold leading-snug text-ink">{t(`${k}.title`)}</h3>
                  <p className="mt-2 text-[0.875rem] text-body">{t(`${k}.desc`)}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
