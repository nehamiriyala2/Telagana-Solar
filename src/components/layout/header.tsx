"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { GuideTrigger } from "@/components/tools/triggers";
import { WhatsAppButton } from "@/components/ui/contact-buttons";
import { SCHEMES } from "@/config/schemes";
import { site } from "@/config/site";
import { Logo } from "./logo";
import { HEADER_NAV, SOLUTIONS, type HeaderNavItem } from "./nav";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Global header: ivory with a subtle bottom border; sticky, with a light blur once the page scrolls.
 * Left: logo. Right (1200px+): Home, Solutions ▾, Schemes ▾, Subsidy & Loans, About Us, Contact Us,
 * the EN | తెలుగు pill and "Find My Solar Plan" (navy button, thin gold border; opens the plan finder).
 * Below 1024px (1440px in Telugu, whose labels are longer) a menu button opens a full-width panel with every link and each sub-page.
 * Esc / outside click / route change closes menus; focus moves into the panel and back to the button.
 */
export function Header() {
  const t = useTranslations("nav");
  // Full desktop row from 1024px; Telugu labels are longer, so 1440px there. No overlaps at any width.
  const te = useLocale() === "te";
  const wide = te ? 1440 : 1024;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${wide}px)`);
    const onChange = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [wide]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); } };
    const onDoc = (e: MouseEvent) => { if (!headerRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    const id = setTimeout(() => headerRef.current?.querySelector<HTMLElement>("#site-menu a")?.focus(), 120);
    return () => {
      clearTimeout(id);
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  return (
    <header ref={headerRef} className={cn("fixed inset-x-0 top-0 z-50 border-b border-line transition-[background-color,box-shadow] duration-300",
      scrolled || open ? "bg-cloud/85 shadow-header backdrop-blur-md" : "bg-cloud")}>
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4 xl:max-w-[85rem] xl:gap-5">
        <Link href="/" className="shrink-0 rounded-xl" aria-label="Telangana Solar home"><Logo priority /></Link>

        <DesktopNav pathname={pathname} te={te} />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <GuideTrigger size="sm" className="hidden h-10 shrink-0 px-4 sm:inline-flex"><span className="xl:hidden">{t("planShort")}</span><span className="hidden xl:inline">{t("siteVisit")}</span></GuideTrigger>
          <button ref={btnRef} type="button" onClick={() => setOpen((o) => !o)}
            aria-expanded={open} aria-controls="site-menu" aria-label={open ? t("close") : t("menu")}
            className={cn("grid size-10 shrink-0 place-items-center rounded-full border transition-colors duration-300", te ? "min-[1440px]:hidden" : "lg:hidden", open ? "border-primary bg-primary text-card" : "border-line bg-card text-ink hover:border-gold")}>
            <span aria-hidden className="relative block h-3 w-[18px]">
              <motion.span className="absolute left-0 top-0 h-0.5 w-full rounded-full bg-current" animate={open ? { y: 5, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.3, ease: EASE }} />
              <motion.span className="absolute left-0 top-[5px] h-0.5 w-full rounded-full bg-current" animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.15 }} />
              <motion.span className="absolute left-0 top-[10px] h-0.5 w-full rounded-full bg-current" animate={open ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.3, ease: EASE }} />
            </span>
          </button>
        </div>
      </div>

      <MenuPanel open={open} pathname={pathname} te={te} onClose={() => setOpen(false)} />
    </header>
  );
}

type DropKey = "solutions" | "schemes";

/** Sub-links for the two dropdowns (Solutions → homes / farms / business / projects, Schemes → each scheme). */
function useSubItems() {
  const t = useTranslations();
  return (key: DropKey) => key === "solutions"
    ? [
        ...SOLUTIONS.map((s) => ({ href: s.href, label: t(`nav.${s.key}`), desc: t(`nav.${s.key}Desc`) })),
        { href: "/projects", label: t("nav.projects"), desc: "" },
      ]
    : SCHEMES.map((s) => ({ href: `/schemes/${s.slug}`, label: t(`schemes.items.${s.slug}.name`), desc: t(`schemes.items.${s.slug}.tag`) }));
}

/** Desktop (1200px+): the six links in a row, two with dropdowns (hover or click; Esc / outside click closes). */
function DesktopNav({ pathname, te }: { pathname: string; te: boolean }) {
  const t = useTranslations();
  const subItems = useSubItems();
  const [drop, setDrop] = useState<DropKey | null>(null);
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isActive = (n: HeaderNavItem) => n.match.some((h) => (h === "/" ? pathname === "/" : pathname.startsWith(h)));

  useEffect(() => setDrop(null), [pathname]);
  useEffect(() => {
    if (!drop) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { document.getElementById(`drop-btn-${drop}`)?.focus(); setDrop(null); } };
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setDrop(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDoc); };
  }, [drop]);

  return (
    <nav ref={ref} aria-label="Main" className={cn("hidden min-w-0 flex-1 justify-center", te ? "min-[1440px]:flex" : "lg:flex")}>
      <ul className="flex items-center">
        {HEADER_NAV.map((n) => {
          const sub = n.drop ?? null;
          const on = isActive(n);
          return (
            <li key={n.key} className="relative"
              onMouseEnter={() => { clearTimeout(timer.current); if (sub) setDrop(sub); }}
              onMouseLeave={() => { if (sub) timer.current = setTimeout(() => setDrop((d) => (d === sub ? null : d)), 160); }}>
              <div className="flex items-center">
                <Link href={n.href} aria-current={on ? "page" : undefined}
                  className={cn("relative whitespace-nowrap px-2 py-2 text-[0.875rem] font-medium transition-colors duration-300 xl:px-3 xl:text-[0.9375rem]", on || (sub && drop === sub) ? "text-primary" : "text-ink hover:text-primary")}>
                  {t(`nav.${n.label}`)}
                  <span aria-hidden className={cn("absolute inset-x-2 -bottom-0.5 h-0.5 origin-left rounded-full bg-gold xl:inset-x-3 transition-transform duration-300", on ? "scale-x-100" : "scale-x-0")} />
                </Link>
                {sub && (
                  <button id={`drop-btn-${sub}`} type="button" aria-expanded={drop === sub} aria-controls={`drop-${sub}`} aria-label={t(`nav.${n.label}`)}
                    onClick={() => setDrop((d) => (d === sub ? null : sub))}
                    className="-ml-1.5 grid size-6 place-items-center rounded-full text-muted transition-colors hover:text-primary xl:-ml-2">
                    <ChevronDown className={cn("size-3.5 transition-transform duration-300", drop === sub && "rotate-180")} aria-hidden />
                  </button>
                )}
              </div>
              {sub && (
                <AnimatePresence>
                  {drop === sub && (
                    <motion.div id={`drop-${sub}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2, ease: EASE }}
                      className="absolute left-1/2 top-full z-10 w-[21rem] -translate-x-1/2 pt-3">
                      <ul className="rounded-2xl border border-line bg-card p-2 shadow-[0_24px_50px_-28px_rgb(27_69_112/0.45)]">
                        {subItems(sub).map(({ href, label, desc }) => {
                          const here = pathname === href || pathname.startsWith(`${href}/`);
                          return (
                            <li key={href}>
                              <Link href={href} onClick={() => setDrop(null)} aria-current={here ? "page" : undefined}
                                className={cn("block rounded-xl px-3 py-2.5 transition-colors", here ? "bg-mist" : "hover:bg-cloud")}>
                                <span className="block font-heading text-[1rem] font-semibold text-ink">{label}</span>
                                {desc && <span className="block text-[0.8125rem] text-muted">{desc}</span>}
                              </Link>
                            </li>
                          );
                        })}
                        <li className="mt-1 border-t border-line pt-1">
                          <Link href={n.href} onClick={() => setDrop(null)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[0.8125rem] font-semibold text-gold-text hover:bg-cloud">
                            {sub === "solutions" ? `${t("nav.explore")}: ${t("nav.solutions")}` : t("schemes.viewAll")}<ArrowRight className="size-3.5" aria-hidden />
                          </Link>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Below 1200px: full-width ivory panel under the header with every link. */
function MenuPanel({ open, pathname, te, onClose }: { open: boolean; pathname: string; te: boolean; onClose: () => void }) {
  const t = useTranslations();
  const subItems = useSubItems();
  const reduce = useReducedMotion();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const phone = site.phone ?? "+91 75699 54054";

  const group = (title: string, href: string, items: { href: string; label: string }[]) => (
    <section aria-label={title}>
      <Link href={href} onClick={onClose} className="eyebrow mb-3 hover:underline">{title}</Link>
      <ul className="grid gap-1">
        {items.map((s) => (
          <li key={s.href}>
            <Link href={s.href} onClick={onClose} aria-current={isActive(s.href) ? "page" : undefined}
              className={cn("block rounded-xl border px-3 py-2.5 text-[0.9375rem] transition-colors", isActive(s.href) ? "border-gold/60 bg-mist text-ink" : "border-line bg-card text-body hover:border-gold/60 hover:text-ink")}>
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div aria-hidden className={cn("fixed inset-x-0 bottom-0 top-[var(--header-h)] -z-10 bg-cloud/70 backdrop-blur-sm", te ? "min-[1440px]:hidden" : "lg:hidden")}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} />
          <motion.nav id="site-menu" aria-label="Mobile"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE }}
            className={cn("absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-line bg-cloud shadow-[0_30px_60px_-30px_rgb(27_69_112/0.45)]", te ? "min-[1440px]:hidden" : "lg:hidden")} data-lenis-prevent>
            <div className="container-page grid gap-8 py-8 md:grid-cols-12">
              <ul className="grid content-start md:col-span-4">
                {HEADER_NAV.map((n) => (
                  <li key={n.key} className="border-b border-line">
                    <Link href={n.href} onClick={onClose} aria-current={isActive(n.href) ? "page" : undefined}
                      className="flex items-center justify-between py-3 font-heading text-[1.25rem] font-semibold text-ink">
                      {t(`nav.${n.label}`)}
                      {isActive(n.href) && <span aria-hidden className="h-px w-6 bg-gold" />}
                    </Link>
                  </li>
                ))}
                <li className="border-b border-line">
                  <Link href="/savings-calculator" onClick={onClose} className="block py-3 font-heading text-[1.25rem] font-semibold text-ink">{t("nav.calculator")}</Link>
                </li>
              </ul>
              <div className="md:col-span-4">{group(t("nav.solutions"), "/solutions", subItems("solutions"))}</div>
              <div className="md:col-span-4">{group(t("nav.schemes"), "/schemes", subItems("schemes"))}</div>
              <div className="grid gap-3 border-t border-line pt-6 sm:grid-cols-3 md:col-span-12">
                <GuideTrigger size="md" className="w-full">{t("nav.siteVisit")}<ArrowRight aria-hidden /></GuideTrigger>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary/25 bg-card px-6 font-semibold text-ink hover:border-gold">
                  <Phone className="size-4" aria-hidden />{phone}
                </a>
                <WhatsAppButton place="menu" className="w-full" />
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

/** "EN | తెలుగు" small pill toggle that keeps the current page. */
function LanguageToggle() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const opts = [{ code: "en", label: "EN" }, { code: "te", label: "తెలుగు" }] as const;
  return (
    <div role="group" aria-label={t("languageLabel")} className="flex shrink-0 items-center rounded-full border border-line bg-mist p-0.5 text-[0.75rem] font-semibold">
      {opts.map((o) => (
        <Link key={o.code} href={pathname} locale={o.code} lang={o.code} aria-current={locale === o.code ? "true" : undefined}
          className={cn("relative rounded-full px-2.5 py-1 transition-colors duration-300", locale === o.code ? "text-card" : "text-body hover:text-primary")}>
          {locale === o.code && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative">{o.label}</span>
        </Link>
      ))}
    </div>
  );
}
