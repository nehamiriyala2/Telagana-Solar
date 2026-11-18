"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AirVent, ArrowRight, BatteryCharging, Blend, Droplets, Fan, Lamp, LampCeiling, Laptop, Lightbulb,
  Minus, Plus, Refrigerator, RotateCcw, Shirt, ShowerHead, Tv, Wifi,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/motion/count-up";
import { applianceRow, applianceTotals } from "@/lib/solar/engine";
import type { Appliance, Assumptions } from "@/lib/types";
import { cn, formatNum, pick } from "@/lib/utils";

const ICONS: Record<string, typeof Fan> = {
  bulb: Lightbulb, tube: LampCeiling, fan: Fan, tv: Tv, fridge: Refrigerator, wifi: Wifi, laptop: Laptop,
  mixer: Blend, iron: Shirt, geyser: ShowerHead, ac: AirVent, motor: Droplets,
};

interface RowState { qty: number; hours: number; watts: number; variant: boolean }
const init = (list: Appliance[]) =>
  Object.fromEntries(list.map((a) => [a.id, { qty: a.defaultQty, hours: a.defaultHours, watts: a.watts, variant: false }])) as Record<string, RowState>;

export function ApplianceCalculator({ appliances, assumptions }: { appliances: Appliance[]; assumptions: Assumptions }) {
  const t = useTranslations("appliances");
  const [rows, setRows] = useState(() => init(appliances));
  const [cuts, setCuts] = useState(false);

  const update = (id: string, patch: Partial<RowState>) => setRows((r) => ({ ...r, [id]: { ...r[id], ...patch } }));

  const computed = useMemo(
    () => appliances.map((a) => ({ appliance: a, ...rows[a.id] })),
    [appliances, rows],
  );
  const totals = applianceTotals(computed, assumptions, cuts);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8 xl:grid-cols-3">
        {computed.map((r, i) => (
          <li key={r.appliance.id} className="animate-rise" style={{ animationDelay: `${i * 0.03}s` }}>
            <ApplianceCard
              a={r.appliance} state={rows[r.appliance.id]} assumptions={assumptions}
              onChange={(p) => update(r.appliance.id, p)}
            />
          </li>
        ))}
      </ul>

      <aside className="lg:col-span-4" aria-label={t("recommended")}>
        <Card className="sticky top-[calc(var(--header-h)+1rem)] p-6">
          <Gauge kw={totals.kw} label={t("gaugeLabel")} />
          <AnimatePresence mode="wait">
            <motion.p key={totals.kw} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              className="mt-2 text-center font-heading text-[1.125rem] font-bold" aria-live="polite">
              {totals.unitsDay > 0 ? t("friendly", { kw: totals.kw, sqft: formatNum(totals.sqft) }) : t("empty")}
            </motion.p>
          </AnimatePresence>

          <dl className="mt-6 grid grid-cols-3 gap-2 border-y border-line py-4 text-center">
            <Stat label={t("totalWatts")} value={totals.totalWatts} suffix=" W" />
            <Stat label={t("dailyUse")} value={totals.unitsDay} suffix=" kWh" digits={1} />
            <Stat label={t("monthlyUse")} value={totals.unitsMonth} suffix=" kWh" />
          </dl>

          <label className="mt-5 flex cursor-pointer items-center justify-between gap-3">
            <span className="font-medium">{t("cutsToggle")}</span>
            <button type="button" role="switch" aria-checked={cuts} onClick={() => setCuts((c) => !c)}
              className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300", cuts ? "bg-sun" : "bg-fg/15")}>
              <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className={cn("absolute top-1 size-5 rounded-full bg-white shadow", cuts ? "right-1" : "left-1")} />
            </button>
          </label>
          <p className={cn("mt-3 flex items-start gap-2 rounded-2xl p-3 text-caption", totals.batteryNeeded ? "bg-gold-soft text-navy dark:bg-gold/10 dark:text-cream" : "bg-fg/[0.04] text-muted")}>
            <BatteryCharging className="mt-0.5 size-4 shrink-0" aria-hidden />
            {totals.batteryNeeded ? t("batteryNeeded", { kwh: totals.batteryKwh }) : t("noBattery")}
          </p>
          {totals.heavy && <p className="mt-3 text-caption text-muted">{t("heavyNote")}</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild size="sm"><Link href="/finder">{t("recommended")}<ArrowRight /></Link></Button>
            <Button size="sm" variant="ghost" onClick={() => setRows(init(appliances))}><RotateCcw />{t("reset")}</Button>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function ApplianceCard({ a, state, assumptions, onChange }: {
  a: Appliance; state: RowState; assumptions: Assumptions; onChange: (p: Partial<RowState>) => void;
}) {
  const t = useTranslations("appliances");
  const locale = useLocale();
  const Icon = ICONS[a.icon] ?? Lamp;
  const name = state.variant && a.variant ? pick(a.variant.name, locale) : pick(a.name, locale);
  const row = applianceRow({ appliance: a, qty: state.qty, hours: state.hours, watts: state.watts }, assumptions);
  const on = state.qty > 0;

  return (
    <div className={cn("flex h-full flex-col rounded-card border bg-surface p-4 shadow-soft transition-[border-color,box-shadow] duration-300", on ? "border-gold/60 shadow-glow" : "border-line")}>
      <div className="flex items-start justify-between gap-2">
        <motion.span animate={{ scale: on ? 1 : 0.92 }} className={cn("grid size-11 place-items-center rounded-2xl transition-colors duration-300", on ? "bg-sun text-navy" : "bg-fg/[0.06] text-muted")}>
          <Icon className="size-5" strokeWidth={1.7} aria-hidden />
        </motion.span>
        <div className="flex items-center gap-1" role="group" aria-label={`${t("qty")}: ${name}`}>
          <StepBtn label={t("decrease", { name })} onClick={() => onChange({ qty: Math.max(0, state.qty - 1) })} disabled={!state.qty}><Minus /></StepBtn>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={state.qty} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}
              className="w-7 text-center font-heading text-h4 font-bold tabular-nums" aria-live="polite">{state.qty}</motion.span>
          </AnimatePresence>
          <StepBtn label={t("increase", { name })} onClick={() => onChange({ qty: Math.min(50, state.qty + 1) })}><Plus /></StepBtn>
        </div>
      </div>

      <h3 className="mt-3 font-heading text-[1.0625rem] font-bold">{name}</h3>
      {a.variant && (
        <button type="button" onClick={() => onChange({ variant: !state.variant, watts: !state.variant ? a.variant!.watts : a.watts })}
          className="mt-0.5 self-start text-caption text-muted underline decoration-dotted underline-offset-4 hover:text-fg">
          {t("switchTo", { name: state.variant ? pick(a.name, locale) : pick(a.variant.name, locale) })}
        </button>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumField label={t("watts")} value={state.watts} step={5} min={1} max={5000} onChange={(v) => onChange({ watts: v })} />
        <NumField label={t("hours")} value={state.hours} step={0.5} min={0} max={24} onChange={(v) => onChange({ hours: v })} />
      </div>

      <p className="mt-3 border-t border-line pt-3 text-caption text-muted">
        {t("unitsDay", { value: formatNum(row.unitsDay, 2) })} · {t("unitsMonth", { value: formatNum(row.unitsMonth, 1) })} · {t("roof", { value: row.sqft })}
      </p>
    </div>
  );
}

function StepBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.85 }} aria-label={label} onClick={onClick} disabled={disabled}
      className="grid size-9 place-items-center rounded-full border border-line transition-colors hover:border-gold disabled:opacity-35 [&_svg]:size-4">
      {children}
    </motion.button>
  );
}

