"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, FileText, ListChecks, Wrench, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { Wave } from "@/components/page/tone-section";

const STEPS = [
  { key: "s1", Icon: BookOpen },
  { key: "s2", Icon: ListChecks },
  { key: "s3", Icon: FileText },
  { key: "s4", Icon: Wrench },
  { key: "s5", Icon: Zap },
] as const;

/**
 * 5-step timeline. A gold line draws between the steps and a small sun travels along it
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
    <section className={dark ? "tone tone-navy pb-16 pt-24 md:pb-24 md:pt-32" : premium ? "dot-grid bg-premium-sky relative isolate overflow-hidden py-16 md:py-24" : "section"} aria-labelledby="how-title">
      {dark && <span aria-hidden className="tone-beam" />}
      {dark && <Wave color="#FFFFFF" position="top" />}
      {premium && <div aria-hidden className={cn("orb left-1/3 -top-24 size-96", dark ? "bg-yellow/15" : "bg-yellow/20")} />}
      <div className="container-page">
        <SectionHeading premium={premium} tone={dark ? "dark" : "light"} eyebrow={t("eyebrow")} title={t("title")} />
        <div ref={ref} className="relative">
          {/* Desktop: horizontal sun path */}
          <div aria-hidden className={cn("absolute left-[10%] right-[10%] top-8 hidden h-1 rounded-full lg:block", dark ? "bg-white/15" : premium ? "bg-royal/15" : "bg-sky-tint")}>
            <motion.div className="h-full rounded-full bg-sun" style={{ width: reduce ? "100%" : pct }} />
            <motion.div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: reduce ? "100%" : pct }}>
              <span className="block size-6 rounded-full bg-[radial-gradient(circle_at_35%_35%,#FFE58A,#F5A800_55%,#E88A00)] shadow-[0_0_24px_6px_rgb(245_168_0/0.5)]" />
            </motion.div>
          </div>
          {/* Mobile: vertical line */}
          <div aria-hidden className={cn("absolute bottom-8 left-8 top-8 w-1 rounded-full lg:hidden", dark ? "bg-white/15" : premium ? "bg-royal/15" : "bg-sky-tint")}>
            <motion.div className="w-full rounded-full bg-sun" style={{ height: reduce ? "100%" : pct }} />
          </div>

          <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
            {STEPS.map(({ key, Icon }, i) => (
              <Step key={key} i={i} progress={p} reduce={!!reduce} premium={premium} dark={dark} Icon={Icon} title={t(`${key}.title`)} desc={t(`${key}.desc`)} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({ i, progress, reduce, premium, dark = false, Icon, title, desc }: {
  i: number; progress: MotionValue<number>; reduce: boolean; premium: boolean; dark?: boolean; Icon: typeof Zap; title: string; desc: string;
}) {
  const threshold = i / 4 - 0.05;
  const bgMv = useTransform(progress, (v) => (v >= threshold ? "#F5A800" : "#EAF4FF"));
  const colorMv = useTransform(progress, (v) => (v >= threshold ? "#07173F" : "#1E5BD8"));
  const bg = reduce ? "#F5A800" : bgMv;
  const color = reduce ? "#07173F" : colorMv;

  return (
    <motion.li className="flex gap-5 lg:flex-col lg:items-center lg:text-center"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
      <motion.span style={{ backgroundColor: bg, color }} className={cn("relative z-10 grid size-16 shrink-0 place-items-center rounded-2xl shadow-soft ring-8 transition-colors", dark ? "ring-[#0A2462] shadow-[0_12px_30px_-12px_rgb(245_168_0/0.6)]" : premium ? "ring-[#F2F7FF] shadow-[0_12px_30px_-12px_rgb(245_168_0/0.6)]" : "ring-white")}>
        <Icon className="size-7" strokeWidth={1.6} aria-hidden />
        <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-navy text-[0.75rem] font-bold text-white">{i + 1}</span>
      </motion.span>
      <div className={cn("pt-1 lg:pt-5", premium && (dark ? "card-dark-glass" : "card-premium"), premium && "flex-1 p-4 lg:mt-5 lg:w-full lg:pt-4")}>
        <h3 className={cn("font-bold", premium ? cn("text-[1.0625rem]", dark ? "text-white" : "text-navy") : "font-heading text-[1.0625rem]")}>{title}</h3>
        <p className={cn("mt-1.5 text-caption", dark ? "on-dark-muted" : "text-muted")}>{desc}</p>
      </div>
    </motion.li>
  );
}
