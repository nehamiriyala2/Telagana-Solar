"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronRight, Home, Sparkles, Store, Wheat } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { WhatsAppButton } from "@/components/ui/contact-buttons";
import { GuideTrigger } from "@/components/tools/triggers";
import { SCHEME_ICONS } from "@/components/home/schemes-section";
import { SCHEMES } from "@/config/schemes";
import { Logo } from "./logo";
import { MENU_NAV, SOLUTIONS } from "./nav";
import { cn } from "@/lib/utils";

const SOL_ICONS = { homes: Home, farms: Wheat, business: Store } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Global header: white, subtle shadow, sticky. Desktop (lg, 1024px+): the main links in a row, Solutions/Schemes dropdowns.
 * Left: logo. Right: EN | తెలుగు toggle, WhatsApp (green circle), "Find My Solar Plan", hamburger.
 * Below 1024px the hamburger opens a full-width panel under the header:
 * Home, Solutions (+ submenu), Schemes (+ submenu), Subsidy & Loans, About Us, Contact Us.
 * Esc / outside click / route change closes it; focus moves into the panel and back to the button.
 */
export function Header() {
  const t = useTranslations("nav");
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
  // The hamburger panel is for phones/tablets only: close it if the window grows to desktop width.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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
    <header ref={headerRef} className={cn("fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-300", scrolled || open ? "shadow-header" : "shadow-[0_1px_0_rgb(7_23_63/0.06)]")}>
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-2 sm:gap-3">
        <Link href="/" className="shrink-0 rounded-xl" aria-label="Telangana Solar home"><Logo priority /></Link>

        <DesktopNav pathname={pathname} />

        <div className="flex items-center gap-1 min-[400px]:gap-1.5 sm:gap-2.5">
          <LanguageToggle />
          <WhatsAppButton place="header" size="icon" iconOnly className="size-9 shrink-0 rounded-full sm:size-10" />
          <GuideTrigger size="sm" className="btn-shine h-9 shrink-0 gap-1.5 px-2.5 shadow-[0_8px_22px_-10px_rgb(245_168_0/0.9)] sm:h-10 sm:px-4">
            <Sparkles className="hidden min-[400px]:block sm:hidden lg:block desk:hidden" aria-hidden /><span className="sm:hidden lg:inline desk:hidden">{t("planShort")}</span><span className="hidden sm:inline lg:hidden desk:inline">{t("siteVisit")}</span>
          </GuideTrigger>
          <button ref={btnRef} type="button" onClick={() => setOpen((o) => !o)}
            aria-expanded={open} aria-controls="site-menu" aria-label={open ? t("close") : t("menu")}
            className={cn("grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 sm:size-10 lg:hidden", open ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/30")}>
            <span aria-hidden className="relative block h-3 w-[18px]">
              <motion.span className="absolute left-0 top-0 h-0.5 w-full rounded-full bg-current" animate={open ? { y: 5, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.3, ease: EASE }} />
              <motion.span className="absolute left-0 top-[5px] h-0.5 w-full rounded-full bg-current" animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.15 }} />
              <motion.span className="absolute left-0 top-[10px] h-0.5 w-full rounded-full bg-current" animate={open ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.3, ease: EASE }} />
            </span>
          </button>
        </div>
      </div>

      <MenuPanel open={open} pathname={pathname} onClose={() => setOpen(false)} />
    </header>
  );
}

/**
 * Desktop (1024px+): the six main links in a row (compact sizes until 1280px). Solutions and Schemes link to their overview pages,
 * with a chevron button that opens a small dropdown (hover or click; Esc / outside click closes).
 * One gold underline glides to the hovered link and rests on the current page.
 */
