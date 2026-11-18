"use client";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ShieldCheck, ShieldExclamationPoint } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import {
  bestSubsidy, estimateBill, paybackYears, projectSavings, systemKw, unitsFromBill, unitsPerKwMonth,
} from "@/lib/solar/engine";
import type { Assumptions, Scheme, Tariff } from "@/lib/types";
import { formatINR, formatLakh, formatNum, formatRange } from "@/lib/utils";

type Mode = "bill" | "units";
type Cat = "domestic" | "commercial";

export function BillCalculator({ tariffs, assumptions: a, schemes }: { tariffs: Tariff[]; assumptions: Assumptions; schemes: Scheme[] }) {
  const t = useTranslations("bill");
  const tc = useTranslations("common");
  const [mode, setMode] = useState<Mode>("bill");
  const [cat, setCat] = useState<Cat>("domestic");
  const [value, setValue] = useState(3000);
  const tariff = tariffs.find((x) => x.id === cat) ?? tariffs[0];

  const r = useMemo(() => {
    const units = mode === "bill" ? unitsFromBill(value, tariff) : value;
    const bill = estimateBill(units, tariff);
    const kw = systemKw(units / 30, a);
    const perKw = cat === "commercial" ? a.costPerKw.commercial : a.costPerKw["on-grid"];
    const cost = { min: perKw.min * kw, max: perKw.max * kw };
    const mid = (cost.min + cost.max) / 2;
    const sub = bestSubsidy(cat === "commercial" ? "business" : "urban", kw, mid, schemes);
    const net = mid - sub.amount;
    const proj = projectSavings({ monthlyUnits: units, kw, netCost: net, tariff, a });
    const yearly = proj[0]?.savings ?? 0;
    const gen = kw * unitsPerKwMonth(a);
    return {
      units, bill, kw, cost, sub, net, proj, yearly, monthly: Math.round(yearly / 12),
      payback: paybackYears(proj, net), lifetime: proj.at(-1)?.cumulative ?? 0,
      co2: Math.round(((Math.min(gen, units) * 12 * a.co2PerKwh) / 1000) * 10) / 10,
    };
  }, [mode, value, tariff, a, cat, schemes]);

  const max = mode === "bill" ? 20000 : 2000;
  const step = mode === "bill" ? 100 : 10;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input */}
        <Card className="p-6 md:p-8 lg:col-span-5">
          <div className="flex flex-wrap gap-3">
            <ChoiceChips label={t("byBill")} layoutId="bill-mode" value={mode} onChange={(m) => { setMode(m); setValue(m === "bill" ? 3000 : 350); }}
              options={[{ value: "bill", label: t("byBill") }, { value: "units", label: t("byUnits") }]} />
            <ChoiceChips label={t("category")} layoutId="bill-cat" value={cat} onChange={setCat}
              options={[{ value: "domestic", label: t("domestic") }, { value: "commercial", label: t("commercial") }]} />
          </div>
          <label htmlFor="bill-value" className="mt-8 block text-caption text-muted">{mode === "bill" ? t("billInput") : t("unitsInput")}</label>
          <div className="mt-1 flex items-baseline gap-2">
            {mode === "bill" && <span className="font-heading text-h3 font-extrabold">₹</span>}
            <input id="bill-value" type="number" inputMode="numeric" min={0} max={max * 3} value={value}
              onChange={(e) => setValue(Math.max(0, Math.min(max * 3, Number(e.target.value) || 0)))}
              className="w-full bg-transparent font-heading text-hero font-extrabold tracking-tightish outline-none" />
          </div>
          <Slider className="mt-3" value={[Math.min(value, max)]} min={0} max={max} step={step} onValueChange={([v]) => setValue(v)} aria-label={mode === "bill" ? t("billInput") : t("unitsInput")} />
          <p className="mt-4 text-caption text-muted">
            {mode === "bill" ? t("estimatedUnits") : t("estimatedBill")}:{" "}
            <span className="font-medium text-fg">{mode === "bill" ? `${formatNum(r.units)} kWh` : formatINR(r.bill.total)}</span>
          </p>
          <VerifyBadge v={tariff.verified} date={tariff.lastVerified} needs={tc("needsVerification")} label={tc("lastVerified", { date: tariff.lastVerified ?? "" })} />
        </Card>

        {/* Outputs */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-7 lg:grid-cols-3">
          <Out label={t("size")} value={<><CountUp value={r.kw} /> kW</>} />
          <Out label={t("cost")} value={formatRange(r.cost.min, r.cost.max)} />
          <Out label={t("subsidy")} value={r.sub.amount ? `−${formatINR(r.sub.amount)}` : "—"} green={!!r.sub.amount} />
          <Out label={t("netCost")} value={formatLakh(r.net)} />
          <Out label={t("monthly")} value={<CountUp value={r.monthly} format={formatINR} duration={0.5} />} green />
          <Out label={t("yearly")} value={<CountUp value={r.yearly} format={formatINR} duration={0.5} />} green />
          <Out label={t("payback")} value={r.payback !== null ? tc("years", { count: r.payback }) : "—"} />
          <Out label={t("lifetime")} value={<CountUp value={r.lifetime} format={formatLakh} duration={0.5} />} green />
          <Out label={t("co2")} value={t("co2Value", { value: r.co2 })} />
        </div>
      </div>

      <Reveal>
        <Card className="p-6 md:p-8">
          <SavingsChart data={r.proj} title={t("chartTitle")} cumulativeLabel={t("chartCumulative")} netLabel={t("chartNet")} yearLabel={(y) => t("chartYear", { year: y })} tableLabel={t("table")} />
        </Card>
      </Reveal>

      <Reveal>
        <SlabTable tariff={tariff} units={r.units} />
      </Reveal>
    </div>
  );
}

