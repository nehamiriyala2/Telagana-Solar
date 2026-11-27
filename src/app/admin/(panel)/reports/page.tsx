import type { Metadata } from "next";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { requireStaff, type Staff } from "@/lib/admin/auth";
import { inr, kwLabel } from "@/lib/admin/labels";
import { parseOverview, type OverviewParams } from "@/lib/admin/overview";
import { SECTION_KEYS, reportSection, type Section } from "@/lib/admin/reports";
import { can } from "@/lib/admin/roles";
import { PageHeader } from "@/components/admin/ui";
import { RangeBar } from "@/components/admin/range-bar";
import { ChartCard, Donut, HBar } from "@/components/admin/charts";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const staff = await requireStaff("reports.view");
  const p = parseOverview(await searchParams);
  return (
    <>
      <PageHeader title="Reports" subtitle={can(staff.role, "reports.export")
        ? "Numbers match the Leads list for the same date range and test-data setting."
        : "Read-only for your role. Numbers match the Leads list for the same filters."} />
      <div className="space-y-6">
        <RangeBar />
        <Suspense key={JSON.stringify(p)} fallback={<div role="status" aria-label="Loading reports" className="grid animate-pulse gap-6">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-80 rounded-2xl bg-white" />)}</div>}>
          <Sections p={p} staff={staff} />
        </Suspense>
      </div>
    </>
  );
}

async function Sections({ p, staff }: { p: OverviewParams; staff: Staff }) {
  let sections: Section[];
  try {
    sections = await Promise.all(SECTION_KEYS.map((k) => reportSection(k, p, staff)));
  } catch {
    return <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">Reports couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>;
  }
  const canExport = can(staff.role, "reports.export");
  const qs = new URLSearchParams({ range: p.range, ...(p.range === "custom" ? { from: p.from, to: p.to } : {}), ...(p.test ? { test: "1" } : {}) });
  return <div className="space-y-6">{sections.map((s) => <SectionCard key={s.key} s={s} exportHref={canExport ? `/api/admin/reports/export?section=${s.key}&${qs}` : null} />)}</div>;
}

function fmt(kind: string | undefined, v: string | number | null) {
  if (v === null || v === undefined || v === "") return "-";
  if (kind === "pct") return `${v}%`;
  if (kind === "kw") return kwLabel(Number(v));
  if (kind === "inr") return inr(Number(v));
  if (kind === "num") return Number(v).toLocaleString("en-IN");
  return String(v);
}

function SectionCard({ s, exportHref }: { s: Section; exportHref: string | null }) {
  const data = s.rows.filter((r) => Number(r[s.chart.valueKey]) > 0).slice(0, 12).map((r) => ({ k: String(r[s.chart.labelKey]), n: Number(r[s.chart.valueKey]) }));
  const valueLabel = s.columns.find((c) => c.key === s.chart.valueKey)?.label ?? "";
  return (
    <section aria-labelledby={`r-${s.key}`} className="rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`r-${s.key}`} className="font-heading text-lg font-bold">{s.title}</h2>
          {s.note && <p className="text-sm text-[#4b5b75]">{s.note}</p>}
        </div>
        {exportHref && (
          <a href={exportHref} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2dccb] px-3 text-sm font-semibold text-[#1a2b57] outline-none hover:bg-[#faf7ef] focus-visible:ring-2 focus-visible:ring-gold">
            <Download className="size-4" aria-hidden />Download CSV
          </a>
        )}
      </div>
      {s.rows.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-[#e2dccb] p-6 text-center text-sm text-[#4b5b75]">No data for this range.</p> : (
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className={`overflow-auto rounded-xl border border-[#f1ece0] ${s.rows.length > 12 ? "max-h-[26rem]" : ""}`}>
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#faf7ef] text-xs uppercase tracking-wide text-[#4b5b75]">
                <tr>{s.columns.map((c) => <th key={c.key} scope="col" className={`whitespace-nowrap px-3 py-2.5 font-semibold ${c.kind && c.kind !== "text" ? "text-right" : ""}`}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {s.rows.map((r, i) => (
                  <tr key={i} className="border-t border-[#f1ece0]">
                    {s.columns.map((c, j) => j === 0
                      ? <th key={c.key} scope="row" className="px-3 py-2 font-semibold">{fmt(c.kind, r[c.key])}</th>
                      : <td key={c.key} className={`whitespace-nowrap px-3 py-2 ${c.kind && c.kind !== "text" ? "text-right tabular-nums" : ""}`}>{fmt(c.kind, r[c.key])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ChartCard title={`${valueLabel} by ${s.columns[0].label.toLowerCase()}`} data={data} height={s.chart.type === "donut" ? 220 : Math.max(200, data.length * 30)} className="!border-0 !p-0 !shadow-none">
            {s.chart.type === "donut" ? <Donut data={data} /> : <HBar data={data} label={valueLabel} color={s.key === "monthly-won" || s.key === "by-staff" ? "#2b7a23" : "#07173f"} />}
          </ChartCard>
        </div>
      )}
    </section>
  );
}
