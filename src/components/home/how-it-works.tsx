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
 * 5-step timeline: numbered circles joined by a gold line that fills in
 * as the section scrolls into view (horizontal on desktop, vertical on mobile).
 * `premium` is the homepage look (step cards); `dark` puts it on a deep-navy section; other pages keep the default.
 */
export function HowItWorks({ premium = false, dark = false }: { premium?: boolean; dark?: boolean }) {
  const t = useTranslations("how");
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const pct = useTransform(p, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);

  return (
    <section className={dark ? "tone tone-navy py-16 md:py-24" : premium ? "dot-grid bg-premium-sky relative isolate overflow-hidden py-16 md:py-24" : "section"} aria-labelledby="how-title">
      {premium && <div aria-hidden className={cn("orb left-1/3 -top-24 size-96", dark ? "bg-yellow/15" : "bg-yellow/20")} />}
      <div className="container-page">
        <SectionHeading premium={premium} tone={dark ? "dark" : "light"} eyebrow={t("eyebrow")} title={t("title")} />
        <div ref={ref} className="relative">
          {/* Desktop: horizontal gold line through the numbered circles */}
          <div aria-hidden className={cn("absolute left-[10%] right-[10%] top-8 hidden h-0.5 lg:block", dark ? "bg-cloud/15" : "bg-line")}>
            <motion.div className="h-full bg-primary" style={{ width: reduce ? "100%" : pct }} />
          </div>
          {/* Mobile: vertical line */}
          <div aria-hidden className={cn("absolute bottom-8 left-7 top-8 w-0.5 lg:hidden", dark ? "bg-cloud/15" : "bg-line")}>
            <motion.div className="w-full bg-primary" style={{ height: reduce ? "100%" : pct }} />
          </div>

          <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
            {STEPS.map(({ key, Icon }, i) => (
              <Step key={key} k={key} i={i} progress={p} reduce={!!reduce} premium={premium} dark={dark} Icon={Icon} title={t(`${key}.title`)} desc={t(`${key}.desc`)} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({ i, progress, reduce, premium, dark = false, Icon, title, desc }: {
  k: string; i: number; progress: MotionValue<number>; reduce: boolean; premium: boolean; dark?: boolean; Icon: typeof Zap; title: string; desc: string;
}) {
  const threshold = i / 4 - 0.05;
  const bgMv = useTransform(progress, (v) => (v >= threshold ? "#F0BE4A" : "#FCFDFF"));
  const colorMv = useTransform(progress, (v) => (v >= threshold ? "#3A2A06" : "#8A6514"));
  const bg = reduce ? "#F0BE4A" : bgMv;
  const color = reduce ? "#3A2A06" : colorMv;

  return (
    <motion.li className="flex gap-5 lg:flex-col lg:items-center lg:text-center"
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
      <motion.span style={{ backgroundColor: bg, color }}
        className={cn("relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-gold font-heading text-[1.375rem] font-semibold lg:size-16", dark ? "shadow-[0_0_0_8px_#2B6CB0]" : "shadow-[0_0_0_8px_#F7FAFD]")}>
        {i + 1}
      </motion.span>
      <div className={cn("flex-1 pt-1 lg:self-stretch", premium && (dark ? "card-dark-glass" : "card-premium"), premium && "p-5 lg:mt-6 lg:w-full")}>
        <Icon className={cn("mb-2 size-5 lg:mx-auto", dark ? "text-gold" : "text-primary")} strokeWidth={1.6} aria-hidden />
        <h3 className={cn("font-heading text-[1.125rem] font-semibold", dark ? "text-cloud" : "text-ink")}>{title}</h3>
        <p className={cn("mt-1.5 text-caption", dark ? "on-dark-muted" : "text-muted")}>{desc}</p>
      </div>
    </motion.li>
  );
}
