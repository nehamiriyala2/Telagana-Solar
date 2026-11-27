"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type Datum = { k: string; n: number };

/** Brand palette: navy, gold, blue, green, then softer tones. */
export const PALETTE = ["#07173f", "#f5a800", "#1265d8", "#2b7a23", "#8a5a00", "#5b3aa6", "#0f6e7a", "#b42318", "#8a94a6", "#c9a227"];
const axis = { fontSize: 12, fill: "#4b5b75" };
const tooltipStyle = { borderRadius: 12, border: "1px solid #ece4cf", boxShadow: "0 12px 30px -18px rgb(7 23 63 / 0.45)", fontSize: 13 };

function Empty() {
  return <div className="grid h-full place-items-center text-sm text-[#8a94a6]">No data for this range</div>;
}

/** Wraps a chart in a card with an accessible text summary (screen readers get the numbers). */
export function ChartCard({ title, data, children, height = 240, className = "" }: { title: string; data: Datum[]; children: React.ReactNode; height?: number; className?: string }) {
  const total = data.reduce((s, d) => s + d.n, 0);
  return (
    <section className={`rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)] ${className}`}>
      <h3 className="font-heading text-base font-bold">{title}</h3>
      <div className="mt-3" style={{ height }} aria-hidden>{total ? children : <Empty />}</div>
      <p className="sr-only">{title}: {data.map((d) => `${d.k} ${d.n}`).join(", ") || "no data"}.</p>
    </section>
  );
}

export function DailyArea({ data }: { data: Datum[] }) {
  const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="goldFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f5a800" stopOpacity={0.45} /><stop offset="100%" stopColor="#f5a800" stopOpacity={0.02} /></linearGradient>
        </defs>
        <CartesianGrid stroke="#f1ece0" vertical={false} />
        <XAxis dataKey="k" tickFormatter={fmt} tick={axis} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => fmt(String(l))} formatter={(v) => [v, "Leads"]} />
        <Area type="monotone" dataKey="n" stroke="#d99500" strokeWidth={2.5} fill="url(#goldFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function HBar({ data, color = "#07173f", label = "Leads" }: { data: Datum[]; color?: string; label?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#f1ece0" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="k" width={120} tick={axis} tickLine={false} axisLine={false} interval={0} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, label]} cursor={{ fill: "#faf7ef" }} />
        <Bar dataKey="n" fill={color} radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data }: { data: Datum[] }) {
  return (
    <div className="flex h-full items-center gap-4">
      <div className="h-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="n" nameKey="k" innerRadius="58%" outerRadius="90%" paddingAngle={2} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="shrink-0 space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.k} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="max-w-[8rem] truncate">{d.k}</span><b className="ml-auto pl-2">{d.n}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Funnel as descending bars with conversion from the first stage. */
export function Funnel({ data }: { data: Datum[] }) {
  const top = data[0]?.n || 0;
  return (
    <ol className="flex h-full flex-col justify-center gap-2.5">
      {data.map((d, i) => {
        const pct = top ? Math.round((d.n / top) * 100) : 0;
        return (
          <li key={d.k} className="grid grid-cols-[6rem_1fr_4.5rem] items-center gap-3 text-sm">
            <span className="font-semibold">{d.k}</span>
            <span className="h-7 rounded-lg bg-[#f6f2e7]">
              <span className="block h-full rounded-lg" style={{ width: `${Math.max(pct, d.n ? 3 : 0)}%`, background: i === data.length - 1 ? "#2b7a23" : PALETTE[i === 0 ? 0 : i === 1 ? 2 : 1] }} />
            </span>
            <span className="text-right"><b>{d.n}</b> <span className="text-xs text-[#8a94a6]">{pct}%</span></span>
          </li>
        );
      })}
    </ol>
  );
}
