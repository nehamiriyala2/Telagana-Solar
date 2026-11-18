"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, ChevronDown, Home, Store, Wheat } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { WhatsAppButton } from "@/components/ui/contact-buttons";
import { GuideTrigger } from "@/components/tools/triggers";
import { SCHEME_ICONS } from "@/components/home/schemes-section";
import { SCHEMES } from "@/config/schemes";
import { Logo } from "./logo";
import { HEADER_NAV, SOLUTIONS } from "./nav";
import { cn } from "@/lib/utils";

const SOL_ICONS = { homes: Home, farms: Wheat, business: Store } as const;
const EASE = [0.22, 1, 0.36, 1] as const;
type MenuKey = "solutions" | "schemes";

/**
 * Global header.
 * - Sticky. Transparent at the top of the page, frosted glass + shadow after 40px.
 * - Hides while scrolling down, comes back on scroll up (never hides while a menu is open).
 * - Desktop: links with one gliding underline (follows hover, rests on the active page),
 *   Solutions + Schemes mega-menus (click/hover, Esc or outside click closes, focus returns to the button).
 * - Mobile: animated hamburger → X, full-screen overlay with staggered links.
 */
export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > prev && y > 160);
  });
  useEffect(() => { setScrolled(window.scrollY > 40); }, []);
  useEffect(() => { setOpen(false); setMenu(null); }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close mega-menus on outside click / Esc
  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => { if (!navRef.current?.contains(e.target as Node)) setMenu(null); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      document.getElementById(`menu-btn-${menu}`)?.focus();
      setMenu(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [menu]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const activeKey = HEADER_NAV.find((n) => isActive(n.match ?? n.href))?.key ?? null;
  const glideKey = hover ?? menu ?? activeKey;
  const solid = scrolled || open || menu !== null;

  return (
    <motion.header
      ref={navRef}
      animate={{ y: hidden && !open && !menu && !reduce ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500",
        solid ? "border-white/70 bg-white/80 shadow-header backdrop-blur-xl backdrop-saturate-150" : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page relative flex h-[var(--header-h)] items-center justify-between gap-3">
        <Link href="/" className="relative z-10 rounded-xl" aria-label="Telangana Solar home"><Logo priority /></Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center" onMouseLeave={() => setHover(null)}>
            {HEADER_NAV.map((n) => {
              const mega = n.key === "solutions" || n.key === "schemes" ? (n.key as MenuKey) : null;
              const on = glideKey === n.key;
              const base = cn("relative flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-caption font-semibold transition-colors duration-300 2xl:px-3",
                activeKey === n.key || menu === n.key ? "text-navy" : "text-muted hover:text-navy");
              const underline = on && <motion.span layoutId="nav-glide" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[linear-gradient(90deg,#FFC72C,#F5A800)]" />;
              return (
                <li key={n.key} onMouseEnter={() => { setHover(n.key); if (mega && menu) setMenu(mega); }}>
                  {mega ? (
                    <button id={`menu-btn-${mega}`} type="button" className={base} aria-expanded={menu === mega} aria-controls={`menu-${mega}`}
                      onClick={() => setMenu((m) => (m === mega ? null : mega))}>
                      {t(n.key)}<ChevronDown className={cn("size-4 transition-transform duration-300", menu === mega && "rotate-180")} aria-hidden />
                      {underline}
                    </button>
                  ) : (
                    <Link href={n.href} aria-current={activeKey === n.key ? "page" : undefined} className={base} onFocus={() => setHover(n.key)} onBlur={() => setHover(null)}>
                      {t(n.label ?? n.key)}{underline}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative z-10 flex items-center gap-2">
          <LanguageToggle />
          <WhatsAppButton place="header" size="icon" iconOnly className="hidden size-10 md:inline-flex" />
          <GuideTrigger size="sm" className="btn-shine hidden shadow-[0_8px_22px_-10px_rgb(245_168_0/0.9)] sm:inline-flex">{t("siteVisit")}</GuideTrigger>
          <button type="button" className="grid size-11 place-items-center rounded-full text-navy transition-colors hover:bg-navy/5 xl:hidden"
            aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t("close") : t("menu")} onClick={() => setOpen((o) => !o)}>
            <span aria-hidden className="relative block h-3.5 w-5">
              <motion.span className="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current" animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.3, ease: EASE }} />
              <motion.span className="absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-current" animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.4 : 1 }} transition={{ duration: 0.2 }} />
              <motion.span className="absolute left-0 top-3 h-0.5 w-5 rounded-full bg-current" animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.3, ease: EASE }} />
            </span>
          </button>
        </div>

        {/* Desktop mega-menus */}
        <AnimatePresence>
          {menu && (
            <motion.div key={menu} id={`menu-${menu}`} role="region" aria-label={t(menu)}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}
              className="absolute inset-x-4 top-full hidden pt-2 md:inset-x-8 xl:block"
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node) && !(e.relatedTarget as HTMLElement | null)?.id?.startsWith("menu-btn")) setMenu(null); }}>
              <div className="overflow-hidden rounded-[1.75rem] border border-line bg-white/95 p-3 shadow-[0_30px_80px_-30px_rgb(7_23_63/0.35)] backdrop-blur-xl">
                {menu === "solutions" ? <SolutionsPanel onPick={() => setMenu(null)} /> : <SchemesPanel onPick={() => setMenu(null)} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MobileMenu open={open} isActive={isActive} onClose={() => setOpen(false)} />
    </motion.header>
  );
}

function SolutionsPanel({ onPick }: { onPick: () => void }) {
  const t = useTranslations("nav");
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1.1fr]">
      {SOLUTIONS.map((s, i) => {
        const Icon = SOL_ICONS[s.key];
        return (
          <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}>
            <Link href={s.href} onClick={onPick} className="group flex h-full flex-col rounded-[1.25rem] p-5 transition-colors duration-300 hover:bg-[#F1F7FF]">
              <span className="icon-royal grid size-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:-translate-y-1"><Icon className="size-6" aria-hidden /></span>
              <span className="mt-4 font-heading text-[1.0625rem] font-bold text-navy">{t(s.key)}</span>
              <span className="mt-1 text-caption text-muted">{t(`${s.key}Desc`)}</span>
              <span className="mt-auto flex items-center gap-1 pt-4 text-caption font-semibold text-royal">{t("explore")}<ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden /></span>
            </Link>
          </motion.div>
        );
      })}
      <PromoCard />
    </div>
  );
}