function NumField({ label, value, onChange, step, min, max }: { label: string; value: number; onChange: (v: number) => void; step: number; min: number; max: number }) {
  return (
    <label className="block rounded-xl bg-fg/[0.04] px-3 py-1.5">
      <span className="block text-[0.75rem] text-muted">{label}</span>
      <input type="number" inputMode="decimal" value={value} step={step} min={min} max={max}
        onChange={(e) => { const v = Number(e.target.value); if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v))); }}
        className="w-full bg-transparent font-medium tabular-nums outline-none" />
    </label>
  );
}

function Stat({ label, value, suffix, digits = 0 }: { label: string; value: number; suffix: string; digits?: number }) {
  return (
    <div>
      <dt className="text-[0.75rem] text-muted">{label}</dt>
      <dd className="mt-1 font-heading font-bold"><CountUp value={value} format={(n) => formatNum(n, digits) + suffix} duration={0.5} /></dd>
    </div>
  );
}

/** Semi-circular live gauge, 0–10 kW (extends for larger systems). */
function Gauge({ kw, label }: { kw: number; label: string }) {
  const max = Math.max(10, Math.ceil(kw / 5) * 5);
  const frac = Math.min(1, kw / max);
  const len = Math.PI * 90;
  return (
    <div className="relative mx-auto w-full max-w-[260px]" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={kw} aria-label={label}>
      <svg viewBox="0 0 220 125" className="w-full" aria-hidden>
        <defs><linearGradient id="gauge" x1="0" x2="1"><stop offset="0" stopColor="#FFB800" /><stop offset="1" stopColor="#FF8A00" /></linearGradient></defs>
        <path d="M20 115 A90 90 0 0 1 200 115" className="stroke-fg/10" strokeWidth="16" strokeLinecap="round" fill="none" />
        <motion.path d="M20 115 A90 90 0 0 1 200 115" stroke="url(#gauge)" strokeWidth="16" strokeLinecap="round" fill="none"
          strokeDasharray={len} initial={false} animate={{ strokeDashoffset: len * (1 - frac) }} transition={{ type: "spring", stiffness: 90, damping: 18 }} />
        {Array.from({ length: 11 }).map((_, i) => {
          const ang = Math.PI * (1 - i / 10);
          return <line key={i} x1={110 + Math.cos(ang) * 70} y1={115 - Math.sin(ang) * 70} x2={110 + Math.cos(ang) * 64} y2={115 - Math.sin(ang) * 64} className="stroke-fg/25" strokeWidth="2" />;
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-heading text-[2.75rem] font-extrabold leading-none tracking-tightish"><CountUp value={kw} duration={0.5} /><span className="ml-1 text-h4">kW</span></p>
      </div>
    </div>
  );
}
