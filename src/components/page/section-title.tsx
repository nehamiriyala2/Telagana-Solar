import { MaskHeading } from "@/components/motion/primitives";
import { BlurReveal } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

/** Inner-page section heading: eyebrow pill + display heading with a word mask reveal + subtitle. */
export function SectionTitle({ eyebrow, title, emphasis, subtitle, align = "left", className, id }: {
  eyebrow?: string; title: string; emphasis?: string; subtitle?: string; align?: "left" | "center"; className?: string; id?: string;
}) {
  return (
    <div className={cn("mb-10 md:mb-14", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)}>
      {eyebrow && <BlurReveal><p className="eyebrow-pill mb-5">{eyebrow}</p></BlurReveal>}
      <div id={id}><MaskHeading text={title} emphasis={emphasis} className="display-lg text-navy" /></div>
      {subtitle && <BlurReveal delay={0.15}><p className="mt-5 text-muted md:text-body-lg">{subtitle}</p></BlurReveal>}
    </div>
  );
}
