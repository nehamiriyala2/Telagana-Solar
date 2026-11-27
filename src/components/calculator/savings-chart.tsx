"use client";
import { Area, AreaChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";
import type { YearPoint } from "@/lib/calculator";
import { formatINR, formatLakh } from "@/lib/utils";

/**
 * 25-year savings: cumulative saved (area, blue) vs gain after cost (dashed line, amber).
 * Colours validated for colour-blind separation and 3:1 contrast on white.
 */
export function SavingsChart({ data }: { data: YearPoint[] }) {
  const t = useTranslations("calculator");
  return (
    <figure>
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="font-heading text-h4 font-bold">{t("chartTitle")}</span>
        <span className="flex gap-4 text-caption text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[var(--chart-1)] opacity-70" aria-hidden />{t("chartSaved")}</span>
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-[var(--chart-2)]" aria-hidden />{t("chartNet")}</span>
        </span>
      </figcaption>
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.28} />
                <stop offset="1" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#44576B", fontSize: 12 }} interval={4} />
            <YAxis tickLine={false} axisLine={false} width={58} tick={{ fill: "#44576B", fontSize: 12 }} tickFormatter={(v: number) => formatLakh(v)} />
            <ReferenceLine y={0} stroke="#44576B" strokeOpacity={0.4} />
            <Tooltip
              cursor={{ stroke: "#44576B", strokeDasharray: "3 3" }}
              contentStyle={{ background: "#FCFDFF", border: "1px solid #DCE6F0", borderRadius: 14, boxShadow: "0 12px 30px -12px rgb(27 69 112 / .25)", color: "#2B6CB0" }}
              labelFormatter={(y) => t("chartYear", { year: Number(y) })}
              formatter={(v, name) => [formatINR(Number(v)), name === "cumulative" ? t("chartSaved") : t("chartNet")]}
            />
            <Area type="monotone" dataKey="cumulative" stroke="var(--chart-1)" strokeWidth={2} fill="url(#cumFill)" activeDot={{ r: 5, stroke: "#FCFDFF", strokeWidth: 2 }} animationDuration={800} />
            <Line type="monotone" dataKey="net" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 5, stroke: "#FCFDFF", strokeWidth: 2 }} animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-3 text-caption">
        <summary className="cursor-pointer text-muted">{t("table")}</summary>
        <div className="mt-2 max-h-56 overflow-auto" data-lenis-prevent>
          <table className="w-full text-left tabular-nums">
            <thead><tr className="text-muted"><th className="py-1">#</th><th>{t("chartSaved")}</th><th>{t("chartNet")}</th></tr></thead>
            <tbody>{data.map((d) => <tr key={d.year} className="border-t border-line"><td className="py-1">{d.year}</td><td>{formatINR(d.cumulative)}</td><td>{formatINR(d.net)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