function Out({ label, value, green }: { label: string; value: React.ReactNode; green?: boolean }) {
  return (
    <Card className="p-4 md:p-5">
      <p className="text-caption text-muted">{label}</p>
      <p className={`mt-1 font-heading text-[1.25rem] font-extrabold md:text-h4 ${green ? "text-savings-text" : ""}`}>{value}</p>
    </Card>
  );
}

function VerifyBadge({ v, date, needs, label }: { v: boolean; date: string | null; needs: string; label: string }) {
  return v && date
    ? <Badge variant="savings" className="mt-4"><ShieldCheck aria-hidden />{label}</Badge>
    : <Badge variant="warn" className="mt-4"><ShieldExclamationPoint aria-hidden />{needs}</Badge>;
}

function SavingsChart({ data, title, cumulativeLabel, netLabel, yearLabel, tableLabel }: {
  data: { year: number; cumulative: number; net: number }[]; title: string; cumulativeLabel: string; netLabel: string; yearLabel: (y: number) => string; tableLabel: string;
}) {
  return (
    <figure>
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="font-heading text-h4 font-bold">{title}</span>
        <span className="flex gap-4 text-caption text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[var(--chart-1)] opacity-70" aria-hidden />{cumulativeLabel}</span>
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-[var(--chart-2)]" aria-hidden />{netLabel}</span>
        </span>
      </figcaption>
      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="1" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} interval={4} />
            <YAxis tickLine={false} axisLine={false} width={56} tick={{ fill: "var(--muted)", fontSize: 12 }} tickFormatter={(v: number) => formatLakh(v)} />
            <ReferenceLine y={0} stroke="var(--muted)" strokeOpacity={0.5} />
            <Tooltip
              cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, boxShadow: "var(--shadow-lift)", color: "var(--fg)" }}
              labelFormatter={(y) => yearLabel(Number(y))}
              formatter={(v, name) => [formatINR(Number(v)), name === "cumulative" ? cumulativeLabel : netLabel]}
            />
            <Area type="monotone" dataKey="cumulative" stroke="var(--chart-1)" strokeWidth={2} fill="url(#cum)" activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} animationDuration={900} />
            <Line type="monotone" dataKey="net" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} animationDuration={900} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-4 text-caption">
        <summary className="cursor-pointer text-muted">{tableLabel}</summary>
        <div className="mt-2 max-h-56 overflow-auto" data-lenis-prevent>
          <table className="w-full text-left tabular-nums">
            <thead><tr className="text-muted"><th className="py-1">#</th><th>{cumulativeLabel}</th><th>{netLabel}</th></tr></thead>
            <tbody>{data.map((d) => <tr key={d.year} className="border-t border-line"><td className="py-1">{d.year}</td><td>{formatINR(d.cumulative)}</td><td>{formatINR(d.net)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

function SlabTable({ tariff, units }: { tariff: Tariff; units: number }) {
  const t = useTranslations("bill");
  const tc = useTranslations("common");
  const groupIdx = tariff.groups.findIndex((g) => g.maxUnits === null || units <= g.maxUnits);
  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-h4">{t("slabTitle")}</h2>
          <p className="mt-1 max-w-2xl text-caption text-muted">{t("slabNote")} · {tariff.discom}</p>
        </div>
        <VerifyBadge v={tariff.verified} date={tariff.lastVerified} needs={tc("needsVerification")} label={tc("lastVerified", { date: tariff.lastVerified ?? "" })} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {tariff.groups.map((g, gi) => {
          const prevMax = gi > 0 ? tariff.groups[gi - 1].maxUnits ?? 0 : 0;
          return (
            <div key={gi} className={`rounded-2xl border p-4 transition-colors duration-300 ${gi === groupIdx ? "border-gold bg-gold-soft/40 dark:bg-gold/5" : "border-line"}`}>
              <p className="text-caption font-medium">
                {t("group", { max: g.maxUnits === null ? t("groupAbove", { min: prevMax }) : t("groupUpTo", { max: g.maxUnits }) })}
              </p>
              <ul className="mt-3 space-y-1.5 text-caption">
                {g.slabs.map((s, si) => {
                  const from = si === 0 ? 0 : (g.slabs[si - 1].upTo ?? 0) + 1;
                  return (
                    <li key={si} className="flex justify-between gap-2">
                      <span className="text-muted">{s.upTo === null ? t("slabAbove", { from: from - 1 }) : t("slabRange", { from, to: s.upTo })}</span>
                      <span className="font-medium tabular-nums">₹{s.rate.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-caption text-muted">{t("fixed")}: {formatINR(tariff.fixedPerMonth)} · {t("duty")}: ₹{tariff.dutyPerUnit}/kWh</p>
    </Card>
  );
}
