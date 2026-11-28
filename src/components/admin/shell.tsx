"use client";

import { LogoMark } from "@/components/layout/logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3, BellRing, Calculator, ChevronDown, ChevronRight, ClipboardList, ExternalLink, FileText, HardHat, Kanban, Landmark,
  LayoutDashboard, Loader2, LogOut, MapPinned, Menu, MessageSquareText, Search, Settings, Sun, UsersRound, X, type LucideIcon,
} from "lucide-react";

export type ShellItem = { key: string; href: string; label: string; soon: boolean; group: "work" | "site" | "admin" };
type Counts = { newLeads: number; overdue: number } | null;
type StaffInfo = { id: number; name: string; role: "admin" | "sales" | "installer" | "content" };

const ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard, leads: ClipboardList, pipeline: Kanban, "follow-ups": BellRing, reports: BarChart3,
  jobs: HardHat, districts: MapPinned, calculator: Calculator, schemes: Landmark, projects: Sun,
  templates: MessageSquareText, content: FileText, team: UsersRound, settings: Settings,
};
const GROUPS: { id: ShellItem["group"]; label: string }[] = [
  { id: "work", label: "Sales" }, { id: "site", label: "Website" }, { id: "admin", label: "Admin" },
];
const ROLE_LABEL = { admin: "Admin", sales: "Sales", installer: "Installer", content: "Content" } as const;
const prefKey = (id: number) => `ts-admin-sidebar:${id}`;
const groupsKey = (id: number) => `ts-admin-groups:${id}`;

