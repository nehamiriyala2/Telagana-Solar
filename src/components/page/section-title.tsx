import { MaskHeading } from "@/components/motion/primitives";
import { BlurReveal } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

/**
 * Inner-page section heading: eyebrow pill + display heading with a word mask reveal + subtitle.
 * - tone="dark" for navy/blue sections (white heading, light text, gold eyebrow).
 * - index="01" draws a big outlined number behind the heading (editorial section numbering).
 */
export function SectionTitle({ eyebrow, title, emphasis, subtitle, align = "left", className, id, tone = "light", index }: {
  eyebrow?: string; title: string; emphasis?: string; subtitle?: string; align?: "left" | "center"; className?: string; id?: string;
  tone?: "light" | "dark"; index?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("relative isolate mb-10 md:mb-14", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)}>
      {index && <span aria-hidden className={cn("section-index", align === "center" && "left-1/2 right-auto -translate-x-1/2")}>{index}</span>}
      {eyebrow && <BlurReveal><p className={cn("eyebrow-pill mb-5", dark && "eyebrow-pill--dark")}>{eyebrow}</p></BlurReveal>}
      <div id={id}><MaskHeading text={title} emphasis={emphasis} className={cn("display-lg", dark ? "text-white" : "text-ink")} /></div>
      {subtitle && <BlurReveal delay={0.15}><p className={cn("mt-5 md:text-body-lg", dark ? "on-dark-muted" : "text-[var(--ts-text)]")}>{subtitle}</p></BlurReveal>}
    </div>
  );
}
