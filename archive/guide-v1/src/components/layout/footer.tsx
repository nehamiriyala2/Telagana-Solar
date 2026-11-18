import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./logo";
import { NAV } from "./nav";

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="mt-16 border-t border-line bg-surface-2/50">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-4 max-w-sm text-muted">{t("footer.tagline")}</p>
        </div>
        <nav aria-label={t("footer.explore")} className="md:col-span-3">
          <p className="eyebrow mb-4">{t("footer.explore")}</p>
          <ul className="space-y-2.5">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="text-muted transition-colors hover:text-fg">{t(`nav.${n.key}`)}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="rounded-2xl border border-line bg-surface p-5 text-caption text-muted">{t("common.disclaimer")}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-6 text-caption text-muted">{t("footer.rights", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
