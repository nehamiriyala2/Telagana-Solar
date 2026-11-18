"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Moon, Sun, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { NAV } from "./nav";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
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

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500", scrolled || open ? "glass shadow-soft" : "bg-transparent")}>
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" className="shrink-0 rounded-lg" aria-label="Telangana Solar home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined}
                    className={cn("relative whitespace-nowrap rounded-full px-3 py-2 text-caption font-medium transition-colors duration-300", active ? "text-fg" : "text-muted hover:text-fg")}>
                    {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-fg/[0.07]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <span className="relative">{t(n.key)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageToggle label={t("languageLabel")} text={t("language")} locale={locale} />
          <ThemeToggle label={t("themeLabel")} />
          <Magnetic className="hidden md:inline-block xl:hidden 2xl:inline-block">
            <Button asChild size="sm" className="h-10"><Link href="/finder">{t("getStarted")}</Link></Button>
          </Magnetic>
          <Button variant="ghost" size="icon" className="xl:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t("close") : t("menu")} onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav id="mobile-nav" aria-label="Mobile" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden xl:hidden">
            <ul className="container-page flex flex-col gap-1 pb-6 pt-2">
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, duration: 0.35 }}>
                  <Link href={n.href} className="block rounded-2xl px-4 py-3 font-heading text-h4 font-bold hover:bg-fg/5">{t(n.key)}</Link>
                </motion.li>
              ))}
              <li className="mt-3 px-1"><Button asChild className="w-full"><Link href="/finder">{t("getStarted")}</Link></Button></li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function LanguageToggle({ label, text, locale }: { label: string; text: string; locale: string }) {
  const pathname = usePathname();
  const other = locale === "en" ? "te" : "en";
  return (
    <Link href={pathname} locale={other} aria-label={label} lang={other}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-3 text-caption font-medium transition-colors duration-300 hover:bg-fg/5">
      <Languages className="size-4" aria-hidden />
      <span className="sm:hidden">{other === "te" ? "తె" : "EN"}</span>
      <span className="hidden sm:inline">{text}</span>
    </Link>
  );
}

function ThemeToggle({ label }: { label: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <Button variant="ghost" size="icon" aria-label={label} aria-pressed={dark} onClick={toggle} className="relative size-10 overflow-hidden">
      {/* Icons follow the html.dark class directly, so they are correct on first paint */}
      <Sun className="!size-5 transition-all duration-500 ease-out-soft dark:-rotate-90 dark:scale-0 dark:opacity-0" aria-hidden />
      <Moon className="absolute !size-5 rotate-90 scale-0 opacity-0 transition-all duration-500 ease-out-soft dark:rotate-0 dark:scale-100 dark:opacity-100" aria-hidden />
    </Button>
  );
}
