import type { LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

export type BentoTone = "navy" | "blue" | "gold" | "green" | "cream" | "mint" | "white";
const DARK: BentoTone[] = ["navy", "blue", "green"];

/**
 * Bento grid of mixed-colour cards with a big faded number in each, so a list of benefits/values reads as
 * a composition rather than identical boxes. The first card is wide (spans two columns) on large screens.
 * `tones` sets the colour sequence; text colours follow each card's tone.
 */
export function Bento({ items, tones = ["navy", "gold", "mint", "blue"], className }: {
  items: { title: string; desc: string; Icon: LucideIcon }[]; tones?: BentoTone[]; className?: string;
}) {
  return (
    <Stagger className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map(({ title, desc, Icon }, i) => {
        const tone = tones[i % tones.length];
        const dark = DARK.includes(tone);
        return (
          <StaggerItem key={i} className={cn("list-none", i === 0 && items.length % 2 === 1 ? "lg:col-span-2" : "", i === 0 && items.length === 4 && "lg:row-span-1")}>
            <div className={cn("bento-card flex h-full min-h-[13rem] flex-col justify-between", `bento-${tone}`)}>
              <span aria-hidden className="bento-num">{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("float-soft grid size-12 place-items-center rounded-2xl", dark ? "bg-white/15 text-white ring-1 ring-white/25" : tone === "gold" ? "bg-white/60 text-[#071B49]" : "icon-royal")} style={{ animationDelay: `${i * -1.3}s` }}>
                <Icon className="size-6" strokeWidth={1.7} aria-hidden />
              </span>
              <div className="mt-8">
                <h3 className="font-heading text-[1.25rem] font-extrabold leading-tight tracking-[-0.02em]">{title}</h3>
                <p className={cn("mt-2 text-caption", dark ? "text-white/80" : "text-[#52617D]")}>{desc}</p>
              </div>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