function DesktopNav({ pathname }: { pathname: string }) {
  const t = useTranslations();
  const [drop, setDrop] = useState<"solutions" | "schemes" | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const activeKey = MENU_NAV.find((n) => isActive(n.href))?.key ?? null;
  const glide = hover ?? drop ?? activeKey;

  useEffect(() => setDrop(null), [pathname]);
  useEffect(() => {
    if (!drop) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { document.getElementById(`drop-btn-${drop}`)?.focus(); setDrop(null); } };
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setDrop(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDoc); };
  }, [drop]);

  const subItems = (key: "solutions" | "schemes") => key === "solutions"
    ? SOLUTIONS.map((s) => ({ href: s.href, label: t(`nav.${s.key}`), desc: t(`nav.${s.key}Desc`), Icon: SOL_ICONS[s.key], tone: "icon-royal" }))
    : SCHEMES.map((s) => ({ href: `/schemes/${s.slug}`, label: t(`schemes.items.${s.slug}.name`), desc: t(`schemes.items.${s.slug}.tag`), Icon: SCHEME_ICONS[s.slug], tone: "icon-sun" }));

  return (
    <nav ref={ref} aria-label="Main" className="hidden min-w-0 flex-1 justify-center lg:flex">
      <ul className="flex items-center" onMouseLeave={() => setHover(null)}>
        {MENU_NAV.map((n) => {
          const sub = n.key === "solutions" || n.key === "schemes" ? (n.key as "solutions" | "schemes") : null;
          const on = activeKey === n.key;
          const underline = glide === n.key && (
            <motion.span layoutId="nav-glide" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-[linear-gradient(90deg,#FFC72C,#F5A800)]" />
          );
          return (
            <li key={n.key} className="relative"
              onMouseEnter={() => { setHover(n.key); clearTimeout(timer.current); if (sub) setDrop(sub); }}
              onMouseLeave={() => { if (sub) timer.current = setTimeout(() => setDrop((d) => (d === sub ? null : d)), 160); }}>
              <div className="flex items-center">
                <Link href={n.href} aria-current={on ? "page" : undefined}
                  className={cn("relative whitespace-nowrap rounded-full px-1.5 py-2 text-[0.875rem] font-semibold transition-colors duration-300 xl:px-2.5 xl:text-[0.9375rem] 2xl:px-3.5", on || (sub && drop === sub) ? "text-navy" : "text-muted hover:text-navy")}>
                  {t(`nav.${n.label ?? n.key}`)}{underline}
                </Link>
                {sub && (
                  <button id={`drop-btn-${sub}`} type="button" aria-expanded={drop === sub} aria-controls={`drop-${sub}`} aria-label={t(`nav.${sub}`)}
                    onClick={() => setDrop((d) => (d === sub ? null : sub))}
                    className="-ml-1.5 grid size-6 place-items-center rounded-full text-muted transition-colors hover:text-navy xl:-ml-2 xl:size-7">
                    <ChevronDown className={cn("size-4 transition-transform duration-300", drop === sub && "rotate-180")} aria-hidden />
                  </button>
                )}
              </div>
              {sub && (
                <AnimatePresence>
                  {drop === sub && (
                    <motion.div id={`drop-${sub}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22, ease: EASE }}
                      className="absolute left-1/2 top-full z-10 w-[22rem] -translate-x-1/2 pt-3">
                      <ul className="rounded-[1.25rem] border border-line bg-white p-2 shadow-[0_24px_60px_-24px_rgb(7_23_63/0.35)]">
                        {subItems(sub).map(({ href, label, desc, Icon, tone }) => (
                          <li key={href}>
                            <Link href={href} onClick={() => setDrop(null)} aria-current={isActive(href) ? "page" : undefined}
                              className={cn("flex items-center gap-3 rounded-xl p-2.5 transition-colors", isActive(href) ? "bg-[#FFF3D1]" : "hover:bg-[#F1F7FF]")}>
                              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone)}><Icon className="size-5" aria-hidden /></span>
                              <span className="min-w-0">
                                <span className="block font-heading text-[0.9375rem] font-bold leading-snug text-navy">{label}</span>
                                <span className="block text-caption text-muted">{desc}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                        <li className="mt-1 border-t border-line pt-1">
                          <Link href={n.href} onClick={() => setDrop(null)} className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-caption font-semibold text-royal hover:bg-[#F1F7FF]">
                            {sub === "schemes" ? t("schemes.viewAll") : `${t("nav.explore")}: ${t("nav.solutions")}`}<ArrowRight className="size-4" aria-hidden />
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

/** Phones/tablets: full-width dropdown panel under the header. */
function MenuPanel({ open, pathname, onClose }: { open: boolean; pathname: string; onClose: () => void }) {
  const t = useTranslations();
  const reduce = useReducedMotion();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const item = { hidden: { opacity: 0, y: reduce ? 0 : 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } } };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dim the page behind the panel */}
          <motion.div aria-hidden className="fixed inset-x-0 bottom-0 top-[var(--header-h)] -z-10 bg-navy/25 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} />
          <motion.nav id="site-menu" aria-label="Mobile"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-h))] overflow-y-auto lg:hidden border-t border-line bg-white shadow-[0_30px_60px_-30px_rgb(7_23_63/0.4)]" data-lenis-prevent>
            <motion.div className="container-page grid gap-6 py-6 md:py-8 lg:grid-cols-12 lg:gap-8"
              initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}>
              {/* Main links */}
              <motion.ul variants={item} className="grid content-start gap-1 lg:col-span-3">
                {MENU_NAV.map((n) => (
                  <li key={n.key}>
                    <Link href={n.href} onClick={onClose} aria-current={isActive(n.href) ? "page" : undefined}
                      className={cn("group flex items-center justify-between rounded-xl px-3 py-2.5 font-heading text-[1.125rem] font-bold transition-colors",
                        isActive(n.href) ? "bg-[#FFF3D1] text-navy" : "text-navy hover:bg-[#F1F7FF]")}>
                      {t(`nav.${n.label ?? n.key}`)}
                      <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </motion.ul>

              {/* Solutions submenu */}
              <motion.section variants={item} aria-labelledby="menu-solutions" className="lg:col-span-4">
                <Link id="menu-solutions" href="/solutions" onClick={onClose} className="mb-2 inline-flex items-center gap-1 px-1 text-caption font-bold uppercase tracking-[0.08em] text-royal hover:underline">
                  {t("nav.solutions")}<ArrowRight className="size-3.5" aria-hidden />
                </Link>
                <ul className="grid gap-2">
                  {SOLUTIONS.map((s) => {
                    const Icon = SOL_ICONS[s.key];
                    return (
                      <li key={s.key}>
                        <Link href={s.href} onClick={onClose} aria-current={isActive(s.href) ? "page" : undefined}
                          className={cn("flex items-center gap-3 rounded-2xl border p-3 transition-colors", isActive(s.href) ? "border-gold/60 bg-[#FFFBF2]" : "border-line hover:border-royal/30 hover:bg-[#F7FBFF]")}>
                          <span className="icon-royal grid size-10 shrink-0 place-items-center rounded-xl"><Icon className="size-5" aria-hidden /></span>
                          <span className="min-w-0">
                            <span className="block font-heading font-bold text-navy">{t(`nav.${s.key}`)}</span>
                            <span className="block text-caption text-muted">{t(`nav.${s.key}Desc`)}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>

              {/* Schemes submenu */}
              <motion.section variants={item} aria-labelledby="menu-schemes" className="lg:col-span-5">
                <Link id="menu-schemes" href="/schemes" onClick={onClose} className="mb-2 inline-flex items-center gap-1 px-1 text-caption font-bold uppercase tracking-[0.08em] text-royal hover:underline">
                  {t("nav.schemes")}<ArrowRight className="size-3.5" aria-hidden />
                </Link>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {SCHEMES.map((s) => {
                    const Icon = SCHEME_ICONS[s.slug];
                    const href = `/schemes/${s.slug}`;
                    return (
                      <li key={s.slug}>
                        <Link href={href} onClick={onClose} aria-current={isActive(href) ? "page" : undefined}
                          className={cn("flex h-full items-start gap-3 rounded-2xl border p-3 transition-colors", isActive(href) ? "border-gold/60 bg-[#FFFBF2]" : "border-line hover:border-gold/50 hover:bg-[#FFFBF2]")}>
                          <span className="icon-sun grid size-10 shrink-0 place-items-center rounded-xl"><Icon className="size-5" aria-hidden /></span>
                          <span className="min-w-0">
                            <span className="block font-heading text-[0.9375rem] font-bold leading-snug text-navy">{t(`schemes.items.${s.slug}.name`)}</span>
                            <span className="block text-[0.75rem] font-semibold text-royal">{t(`schemes.items.${s.slug}.tag`)}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>
            </motion.div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

/** "EN | తెలుగు" pill toggle that keeps the current page. */
function LanguageToggle() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const opts = [{ code: "en", label: "EN" }, { code: "te", label: "తెలుగు" }] as const;
  return (
    <div role="group" aria-label={t("languageLabel")} className="flex shrink-0 items-center rounded-full border border-line bg-white p-0.5 text-[0.75rem] font-semibold sm:text-caption">
      {opts.map((o) => (
        <Link key={o.code} href={pathname} locale={o.code} lang={o.code} aria-current={locale === o.code ? "true" : undefined}
          className={cn("relative rounded-full px-1.5 py-1.5 transition-colors duration-300 min-[400px]:px-2 sm:px-3", locale === o.code ? "text-navy" : "text-muted hover:text-navy")}>
          {locale === o.code && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#FFE9A8,#FFC72C)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative">{o.label}</span>
        </Link>
      ))}
    </div>
  );
}
