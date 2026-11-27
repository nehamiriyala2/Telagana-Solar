import type { LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { PhotoTile } from "@/components/ui/photo-tile";
import { cn } from "@/lib/utils";

export type BentoTone = "navy" | "blue" | "gold" | "green" | "cream" | "mint" | "white";

/**
 * Benefit cards (solution pages): white card, large rounded photo on top, a big faded number in the corner,
 * then title and description. Without a photo the card shows the icon in a blue-tint tile instead.
 * `tones` is kept for compatibility (all cards now share the clean white style).
 */
export function Bento({ items, className }: {
  items: { title: string; desc: string; Icon: LucideIcon; photo?: string }[]; tones?: BentoTone[]; className?: string;
}) {
  return (
    <Stagger className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map(({ title, desc, Icon, photo }, i) => (
        <StaggerItem key={i} className="list-none">
          <div className="card-premium relative flex h-full flex-col overflow-hidden p-4">
            <span aria-hidden className="pointer-events-none absolute right-4 top-2 z-0 font-heading text-[3.5rem] font-extrabold leading-none text-tint-mist">{String(i + 1).padStart(2, "0")}</span>
            {photo ? (
              <PhotoTile src={photo} alt="" className="relative z-10 mt-6 aspect-[5/4] w-full rounded-2xl bg-tint-ice text-primary"
                fallback={<Icon className="size-10" strokeWidth={1.5} aria-hidden />} />
            ) : (
              <span className="relative z-10 mt-6 grid size-14 place-items-center rounded-2xl bg-tint-ice text-primary"><Icon className="size-7" strokeWidth={1.6} aria-hidden /></span>
            )}
            <div className="relative z-10 mt-5 px-1 pb-1">
              <h3 className="font-heading text-[1.1875rem] font-bold leading-snug text-ink">{title}</h3>
              <p className="mt-2 text-[0.9375rem] text-body">{desc}</p>
            </div>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
