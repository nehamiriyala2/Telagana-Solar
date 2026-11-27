import type { LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";
import { PhotoTile } from "@/components/ui/photo-tile";

export type BentoTone = "navy" | "blue" | "gold" | "green" | "cream" | "mint" | "white";
const DARK: BentoTone[] = ["navy", "blue", "green"];

/**
 * Bento grid of mixed-colour cards with a big faded number in each, so a list of benefits/values reads as
 * a composition rather than identical boxes. The first card is wide (spans two columns) on large screens.
 * `tones` sets the colour sequence; text colours follow each card's tone.
 */
export function Bento({ items, tones = ["navy", "gold", "mint", "blue"], className }: {
  items: { title: string; desc: string; Icon: LucideIcon; photo?: string }[]; tones?: BentoTone[]; className?: string;
}) {
  return (
    <Stagger className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map(({ title, desc, Icon, photo }, i) => {
        const tone = tones[i % tones.length];
        const dark = DARK.includes(tone);
        return (
          <StaggerItem key={i} className={cn("list-none", i === 0 && items.length % 2 === 1 ? "lg:col-span-2" : "", i === 0 && items.length === 4 && "lg:row-span-1")}>
            <div className={cn("bento-card flex h-full min-h-[13rem] flex-col justify-between", `bento-${tone}`)}>
              <span aria-hidden className="bento-num">{String(i + 1).padStart(2, "0")}</span>
              {photo ? (
                <PhotoTile src={photo} alt="" className={cn("float-soft size-20 rounded-2xl shadow-[0_14px_28px_-14px_rgb(15_47_107/0.6)] ring-[3px]", dark ? "bg-white/15 text-white ring-white/40" : tone === "gold" ? "bg-white/60 text-[#1D4ED8] ring-white/80" : "icon-primary-hover ring-white")}
                  style={{ animationDelay: `${i * -1.3}s` }} fallback={<Icon className="size-8" strokeWidth={1.7} aria-hidden />} />
              ) : (
                <span className={cn("float-soft grid size-12 place-items-center rounded-2xl", dark ? "bg-white/15 text-white ring-1 ring-white/25" : tone === "gold" ? "bg-white/60 text-[#1D4ED8]" : "icon-primary-hover")} style={{ animationDelay: `${i * -1.3}s` }}>
                  <Icon className="size-6" strokeWidth={1.7} aria-hidden />
                </span>
              )}
              <div className="mt-6">
                <h3 className="font-heading text-[1.25rem] font-extrabold leading-tight tracking-[-0.02em]">{title}</h3>
                <p className={cn("mt-2 text-caption", dark ? "text-white/80" : "text-[#475569]")}>{desc}</p>
              </div>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