function SchemesPanel({ onPick }: { onPick: () => void }) {
  const t = useTranslations();
  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-4">
        {SCHEMES.map((s, i) => {
          const Icon = SCHEME_ICONS[s.slug];
          return (
            <motion.div key={s.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.3, ease: EASE }}>
              <Link href={`/schemes/${s.slug}`} onClick={onPick} className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-[linear-gradient(180deg,#FFFFFF,#F7FBFF)] p-5 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_20px_40px_-26px_rgb(7_23_63/0.35)]">
                <span className="flex items-center justify-between gap-2">
                  <span className="icon-sun grid size-11 place-items-center rounded-2xl"><Icon className="size-5" aria-hidden /></span>
                  <span className="rounded-full bg-[#F1F7FF] px-2.5 py-1 text-[0.6875rem] font-bold text-royal">{t(`schemes.items.${s.slug}.tag`)}</span>
                </span>
                <span className="mt-4 font-heading font-bold leading-snug text-navy">{t(`schemes.items.${s.slug}.name`)}</span>
                <span className="mt-1 text-caption text-muted">{t(`schemes.items.${s.slug}.short`)}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-[#F1F7FF] px-5 py-3 text-caption">
        <p className="text-muted">{t("schemes.note")}</p>
        <div className="flex gap-4 font-semibold">
          <Link href="/schemes" onClick={onPick} className="flex items-center gap-1 text-royal hover:underline">{t("schemes.viewAll")}<ArrowRight className="size-4" aria-hidden /></Link>
          <Link href="/subsidy-loans" onClick={onPick} className="flex items-center gap-1 text-royal hover:underline">{t("nav.subsidy")}<ArrowRight className="size-4" aria-hidden /></Link>
        </div>
      </div>
    </div>
  );
}

function PromoCard() {
  const t = useTranslations("nav");
  return (
    <div className="bg-premium-sun relative flex flex-col justify-between overflow-hidden rounded-[1.25rem] p-5 ring-1 ring-gold/25">
      <div aria-hidden className="absolute -right-10 -top-10 size-32 rounded-full border-2 border-yellow/50 shadow-[0_0_40px_-8px_rgb(255_199_44/0.6)]" />
      <div className="relative">
        <p className="font-heading text-[1.0625rem] font-bold text-navy">{t("promoTitle")}</p>
        <p className="mt-1 text-caption text-muted">{t("promoBody")}</p>
      </div>
      <GuideTrigger size="sm" className="relative mt-4 self-start">{t("siteVisit")}<ArrowRight aria-hidden /></GuideTrigger>
    </div>
  );
}

/** Full-screen mobile menu with staggered links. */
function MobileMenu({ open, isActive, onClose }: { open: boolean; isActive: (href: string) => boolean; onClose: () => void }) {
  const t = useTranslations();
  const list = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const linkCls = (href: string) => cn("flex items-center justify-between rounded-2xl px-3 py-2.5 font-heading text-[1.75rem] font-extrabold tracking-[-0.03em] transition-colors sm:text-[2rem]", isActive(href) ? "text-navy" : "text-navy/80 hover:text-navy");
  if (!mounted) return null;
  // Portalled to <body>: the header moves (hide on scroll), which would trap a fixed overlay inside it.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div id="mobile-nav" role="dialog" aria-modal="true" aria-label={t("nav.menu")}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-[radial-gradient(ellipse_70%_40%_at_100%_0%,rgb(255_199_44/0.16),transparent_60%),linear-gradient(180deg,#FFFFFF,#F1F7FF)] xl:hidden" data-lenis-prevent>
          <nav aria-label="Mobile" className="container-page pb-36 pt-4">
            <motion.ul variants={list} initial="hidden" animate="show" className="flex flex-col">
              {HEADER_NAV.map((n) => (
                <motion.li key={n.key} variants={item} className="border-b border-navy/[0.06]">
                  {n.key === "solutions" || n.key === "schemes" ? (
                    <div className="py-2">
                      <Link href={n.href} onClick={onClose} className={linkCls(n.match ?? n.href)}>{t(`nav.${n.key}`)}<ArrowRight className="size-5 text-gold" aria-hidden /></Link>
                      <ul className="grid gap-1 pb-2 pl-3 sm:grid-cols-2">
                        {(n.key === "solutions"
                          ? SOLUTIONS.map((s) => ({ href: s.href, label: t(`nav.${s.key}`) }))
                          : [...SCHEMES.map((s) => ({ href: `/schemes/${s.slug}`, label: t(`schemes.items.${s.slug}.name`) })), { href: "/subsidy-loans", label: t("nav.subsidy") }]
                        ).map((s) => (
                          <li key={s.href}><Link href={s.href} onClick={onClose} className="block rounded-xl px-3 py-2 text-[0.9375rem] font-semibold text-muted hover:bg-white hover:text-navy">{s.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Link href={n.href} onClick={onClose} aria-current={isActive(n.href) ? "page" : undefined} className={cn(linkCls(n.href), "my-1")}>
                      {t(`nav.${n.label ?? n.key}`)}{isActive(n.href) && <span aria-hidden className="size-2.5 rounded-full bg-gold shadow-[0_0_10px_#FFC72C]" />}
                    </Link>
                  )}
                </motion.li>
              ))}
              <motion.li variants={item} className="mt-6 grid gap-3 sm:grid-cols-2">
                <GuideTrigger size="lg" className="w-full">{t("nav.siteVisit")}<ArrowRight aria-hidden /></GuideTrigger>
                <WhatsAppButton place="mobile-menu" size="lg" className="w-full" />
              </motion.li>
            </motion.ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** "EN | తెలుగు" pill toggle that keeps the current page; the active pill glides. */
function LanguageToggle() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const opts = [{ code: "en", label: "EN" }, { code: "te", label: "తెలుగు" }] as const;
  return (
    <div role="group" aria-label={t("languageLabel")} className="flex items-center rounded-full border border-line bg-white/90 p-0.5 text-caption font-semibold">
      {opts.map((o) => (
        <Link key={o.code} href={pathname} locale={o.code} lang={o.code} aria-current={locale === o.code ? "true" : undefined}
          className={cn("relative rounded-full px-2.5 py-1.5 transition-colors duration-300 sm:px-3", locale === o.code ? "text-navy" : "text-muted hover:text-navy")}>
          {locale === o.code && <motion.span layoutId="lang-pill" className="absolute inset-0 -z-0 rounded-full bg-[linear-gradient(135deg,#FFE9A8,#FFC72C)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative">{o.label}</span>
        </Link>
      ))}
    </div>
  );
}