/** Runs before paint so a collapsed sidebar never flashes open. */
export function SidebarPrefScript({ staffId }: { staffId: number }) {
  const js = `try{if(localStorage.getItem(${JSON.stringify(prefKey(staffId))})==="collapsed")document.documentElement.dataset.sb="collapsed"}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

async function signOut() {
  await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
  window.location.assign("/admin/login");
}

export function AdminShell({ items, counts, staff, children }: { items: ShellItem[]; counts: Counts; staff: StaffInfo; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [tip, setTip] = useState<{ label: string; top: number } | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => setCollapsed(document.documentElement.dataset.sb === "collapsed"), []);

  // Collapsed groups (Sales / Website / Admin), remembered in this browser.
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(groupsKey(staff.id)) ?? "[]"); if (Array.isArray(v)) setClosedGroups(v.filter((x) => typeof x === "string")); } catch { /* ignore */ }
  }, [staff.id]);
  const toggleGroup = (id: string) => setClosedGroups((cur) => {
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try { localStorage.setItem(groupsKey(staff.id), JSON.stringify(next)); } catch { /* private mode */ }
    return next;
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    setTip(null);
    if (next) document.documentElement.dataset.sb = "collapsed"; else delete document.documentElement.dataset.sb;
    try { localStorage.setItem(prefKey(staff.id), next ? "collapsed" : "open"); } catch { /* private mode */ }
  };

  const closeDrawer = useCallback(() => {
    setDrawer(false);
    requestAnimationFrame(() => opener.current?.focus());
  }, []);
  const openDrawer = (e: React.MouseEvent<HTMLButtonElement>) => { opener.current = e.currentTarget; setDrawer(true); };

  // Close on navigation; Esc closes; body scroll locked while open; focus moves into the drawer.
  useEffect(() => { setDrawer(false); }, [pathname]);
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [drawer, closeDrawer]);

  // Keep the current page visible in a long menu.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-admin-nav] [aria-current="page"]').forEach((el) => el.scrollIntoView({ block: "nearest" }));
  }, [pathname, drawer]);

  const showTip = (label: string, el: HTMLElement) => {
    if (!collapsed || !window.matchMedia("(min-width: 1024px)").matches) return;
    const r = el.getBoundingClientRect();
    setTip({ label, top: r.top + r.height / 2 });
  };

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));
  const badge = (key: string) =>
    key === "leads" && counts?.newLeads ? { n: counts.newLeads, label: "new leads", tone: "bg-[#b8913f] text-navy", dot: "bg-[#b8913f]" }
    : key === "follow-ups" && counts?.overdue ? { n: counts.overdue, label: "overdue follow-ups", tone: "bg-[#e5484d] text-white", dot: "bg-[#e5484d]" }
    : null;

  const nav = (inDrawer: boolean) => (
    <nav aria-label="Admin" data-admin-nav className="sb-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-1" onScroll={() => setTip(null)}>
      {GROUPS.map((g) => {
        const list = items.filter((i) => i.group === g.id);
        if (!list.length) return null;
        // A group holding the current page always stays open.
        const open = !closedGroups.includes(g.id) || list.some((i) => active(i.href));
        const listId = `sb-group-${g.id}${inDrawer ? "-m" : ""}`;
        return (
          <div key={g.id} className="mb-4 last:mb-0">
            <button type="button" onClick={() => toggleGroup(g.id)} aria-expanded={open} aria-controls={listId}
              className={`${inDrawer ? "" : "sb-text"} flex w-full items-center justify-between rounded-lg px-3 pb-1 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#b3a88f] outline-none hover:text-[#f5f0e6] focus-visible:ring-2 focus-visible:ring-gold`}>
              {g.label}
              <ChevronRight className={`size-3.5 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden />
            </button>
            {/* In the collapsed rail labels are hidden, so every group shows. */}
            <ul id={listId} className={`space-y-0.5 ${open ? "" : inDrawer ? "hidden" : "sb-closed"}`}>
              {list.map((i) => {
                const Icon = ICONS[i.key] ?? LayoutDashboard;
                const on = active(i.href);
                const b = badge(i.key);
                return (
                  <li key={i.key}>
                    <Link href={i.href} aria-current={on ? "page" : undefined}
                      aria-label={b && !inDrawer ? `${i.label}, ${b.n} ${b.label}` : undefined}
                      onMouseEnter={(e) => showTip(i.label, e.currentTarget)} onMouseLeave={() => setTip(null)}
                      onFocus={(e) => showTip(i.label, e.currentTarget)} onBlur={() => setTip(null)}
                      onClick={() => inDrawer && setDrawer(false)}
                      className={`sb-item group relative flex h-9 items-center gap-3 rounded-xl px-3 text-[0.92rem] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-gold ${on ? "bg-[#1d4070] text-[#f5f0e6]" : "text-[#cfc6b4] hover:bg-[#13305a] hover:text-[#f5f0e6]"}`}>
                      {on && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#b8913f]" aria-hidden />}
                      <Icon className={`size-[1.1rem] shrink-0 ${on ? "text-[#d4b46a]" : "text-[#cfc6b4] group-hover:text-[#f5f0e6]"}`} aria-hidden />
                      <span className={`${inDrawer ? "" : "sb-text"} flex-1 truncate`}>{i.label}</span>
                      {b && <span className={`${inDrawer ? "" : "sb-text"} rounded-full px-2 py-0.5 text-xs font-bold ${b.tone}`} aria-hidden={!inDrawer}>{b.n}</span>}
                      {b && !inDrawer && <span className={`sb-dot absolute right-2 top-1.5 size-2 rounded-full ${b.dot}`} aria-hidden />}
                      {i.soon && <SoonBadge className={inDrawer ? "" : "sb-text"} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const userBlock = (inDrawer: boolean) => (
    <div className="sb-foot shrink-0 border-t border-white/[.08] px-3 pb-6 pt-3">
      <div className="sb-foot-row flex items-center gap-2.5 px-1">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#b8913f] font-heading font-bold text-navy" aria-hidden>{staff.name.slice(0, 1).toUpperCase()}</span>
        <div className={`${inDrawer ? "" : "sb-text"} min-w-0 flex-1`}>
          <p className="truncate text-sm font-semibold text-[#f5f0e6]">{staff.name}</p>
          <p className="text-xs text-[#cfc6b4]">{ROLE_LABEL[staff.role]}</p>
        </div>
        <SignOutButton className="grid size-9 shrink-0 place-items-center rounded-xl text-[#cfc6b4] outline-none transition-colors hover:bg-[#13305a] hover:text-[#f5f0e6] focus-visible:ring-2 focus-visible:ring-gold"
          labelClass="sr-only" onHover={(el) => showTip("Sign out", el)} onLeave={() => setTip(null)} />
      </div>
    </div>
  );

  const hamburger = (props: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; expanded: boolean; controls: string; className?: string }) => (
    <button type="button" aria-label="Toggle menu" aria-expanded={props.expanded} aria-controls={props.controls} onClick={props.onClick}
      className={`grid size-10 shrink-0 place-items-center rounded-xl text-[#f5f0e6] outline-none transition-colors hover:bg-[#13305a] focus-visible:ring-2 focus-visible:ring-gold ${props.className ?? ""}`}>
      <Menu className="size-6" aria-hidden />
    </button>
  );

  return (
    <div className="admin-grid min-h-dvh">
      <a href="#admin-main" className="sr-only z-[60] rounded-lg bg-gold px-4 py-2 font-semibold text-navy focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>

      {/* Desktop sidebar */}
      <aside id="admin-sidebar" className="sticky top-0 hidden h-dvh flex-col overflow-hidden bg-[#0b1f3a] lg:flex">
        <div className="flex shrink-0 items-center gap-2 px-3 py-2.5">
          {hamburger({ onClick: toggleCollapsed, expanded: !collapsed, controls: "admin-sidebar" })}
          <Link href="/admin" className="sb-text flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <BrandLockup />
          </Link>
        </div>
        {nav(false)}
        {userBlock(false)}
      </aside>

      {/* Collapsed-rail tooltip (fixed, so the scrolling menu never clips it) */}
      {tip && collapsed && (
        <div role="tooltip" className="pointer-events-none fixed left-[80px] z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#0b1f3a] px-3 py-1.5 text-sm font-semibold text-white shadow-lg ring-1 ring-white/15 lg:block" style={{ top: tip.top }}>
          {tip.label}
        </div>
      )}

      {/* Mobile / tablet drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawer ? "" : "pointer-events-none"}`} aria-hidden={!drawer}>
        <button type="button" tabIndex={-1} aria-label="Close menu" onClick={closeDrawer}
          className={`sb-fade absolute inset-0 bg-navy/60 ${drawer ? "opacity-100" : "opacity-0"}`} />
        <aside id="admin-drawer" role="dialog" aria-modal="true" aria-label="Admin menu" inert={!drawer}
          className={`sb-slide absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col bg-[#0b1f3a] shadow-2xl ${drawer ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
            <BrandLockup />
            <button ref={closeBtn} type="button" onClick={closeDrawer} aria-label="Close menu"
              className="grid size-10 place-items-center rounded-xl text-[#f5f0e6] outline-none hover:bg-[#13305a] focus-visible:ring-2 focus-visible:ring-gold">
              <X className="size-6" aria-hidden />
            </button>
          </div>
          {nav(true)}
          {userBlock(true)}
        </aside>
      </div>

      <div className="min-w-0">
        <TopBar staff={staff} canSearch={staff.role === "admin" || staff.role === "sales"} menuButton={hamburger({ onClick: openDrawer, expanded: drawer, controls: "admin-drawer", className: "lg:hidden" })} />
        <main id="admin-main" className="min-w-0 px-4 pb-16 pt-4 sm:px-6 lg:px-10 lg:pt-5">
          <Breadcrumb pathname={pathname} items={items} />
          {children}
        </main>
      </div>

      <style>{`
        .sb-dot { display: none; }
        .sb-closed { display: none; }
        /* Thin overlay-style scrollbar, only visible while hovering the menu; no arrow buttons. */
        .sb-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .sb-scroll:hover, .sb-scroll:focus-within { scrollbar-color: rgba(245,240,230,.28) transparent; }
        .sb-scroll::-webkit-scrollbar { width: 6px; }
        .sb-scroll::-webkit-scrollbar-button { display: none; height: 0; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }
        .sb-scroll:hover::-webkit-scrollbar-thumb { background: rgba(245,240,230,.28); }
        @media (min-width: 1024px) {
          .admin-grid { display: grid; grid-template-columns: var(--sbw, 17rem) minmax(0, 1fr); transition: grid-template-columns 180ms ease; }
          html[data-sb="collapsed"] .admin-grid { --sbw: 72px; }
          html[data-sb="collapsed"] .sb-text { display: none; }
          html[data-sb="collapsed"] .sb-dot { display: block; }
          html[data-sb="collapsed"] .sb-closed { display: block; }
          html[data-sb="collapsed"] .sb-foot-row { flex-direction: column; padding: 0; }
          html[data-sb="collapsed"] #admin-sidebar .sb-item { justify-content: center; padding-left: 0; padding-right: 0; }
          html[data-sb="collapsed"] #admin-sidebar > div:first-child { justify-content: center; padding-left: 0; padding-right: 0; }
        }
        .sb-slide { transition: transform 180ms ease; }
        .sb-fade { transition: opacity 180ms ease; }
        @media (prefers-reduced-motion: reduce) { .admin-grid, .sb-slide, .sb-fade { transition: none !important; } }
      `}</style>
    </div>
  );
}

function SignOutButton({ className, labelClass, onHover, onLeave }: { className: string; labelClass: string; onHover?: (el: HTMLElement) => void; onLeave?: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" disabled={busy} className={`sb-item ${className} disabled:opacity-60`}
      onClick={() => { setBusy(true); void signOut(); }}
      onMouseEnter={(e) => onHover?.(e.currentTarget)} onMouseLeave={onLeave} onFocus={(e) => onHover?.(e.currentTarget)} onBlur={onLeave}
      aria-label="Sign out" title="Sign out">
      {busy ? <Loader2 className="size-[1.15rem] shrink-0 animate-spin" aria-hidden /> : <LogOut className="size-[1.15rem] shrink-0" aria-hidden />}
      <span className={labelClass}>Sign out</span>
    </button>
  );
}

/** Top bar: menu (mobile), search (Ctrl+K), View website, user menu. */
function TopBar({ staff, canSearch, menuButton }: { staff: StaffInfo; canSearch: boolean; menuButton: React.ReactNode }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); input.current?.focus(); input.current?.select(); }
      if (e.key === "Escape") setUserOpen(false);
    };
    const onClick = (e: MouseEvent) => { if (!userRef.current?.contains(e.target as Node)) setUserOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onClick); };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = input.current?.value.trim();
    if (v) router.push(`/admin/leads?q=${encodeURIComponent(v)}`);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#ece4cf] bg-[#fbf8f1]/90 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-6 lg:px-10">
      <div className="rounded-xl bg-[#0b1f3a] lg:hidden">{menuButton}</div>
      {canSearch ? (
        <form role="search" onSubmit={submit} className="relative min-w-0 flex-1 sm:max-w-md">
          <label htmlFor="admin-search" className="sr-only">Search leads by name, phone or TS number</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a94a6]" aria-hidden />
          <input ref={input} id="admin-search" type="search" placeholder="Search name, phone, TS-0001…" autoComplete="off"
            className="h-10 w-full rounded-xl border border-[#e2dccb] bg-white pl-9 pr-14 text-sm outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/20" />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#e2dccb] bg-[#faf7ef] px-1.5 py-0.5 text-[0.7rem] font-semibold text-[#8a94a6] sm:block">Ctrl K</kbd>
        </form>
      ) : <div className="flex-1" />}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-[#1a2b57] outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-gold sm:px-3">
          <ExternalLink className="size-4" aria-hidden /><span className="hidden sm:inline">View website</span><span className="sr-only sm:hidden">View website</span>
        </a>
        <div ref={userRef} className="relative">
          <button type="button" onClick={() => setUserOpen((o) => !o)} aria-haspopup="menu" aria-expanded={userOpen} aria-controls="admin-user-menu"
            className="flex h-10 items-center gap-2 rounded-xl px-1.5 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-gold sm:px-2">
            <span className="grid size-8 place-items-center rounded-full bg-navy font-heading text-sm font-bold text-gold" aria-hidden>{staff.name.slice(0, 1).toUpperCase()}</span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block max-w-[10rem] truncate text-sm font-semibold">{staff.name}</span>
              <span className="block text-xs text-[#4b5b75]">{ROLE_LABEL[staff.role]}</span>
            </span>
            <ChevronDown className="size-4 text-[#4b5b75]" aria-hidden />
            <span className="sr-only">Account menu</span>
          </button>
          {userOpen && (
            <div id="admin-user-menu" role="menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#ece4cf] bg-white p-2 shadow-[0_24px_48px_-24px_rgb(7_23_63/0.45)]">
              <div className="px-3 py-2">
                <p className="truncate font-semibold">{staff.name}</p>
                <p className="text-sm text-[#4b5b75]">{ROLE_LABEL[staff.role]}</p>
              </div>
              <button type="button" role="menuitem" onClick={() => void signOut()}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-danger outline-none hover:bg-[#fdecea] focus-visible:ring-2 focus-visible:ring-gold">
                <LogOut className="size-4" aria-hidden />Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/** Same "SOON" badge everywhere: shown only while a module isn't built yet. */
/** The website's logo (white "footer" version of the Charminar mark) for the navy sidebar. */
function BrandLockup() {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <LogoMark light className="size-10 shrink-0" />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="whitespace-nowrap font-heading text-[0.84rem] font-semibold tracking-[0.04em]">
          <span className="text-white">TELANGANA</span> <span className="text-[#4ADE80]">SOLAR</span>
        </span>
        <span className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[#d4b46a]">Staff dashboard</span>
      </span>
    </span>
  );
}

export function SoonBadge({ className = "" }: { className?: string }) {
  return <span className={`${className} inline-flex h-[18px] items-center rounded-md border border-gold/50 px-1.5 text-[0.6rem] font-bold leading-none tracking-wider text-gold`}>SOON</span>;
}

const CRUMB_LABEL: Record<string, string> = { new: "New", edit: "Edit", login: "Sign in" };

/** Admin › Section › item, from the URL. Item slugs are shown as words ("ranga-reddy" → "Ranga Reddy"). */
function Breadcrumb({ pathname, items }: { pathname: string; items: ShellItem[] }) {
  const parts = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [{ href: "/admin", label: "Overview" }];
  if (parts.length) {
    const section = items.find((i) => i.href === `/admin/${parts[0]}`);
    crumbs.push({ href: `/admin/${parts[0]}`, label: section?.label ?? parts[0].replace(/-/g, " ") });
    parts.slice(1).forEach((p, i) => {
      const raw = decodeURIComponent(p);
      const label = CRUMB_LABEL[raw] ?? (/^\d+$/.test(raw) && parts[0] === "leads" ? `TS-${raw.padStart(4, "0")}` : raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      crumbs.push({ href: `/admin/${parts.slice(0, i + 2).join("/")}`, label });
    });
  }
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-[#4b5b75]">
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-[#a0a8b6]" aria-hidden />}
            {i === crumbs.length - 1
              ? <span aria-current="page" className="font-semibold text-[#1a2b57]">{c.label}</span>
              : <Link href={c.href} className="rounded outline-none hover:text-[#1a2b57] hover:underline focus-visible:ring-2 focus-visible:ring-gold">{c.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
