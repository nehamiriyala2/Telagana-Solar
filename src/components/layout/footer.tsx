import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { site } from "@/config/site";
import { districts } from "@/data/districts";
import { pick } from "@/lib/utils";
import { Logo } from "./logo";
import { NAV, SOLUTIONS } from "./nav";

const SOCIAL_LABELS: Record<keyof typeof site.social, string> = { facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", linkedin: "LinkedIn" };

/** Placeholder marker styled for the navy footer. */
function EditDark({ label = "[EDIT]" }: { label?: string }) {
  return <span className="rounded-md border border-dashed border-yellow/60 px-1.5 text-[0.75rem] font-semibold text-yellow">{label}</span>;
}

/** Deep-navy footer with the full logo, tagline and a faint Telangana map + Charminar watermark. */
export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const socials = (Object.keys(site.social) as (keyof typeof site.social)[]).filter((k) => site.social[k]);
  const head = "mb-4 font-heading text-caption font-bold uppercase tracking-wide text-yellow";

  return (
    <footer className="relative isolate overflow-hidden bg-navy-glow pb-24 text-silver md:pb-0">
      <Image src="/brand/outline-gold.webp" alt="" width={800} height={528} aria-hidden
        className="pointer-events-none absolute -right-24 top-6 -z-10 w-[640px] max-w-none opacity-[0.07] md:w-[760px]" />

      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo variant="footer" />
          <p className="mt-5 font-heading text-[1.0625rem] font-bold text-white">{t("footer.tagline")}</p>
          <p className="mt-3 max-w-sm text-caption text-silver/85">{t("footer.about")}</p>
          <p className="mt-6 text-caption font-semibold text-white">{t("footer.follow")}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {socials.length ? socials.map((k) => (
              <li key={k}><a href={site.social[k]!} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-3 py-1.5 text-caption text-white transition-colors hover:border-yellow hover:text-yellow">{SOCIAL_LABELS[k]}</a></li>
            )) : <li><EditDark label="[EDIT] social links" /></li>}
          </ul>
        </div>

        <nav aria-label={t("footer.quickLinks")} className="lg:col-span-2">
          <h2 className={head}>{t("footer.quickLinks")}</h2>
          <ul className="space-y-2.5 text-caption">
            {NAV.filter((n) => n.key !== "solutions").map((n) => (
              <li key={n.key}><Link href={n.href} className="text-silver/85 transition-colors hover:text-yellow">{t(`nav.${n.key}`)}</Link></li>
            ))}
            <li><Link href="/schemes" className="text-silver/85 transition-colors hover:text-yellow">{t("nav.schemes")}</Link></li>
          </ul>
        </nav>

        <nav aria-label={t("footer.solutions")} className="lg:col-span-2">
          <h2 className={head}>{t("footer.solutions")}</h2>
          <ul className="space-y-2.5 text-caption">
            {SOLUTIONS.map((s) => <li key={s.key}><Link href={s.href} className="text-silver/85 transition-colors hover:text-yellow">{t(`nav.${s.key}`)}</Link></li>)}
          </ul>
          <h2 className={`${head} mt-8`}>{t("footer.areas")}</h2>
          <ul className="space-y-2 text-caption">
            {site.serviceAreas.map((slug) => {
              const d = districts.find((x) => x.slug === slug);
              return d ? <li key={slug}><Link href={`/solar-installation/${slug}`} className="text-silver/85 transition-colors hover:text-yellow">{pick(d.name, locale)}</Link></li> : null;
            })}
            <li className="text-silver/70">{t("footer.allTelangana")}</li>
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className={head}>{t("footer.contact")}</h2>
          <ul className="space-y-3 text-caption">
            <li className="flex items-center gap-2"><Phone className="size-4 text-yellow" aria-hidden />{site.phone ? <a href={`tel:${site.phone}`} className="text-white hover:underline">{site.phone}</a> : <EditDark label="[EDIT] phone" />}</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-yellow" aria-hidden />{site.email ? <a href={`mailto:${site.email}`} className="text-white hover:underline">{site.email}</a> : <EditDark label="[EDIT] email" />}</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 text-yellow" aria-hidden />
              <span>{site.address.street ? <span className="text-white">{site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}</span> : <EditDark label="[EDIT] address" />}</span>
            </li>
          </ul>
          <h2 className={`${head} mt-8`}>{t("footer.districtsTitle")}</h2>
          <p className="text-caption leading-relaxed text-silver/70">
            {districts.map((d, i) => (
              <span key={d.slug}>{i > 0 && " · "}<Link href={`/solar-installation/${d.slug}`} className="hover:text-yellow">{pick(d.name, locale)}</Link></span>
            ))}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-caption text-silver/75 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <p className="flex gap-4"><Link href="/privacy" className="hover:text-yellow">{t("footer.privacy")}</Link><Link href="/terms" className="hover:text-yellow">{t("footer.terms")}</Link></p>
        </div>
      </div>
    </footer>
  );
}
