import type { LucideIcon } from "lucide-react";
import { BentoCards } from "./bento-cards";

export type BentoTone = "navy" | "blue" | "gold" | "green" | "cream" | "mint" | "white";

/**
 * Numbered benefit cards (solution pages, About values). Server wrapper: renders the icons here (icon components
 * can't be passed to client components) and hands the animated grid to BentoCards (Pattern 3 motion).
 * `tones` is kept for compatibility (all cards share the same style).
 */
export function Bento({ items, className }: {
  items: { title: string; desc: string; Icon: LucideIcon; photo?: string }[]; tones?: BentoTone[]; className?: string;
}) {
  return (
    <BentoCards className={className} items={items.map(({ Icon, ...rest }) => ({
      ...rest,
      icon: <Icon className="size-7" strokeWidth={1.6} aria-hidden />,
      iconLg: <Icon className="size-10" strokeWidth={1.5} aria-hidden />,
    }))} />
  );
}
