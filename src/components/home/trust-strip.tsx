import { useTranslations } from "next-intl";
import { BadgeIndianRupee, MapPinned, SunMedium, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoTile } from "@/components/ui/photo-tile";

/**
 * Floating trust bar: a white card that overlaps the bottom of the hero by 40px.
 * 4 equal columns on desktop (thin dividers), 2×2 on tablet, stacked on mobile. Each item: a small photo
 * (icon fallback if the photo is missing), a bold short value and a one-line caption.
 * Uses ONLY claims already on the site (home subsidy up to ₹78,000 as per current scheme, 25+ years of power,
 * local team, all 33 districts).
 */
/** Dividers: stacked on mobile (top lines), 2×2 on tablet (top line on row 2), vertical lines on desktop. */
const BORDERS = ["lg:pl-0 xl:pl-0", "border-t sm:border-t-0 lg:border-l", "border-t lg:border-t-0 lg:border-l", "border-t lg:border-t-0 lg:border-l"];

/** `items` (value + caption per slot) come from Admin → Content → Home page; without them the messages are used. */
export function TrustStrip({ items: custom }: { items?: { value: string; caption: string }[] } = {}) {
  const t = useTranslations("trustStrip");
  const items = [
    { v: "v1", c: "c1", Icon: BadgeIndianRupee, tile: "bg-[#F1E7D2]" },
    { v: "v2", c: "c2", Icon: SunMedium, tile: "bg-white" },
    { v: "v3", c: "c3", Icon: UsersRound, tile: "bg-white" },
    { v: "v4", c: "c4", Icon: MapPinned, tile: "bg-white" },
  ] as const;
  return (
    <section aria-label={t("label")} className="relative z-10 -mt-10">
      <div className="container-page">
        <ul className="grid rounded-[20px] bg-[#EBE3D3] px-6 py-2 sm:grid-cols-2 md:px-8 lg:grid-cols-4 lg:py-6">
          {items.map(({ v, c, Icon, tile }, i) => (
            <li key={v} className={cn("flex min-h-[5rem] min-w-0 items-center gap-4 border-[#E2D8C3] py-4 lg:gap-3 lg:px-4 lg:py-0 xl:gap-4 xl:px-5", BORDERS[i])}>
              <PhotoTile src={`/images/ui/trust-strip/t${i + 1}.webp`} alt="" className={cn("h-16 w-20 shrink-0 overflow-hidden rounded-xl text-primary xl:h-20 xl:w-24", tile)} fallback={<Icon className="size-6" strokeWidth={1.75} aria-hidden />} />
              <span className="min-w-0">
                <span className="block font-heading text-[1.25rem] font-bold leading-tight text-[#0B1F3A] xl:text-[1.5rem]">{custom?.[i]?.value || t(v)}</span>
                <span className="block text-[0.875rem] leading-[1.375rem] text-[#5F6673]">{custom?.[i]?.caption || t(c)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
