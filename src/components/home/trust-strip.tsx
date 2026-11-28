import { useTranslations } from "next-intl";
import { BadgeIndianRupee, MapPinned, SunMedium, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoTile } from "@/components/ui/photo-tile";
import { ReplayOnView } from "@/components/motion/replay-on-view";

/**
 * Trust bar under the home hero: a distinct warm-white card that overlaps the bottom of the hero by ~35–40% of its
 * height (one negative top margin on the card). The section carries the same sand background as the next section, so
 * there is no stray band behind the card. Uses ONLY claims already on the site (home subsidy up to ₹78,000 as per
 * current scheme, 25+ years of power, local team, all 33 districts).
 * Layout: 4 equal columns on desktop (vertical dividers at 60% height), 2×2 on tablet (a horizontal divider between
 * the rows), one column on phones. Every description reserves two lines, so all items are the same height and the
 * four titles share one baseline.
 * Motion: the card fades up and the items follow left → right (CSS; see .tb-* in src/app/motion.css).
 */

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
    <section aria-label={t("label")} className="relative z-10 flow-root bg-mist">
      <div className="container-page">
        <ReplayOnView className="tb-wrap">
          <ul className="tb-card -mt-8 grid rounded-3xl border border-[#E8DFC9] bg-[#FFFDF8] px-5 py-2 shadow-[0_1px_2px_rgb(11_31_58/0.06),0_10px_24px_-12px_rgb(11_31_58/0.18),0_28px_56px_-28px_rgb(11_31_58/0.22)] sm:px-6 md:-mt-20 md:grid-cols-2 md:py-4 lg:-mt-12 lg:grid-cols-4 lg:px-8 lg:py-7">
            {items.map(({ v, c, Icon, tile }, i) => (
              <li key={v} style={{ animationDelay: `${0.15 + i * 0.09}s` }}
                className="tb-item group relative flex min-h-[72px] min-w-0 items-center gap-4 py-4 md:px-4 lg:px-6 lg:py-0 lg:first:pl-0 lg:last:pr-0">
                {/* dividers: phones = line above every item but the first; tablet = line above the second row;
                    desktop = vertical line at 60% height before every item but the first */}
                {i > 0 && <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[#E8DFC9] md:hidden" />}
                {i > 1 && <span aria-hidden className="absolute inset-x-4 top-0 hidden h-px bg-[#E8DFC9] md:block lg:hidden" />}
                {i > 0 && <span aria-hidden className="absolute left-0 top-[20%] hidden h-[60%] w-px bg-[#E8DFC9] lg:block" />}
                <PhotoTile src={`/images/ui/trust-strip/t${i + 1}.webp`} alt=""
                  className={cn("size-14 shrink-0 overflow-hidden rounded-2xl text-primary lg:size-[72px] [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-out group-hover:[&_img]:scale-[1.04]", tile)}
                  fallback={<Icon className="size-6" strokeWidth={1.75} aria-hidden />} />
                <span className="min-w-0">
                  <span className="block font-heading text-[1.125rem] font-bold leading-snug text-[#0B1F3A]">{custom?.[i]?.value || t(v)}</span>
                  <span className="mt-0.5 line-clamp-2 block min-h-[2.8em] max-w-[11rem] text-[0.875rem] leading-[1.4] text-[#5F6673]">{custom?.[i]?.caption || t(c)}</span>
                </span>
              </li>
            ))}
          </ul>
        </ReplayOnView>
      </div>
    </section>
  );
}
