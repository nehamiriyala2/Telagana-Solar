import { useTranslations } from "next-intl";
import Image from "next/image";
import { UI_IMAGES } from "@/data/section-photos";

/**
 * Full-width blue band right under the hero: illustrated icons in white tiles, white text.
 * Uses ONLY claims that already exist in the site copy:
 * home subsidy up to ₹78,000 (as per current scheme), 25+ years of power, local team, all 33 districts.
 */
export function TrustStrip() {
  const t = useTranslations("trustStrip");
  const items = ["subsidy", "years", "local", "districts"] as const;
  return (
    <section aria-label={t("label")} className="relative bg-[linear-gradient(90deg,#1D4ED8,#2563EB)] text-white">
      <div className="container-page">
        <ul className="grid divide-y divide-white/15 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {items.map((key) => (
            <li key={key} className="flex items-center gap-4 py-5 sm:px-4 lg:px-6 lg:first:pl-0">
              <span aria-hidden className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_8px_20px_-8px_rgb(0_0_0/0.35)]">
                <Image src={UI_IMAGES.trust[key]} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="text-[1rem] font-semibold leading-snug text-white">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
