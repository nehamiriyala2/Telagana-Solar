"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, FileText, ListChecks, Wrench, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "s1", Icon: BookOpen },
  { key: "s2", Icon: ListChecks },
  { key: "s3", Icon: FileText },
  { key: "s4", Icon: Wrench },
  { key: "s5", Icon: Zap },
] as const;

/**
 * 5-step "How it works" timeline: numbered badges joined by a thin line that fills in as the section scrolls into
 * view (horizontal on desktop, vertical on mobile).
 * - `dark` (homepage): deep-blue gradient band with a curved top, white text; every step badge has the same blue → green gradient ring.
 * - light (inner pages): white step cards, blue number badges.
 */
export function HowItWorks({ premium = false, dark = false }: { premium?: boolean; dark?: boolean }) {
  const t = useTranslations("how");
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const pct = useTransform(p, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);
  const fill = dark ? "bg-[linear-gradient(90deg,#3B82F6,#16A34A)]" : "bg-primary";

  return (
    <section className={dark ? "tone tone-navy band-curve pb-16 md:pb-24" : premium ? "bg-mist py-16 md:py-24" : "section"} aria-labelledby="how-title">
      <div className="container-page">
        <SectionHeading premium={premium} tone={dark ? "dark" : "light"} eyebrow={t("eyebrow")} title={t("title")} />
        <div ref={ref} className="relative">
          <div aria-hidden className={cn("absolute left-[10%] right-[10%] top-6 hidden h-px lg:block", dark ? "bg-white/20" : "bg-card-line")}>
            <motion.div className={cn("h-full", fill)} style={{ width: reduce ? "100%" : pct }} />
          </div>
          <div aria-hidden className={cn("absolute bottom-6 left-6 top-6 w-px lg:hidden", dark ? "bg-white/20" : "bg-card-line")}>
            <motion.div className={cn("w-full", fill)} style={{ height: reduce ? "100%" : pct }} />
          </div>

          <ol className="relative grid gap-6 lg:grid-cols-5 lg:gap-5">
            {STEPS.map(({ key, Icon }, i) => (
              <Step key={key} i={i} progress={p} reduce={!!reduce} dark={dark} Icon={Icon} title={t(`${key}.title`)} desc={t(`${key}.desc`)} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({ i, dark, Icon, title, desc }: {
  i: number; progress: MotionValue<number>; reduce: boolean; dark: boolean; Icon: typeof Zap; title: string; desc: string;
}) {
  return (
    <motion.li className="flex gap-5 lg:flex-col lg:items-center lg:text-center"
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
      {/* Same style for every step: a blue → green gradient ring around a solid centre (not a progress bar) */}
      <span className={cn("relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#3B82F6,#16A34A)] p-[3px]",
        dark ? "shadow-[0_0_0_6px_#0F2F6B]" : "shadow-[0_0_0_6px_#DFE9F7]")}>
        <span className={cn("grid size-full place-items-center rounded-full font-heading text-[1.0625rem] font-bold tabular-nums", dark ? "bg-[#0F2F6B] text-white" : "bg-white text-primary")}>{i + 1}</span>
      </span>
      <div className={cn("flex-1 rounded-[1.25rem] p-5 lg:mt-5 lg:w-full", dark ? "card-dark-glass" : "card-premium")}>
        <Icon className={cn("mb-2.5 size-5 lg:mx-auto", dark ? "text-[#93B4FF]" : "text-primary")} strokeWidth={1.8} aria-hidden />
        <h3 className={cn("font-heading text-[1.0625rem] font-bold", dark ? "text-white" : "text-ink")}>{title}</h3>
        <p className={cn("mt-1.5 text-[0.875rem]", dark ? "on-dark-muted" : "text-muted")}>{desc}</p>
      </div>
    </motion.li>
  );
}
