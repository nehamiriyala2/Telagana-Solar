import { useTranslations } from "next-intl";
import { BadgeIndianRupee, MapPinned, SunMedium, UsersRound } from "lucide-react";

/**
 * Full-width blue band right under the hero (white text, white icons in tinted circles). Uses ONLY claims that already exist in the site copy:
 * home subsidy up to ₹78,000 (as per current scheme), 25+ years of power, local team, all 33 districts.
 */
export function TrustStrip() {
  const t = useTranslations("trustStrip");
  const items = [
    { key: "subsidy", Icon: BadgeIndianRupee, tile: "bg-green/30" },
    { key: "years", Icon: SunMedium, tile: "bg-sun/25" },
    { key: "local", Icon: UsersRound, tile: "bg-white/15" },
    { key: "districts", Icon: MapPinned, tile: "bg-white/15" },
  ] as const;
  return (
    <section aria-label={t("label")} className="relative bg-primary text-white">
      <div className="container-page">
        <ul className="grid divide-y divide-white/15 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {items.map(({ key, Icon, tile }) => (
            <li key={key} className="flex items-center gap-3.5 py-5 sm:px-4 lg:px-6 lg:first:pl-0">
              <span aria-hidden className={`grid size-11 shrink-0 place-items-center rounded-full ring-1 ring-white/25 ${tile}`}><Icon className="size-5 text-white" /></span>
              <span className="text-[0.9375rem] font-semibold leading-snug text-white">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
