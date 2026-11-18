"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Home, Menu, Store, Wheat, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/ui/contact-buttons";
import { GuideTrigger } from "@/components/tools/triggers";
import { Logo } from "./logo";
import { NAV, SOLUTIONS } from "./nav";
import { cn } from "@/lib/utils";

const SOL_ICONS = { homes: Home, farms: Wheat, business: Store } as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur transition-shadow duration-500", scrolled || open ? "shadow-header" : "shadow-none")}>
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-3">
        <Link href="/" className="rounded-xl" aria-label="Telangana Solar home"><Logo priority /></Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center">
            {NAV.map((n) =>
              n.key === "solutions" ? (
                <li key={n.key}><SolutionsMenu active={isActive("/solutions")} /></li>
              ) : (
                <li key={n.key}>
                  <Link href={n.href} aria-current={isActive(n.href) ? "page" : undefined}
                    className={cn("relative block whitespace-nowrap rounded-full px-2.5 py-2 text-caption font-semibold transition-colors duration-300", isActive(n.href) ? "text-navy" : "text-muted hover:text-navy")}>
                    {t(n.key)}
                    {isActive(n.href) && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" />}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <WhatsAppButton place="header" size="sm" className="hidden md:inline-flex xl:hidden 2xl:inline-flex" />
          <WhatsAppButton place="header" size="icon" iconOnly className="hidden size-10 xl:inline-flex 2xl:hidden" />
          <GuideTrigger size="sm" className="hidden sm:inline-flex">{t("siteVisit")}</GuideTrigger>
          <Button variant="ghost" size="icon" className="xl:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t("close") : t("menu")} onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav id="mobile-nav" aria-label="Mobile" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "calc(100dvh - var(--header-h))" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-y-auto border-t border-line bg-white xl:hidden" data-lenis-prevent>
            <ul className="container-page flex flex-col gap-1 pb-32 pt-4">
              {NAV.map((n, i) =>
                n.key === "solutions" ? (
                  <motion.li key={n.key} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                    <p className="px-4 pb-1 pt-3 text-caption font-semibold uppercase tracking-wide text-sky-ink">{t("solutions")}</p>
                    <ul className="grid gap-1">
                      {SOLUTIONS.map((s) => {
                        const Icon = SOL_ICONS[s.key];
                        return (
                          <li key={s.key}>
                            <Link href={s.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-cream">
                              <span className="grid size-10 place-items-center rounded-xl bg-sky-tint text-sky-ink"><Icon className="size-5" aria-hidden /></span>
                              <span className="font-heading text-[1.0625rem] font-bold">{t(s.key)}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.li>
                ) : (
                  <motion.li key={n.key} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                    <Link href={n.href} className="block rounded-2xl px-4 py-3 font-heading text-h4 font-bold hover:bg-cream">{t(n.key)}</Link>
                  </motion.li>
                ),
              )}
              <li className="mt-4 grid gap-2 px-1 sm:hidden">
                <GuideTrigger size="lg" className="w-full">{t("siteVisit")}</GuideTrigger>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function SolutionsMenu({ active }: { active: boolean }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <div ref={ref} className="relative"
      onMouseEnter={() => { clearTimeout(closeTimer.current); setOpen(true); }}
      onMouseLeave={() => { closeTimer.current = setTimeout(() => setOpen(false), 150); }}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}
        className={cn("flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-caption font-semibold transition-colors", active || open ? "text-navy" : "text-muted hover:text-navy")}>
        {t("solutions")}<ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
            className="absolute left-1/2 top-full z-10 w-80 -translate-x-1/2 pt-3">
            <ul className="rounded-card border border-line bg-white p-2 shadow-lift">
              {SOLUTIONS.map((s) => {
                const Icon = SOL_ICONS[s.key];
                return (
                  <li key={s.key}>
                    <Link href={s.href} onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-cream">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-tint text-sky-ink"><Icon className="size-5" aria-hidden /></span>
                      <span>
                        <span className="block font-heading font-bold">{t(s.key)}</span>
                        <span className="block text-caption text-muted">{t(`${s.key}Desc`)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** "English | తెలుగు" segmented toggle that keeps the current page. */
function LanguageToggle() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const opts = [{ code: "en", label: "English", short: "EN" }, { code: "te", label: "తెలుగు", short: "తెలుగు" }] as const;
  return (
    <div role="group" aria-label={t("languageLabel")} className="flex items-center rounded-full border border-line bg-white p-0.5 text-caption font-semibold">
      {opts.map((o) => (
        <Link key={o.code} href={pathname} locale={o.code} lang={o.code} aria-current={locale === o.code ? "true" : undefined}
          className={cn("rounded-full px-2.5 py-1.5 transition-colors duration-300 sm:px-3", locale === o.code ? "bg-sky-tint text-sky-ink" : "text-muted hover:text-navy")}>
          <span className="2xl:hidden">{o.short}</span><span className="hidden 2xl:inline">{o.label}</span>
        </Link>
      ))}
    </div>
  );
}
