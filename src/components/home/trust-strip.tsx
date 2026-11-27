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
    <section aria-label={t("label")} className="bg-cloud pt-10 md:pt-12">
      <div className="container-page">
        <ul className="grid gap-y-2 rounded-[1.25rem] bg-mist px-5 py-2 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-primary/15">
          {items.map((key) => (
            <li key={key} className="flex items-center gap-4 py-5 sm:px-4 lg:px-6 lg:first:pl-0">
              <span aria-hidden className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white">
                <Image src={UI_IMAGES.trust[key]} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <span className="text-[0.9375rem] font-semibold leading-snug text-primary-hover">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
