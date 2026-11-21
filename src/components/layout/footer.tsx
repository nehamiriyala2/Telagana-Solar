import { useLocale, useTranslations } from "next-intl";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { site } from "@/config/site";
import { districts } from "@/data/districts";
import { pick } from "@/lib/utils";
import { Logo } from "./logo";
import { NAV, SOLUTIONS } from "./nav";

/** Deep-navy footer with the full logo, tagline and contact details. */
export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const head = "mb-4 font-heading text-caption font-bold uppercase tracking-wide text-yellow";

  return (
    <footer className="relative isolate overflow-hidden bg-[#07173f] pb-24 text-silver md:pb-0">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo variant="footer" />
          <p className="mt-5 font-heading text-[1.0625rem] font-bold text-white">{t("footer.tagline")}</p>
          <p className="mt-3 max-w-sm text-caption text-silver/85">{t("footer.about")}</p>
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
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-yellow" aria-hidden />
              <div className="flex flex-wrap items-center gap-2 text-white">
                <a href={`tel:${(site.phone ?? "+91 75699 54054").replace(/\s+/g, "")}`} className="font-medium hover:text-yellow hover:underline transition-colors" title="Call us">
                  {site.phone ?? "+91 75699 54054"}
                </a>
                <span className="text-silver/40">|</span>
                <a href="https://wa.me/917569954054" target="_blank" rel="noopener noreferrer" className="font-medium text-[#25D366] hover:underline transition-colors" title="Chat on WhatsApp">
                  WhatsApp
                </a>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-yellow" aria-hidden />
              <a href={`mailto:${site.email ?? "elevaitelabs@gmail.com"}`} className="text-white hover:text-yellow hover:underline transition-colors">
                {site.email ?? "elevaitelabs@gmail.com"}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-yellow" aria-hidden />
              <span className="text-white">HITEC City, Hyderabad, Telangana, India</span>
            </li>
          </ul>

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-caption font-semibold text-white mb-2">{t("footer.follow")}</p>
            <a
              href="https://www.linkedin.com/company/elevaitelabs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-caption font-medium text-white transition-all hover:border-yellow hover:bg-white/10 hover:text-yellow"
            >
              <span>LinkedIn</span>
              <span aria-hidden className="text-[0.7rem] text-yellow">↗</span>
            </a>
          </div>
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
