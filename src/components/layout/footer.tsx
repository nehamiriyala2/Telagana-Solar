import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { site } from "@/config/site";
import { districts } from "@/data/districts";
import { pick } from "@/lib/utils";
import { Logo } from "./logo";
import { NAV, SOLUTIONS } from "./nav";

/** Deep blue footer (the only dark section): TELANGANA SOLAR wordmark, tagline, quick links, solutions, service areas and contact details. */
export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const head = "mb-5 font-body text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-gold-light";
  const link = "text-[#F1F4F8] transition-colors hover:text-white";
  const phone = site.phone ?? "+91 75699 54054";
  const email = site.email ?? "elevaitelabs@gmail.com";

  return (
    <footer className="border-t border-white/20 bg-primary-darkest pb-24 text-silver md:pb-0">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo variant="footer" />
          <p className="mt-6 font-heading text-[1.125rem] font-semibold text-white">{t("footer.tagline")}</p>
          <p className="mt-3 max-w-sm text-caption leading-relaxed text-silver/70">{t("footer.about")}</p>
        </div>

        <nav aria-label={t("footer.quickLinks")} className="lg:col-span-2">
          <h2 className={head}>{t("footer.quickLinks")}</h2>
          <ul className="space-y-3 text-caption">
            {NAV.filter((n) => n.key !== "solutions").map((n) => (
              <li key={n.key}><Link href={n.href} className={link}>{t(`nav.${n.key}`)}</Link></li>
            ))}
            <li><Link href="/schemes" className={link}>{t("nav.schemes")}</Link></li>
          </ul>
        </nav>

        <nav aria-label={t("footer.solutions")} className="lg:col-span-3">
          <h2 className={head}>{t("footer.solutions")}</h2>
          <ul className="space-y-3 text-caption">
            {SOLUTIONS.map((s) => <li key={s.key}><Link href={s.href} className={link}>{t(`nav.${s.key}`)}</Link></li>)}
          </ul>
          <h2 className={`${head} mt-10`}>{t("footer.areas")}</h2>
          <ul className="space-y-2.5 text-caption">
            {site.serviceAreas.map((slug) => {
              const d = districts.find((x) => x.slug === slug);
              return d ? <li key={slug}><Link href={`/solar-installation/${slug}`} className={link}>{pick(d.name, locale)}</Link></li> : null;
            })}
            <li className="text-silver/50">{t("footer.allTelangana")}</li>
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className={head}>{t("footer.contact")}</h2>
          <ul className="space-y-4 text-caption">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <span className="flex flex-wrap items-center gap-x-2 text-white">
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:underline" title="Call us">{phone}</a>
                <span aria-hidden className="text-silver/30">·</span>
                <a href="https://wa.me/917569954054" target="_blank" rel="noopener noreferrer" className="text-silver/80 hover:text-white hover:underline" title="Chat on WhatsApp">WhatsApp</a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <a href={`mailto:${email}`} className="break-all text-white hover:underline">{email}</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <span className="text-white">HITEC City, Hyderabad, Telangana, India</span>
            </li>
          </ul>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="mb-3 text-caption text-silver/60">{t("footer.follow")}</p>
            <a href="https://www.linkedin.com/company/elevaitelabs/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3.5 py-1.5 text-caption font-medium text-white transition-colors hover:border-gold hover:text-gold">
              LinkedIn<ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-[0.8125rem] text-silver/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <p className="flex gap-6"><Link href="/privacy" className="hover:text-white">{t("footer.privacy")}</Link><Link href="/terms" className="hover:text-white">{t("footer.terms")}</Link></p>
        </div>
      </div>
    </footer>
  );
}
