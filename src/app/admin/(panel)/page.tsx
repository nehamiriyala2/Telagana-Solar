import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CircleAlert, CircleCheck, Clock, Hourglass, IndianRupee, MapPinned, PhoneOff, TrendingDown, TrendingUp, Trophy, UserPlus } from "lucide-react";
import { requireStaff, type Staff } from "@/lib/admin/auth";
import { one } from "@/lib/admin/db";
import { durationLabel, dueLabel } from "@/lib/admin/kpi";
import { SOURCE_LABEL, SYSTEM_LABEL, USE_LABEL, inr } from "@/lib/admin/labels";
import { smtpConfigured } from "@/lib/admin/mail";
import { needsAttention, overviewData, parseOverview, type OverviewParams } from "@/lib/admin/overview";
import { fullIst } from "@/lib/admin/time";
import { Card, DeniedBanner, PageHeader } from "@/components/admin/ui";
import { RangeBar } from "@/components/admin/range-bar";
import { ChartCard, DailyArea, Donut, Funnel, HBar, type Datum } from "@/components/admin/charts";
import { StatusPill } from "@/components/admin/lead-bits";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function OverviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const staff = await requireStaff("overview.view");
  const sp = await searchParams;
  const p = parseOverview(sp);
  return (
    <>
      {sp.denied && <DeniedBanner />}
      <PageHeader title={`Hello, ${staff.name.split(" ")[0]}`} subtitle="How your leads are doing. All times are India time (IST)." />
      <div className="space-y-6">
        <RangeBar />
        <Suspense key={JSON.stringify(p)} fallback={<OverviewSkeleton />}>
          <OverviewBody p={p} staff={staff} />
        </Suspense>
        {staff.role === "admin" && <SetupCheck />}
      </div>
    </>
  );
}

const relabel = (rows: Datum[], map?: Record<string, string>) => rows.map((r) => ({ k: map?.[r.k] ?? (r.k === "Unknown" ? "Not given" : r.k), n: r.n }));

async function OverviewBody({ p, staff }: { p: OverviewParams; staff: Staff }) {
  let data: Awaited<ReturnType<typeof overviewData>>, attention: Awaited<ReturnType<typeof needsAttention>>;
  try {
    [data, attention] = await Promise.all([overviewData(p, staff), needsAttention(staff, p.test)]);
  } catch {
    return <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">The overview couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>;
  }
  const { kpi, charts } = data;
  const qs = new URLSearchParams({ ...(p.range !== "30d" ? { range: p.range } : { range: "30d" }), ...(p.range === "custom" ? { from: p.from, to: p.to } : {}), ...(p.test ? { test: "1" } : {}) }).toString();
  const leadsLink = (extra = "") => `/admin/leads?${qs}${extra}`;
  const oldest = kpi.oldestNew ? Date.now() - new Date(kpi.oldestNew).getTime() : null;
  const change = kpi.newLeadsChange;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Kpi href={leadsLink()} icon={UserPlus} label="New leads" value={kpi.newLeads.toLocaleString("en-IN")}
          note={change === null ? (kpi.prevAll === null ? "" : "No leads in the previous period") : (
            <span className={`inline-flex items-center gap-1 font-semibold ${change >= 0 ? "text-success" : "text-danger"}`}>
              {change >= 0 ? <TrendingUp className="size-4" aria-hidden /> : <TrendingDown className="size-4" aria-hidden />}{change > 0 ? "+" : ""}{change}% vs previous period
            </span>
          )} />
        <Kpi href={leadsLink("&status=new")} icon={PhoneOff} label="Not yet called" value={String(kpi.notCalled)} tone={kpi.notCalled ? "gold" : undefined}
          note={oldest !== null ? `Oldest waiting ${durationLabel(oldest)}` : "Everyone has been called"} />
        <Kpi icon={MapPinned} label="Site visits" value={String(kpi.siteVisits)} note="Reached site visit or later" />
        <Kpi href={leadsLink("&status=won")} icon={Trophy} label="Won" value={String(kpi.won)} tone="green" note={`${kpi.conversion}% conversion (won ÷ all leads)`} />
        <Kpi icon={IndianRupee} label="Pipeline" value={`${kpi.pipeline.kw} kW`} note={`${inr(kpi.pipeline.rupees)} quoted · ${kpi.pipeline.count} leads at site visit / quote`} />
        <Kpi icon={Clock} label="First response" value={durationLabel(kpi.avgFirstResponseMs)} note="Average time from lead to first status change" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Leads per day" data={charts.perDay} className="xl:col-span-2" height={260}><DailyArea data={charts.perDay} /></ChartCard>
        <ChartCard title="Funnel" data={charts.funnel} height={260}><Funnel data={charts.funnel} /></ChartCard>
        <ChartCard title="By source" data={charts.bySource}><HBar data={relabel(charts.bySource, SOURCE_LABEL)} /></ChartCard>
        <ChartCard title="Top 10 districts" data={charts.byDistrict} height={300}><HBar data={charts.byDistrict} color="#f5a800" /></ChartCard>
        <ChartCard title="Top pages" data={charts.byPage}><HBar data={charts.byPage} color="#1265d8" /></ChartCard>
        <ChartCard title="By DISCOM" data={charts.byDiscom} height={200}><Donut data={relabel(charts.byDiscom)} /></ChartCard>
        <ChartCard title="By use" data={charts.byUse} height={200}><Donut data={relabel(charts.byUse, USE_LABEL)} /></ChartCard>
        <ChartCard title="By system type" data={charts.bySystem} height={200}><Donut data={relabel(charts.bySystem, SYSTEM_LABEL)} /></ChartCard>
        <ChartCard title="By language" data={charts.byLang} height={200}><Donut data={relabel(charts.byLang, { en: "English", te: "Telugu" })} /></ChartCard>
      </div>

      <Card>
        <h2 className="font-heading text-lg font-bold">Needs attention</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <AttentionList title="New for over 2 hours" icon={Hourglass} rows={attention.stale} empty="No one is waiting." meta={(r) => `Came in ${fullIst(r.created_at)}`} />
          <AttentionList title="Overdue follow-ups" icon={CircleAlert} rows={attention.overdue} empty="No overdue follow-ups." danger meta={(r) => (r.next_follow_up ? dueLabel(new Date(r.next_follow_up)) : "")} />
          <AttentionList title="No roof" icon={CircleAlert} rows={attention.noRoof} empty="No open leads without a roof." meta={(r) => r.district ?? ""} />
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, note, href, tone }: { icon: React.ElementType; label: string; value: string; note?: React.ReactNode; href?: string; tone?: "gold" | "green" }) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#4b5b75]">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${tone === "green" ? "bg-[#e7f5e4] text-success" : tone === "gold" ? "bg-[#fff3d1] text-gold-ink" : "bg-[#eef2f9] text-navy"}`}><Icon className="size-[1.1rem]" aria-hidden /></span>
      </div>
      <p className={`mt-2 font-heading text-3xl font-extrabold ${tone === "green" ? "text-success" : ""}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-[#4b5b75]">{note}</p>}
    </>
  );
  const cls = "block rounded-2xl border border-[#ece4cf] bg-white p-5 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)]";
  return href ? <Link href={href} className={`${cls} outline-none transition hover:border-gold focus-visible:ring-2 focus-visible:ring-gold`}>{body}</Link> : <div className={cls}>{body}</div>;
}

type AttRow = { id: number; lead_no: string; name: string | null; status: string; created_at: Date; next_follow_up: Date | null; district: string | null; owner: string | null };
function AttentionList({ title, icon: Icon, rows, empty, meta, danger }: { title: string; icon: React.ElementType; rows: AttRow[]; empty: string; meta: (r: AttRow) => string; danger?: boolean }) {
  return (
    <div>
      <h3 className={`flex items-center gap-2 text-sm font-bold ${danger ? "text-danger" : "text-[#1a2b57]"}`}><Icon className="size-4" aria-hidden />{title} <span className="text-[#8a94a6]">({rows.length}{rows.length === 10 ? "+" : ""})</span></h3>
      {rows.length ? (
        <ul className="mt-2 divide-y divide-[#f1ece0]">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/leads/${r.id}`} className="flex items-center justify-between gap-3 rounded-lg px-1 py-2.5 outline-none hover:bg-[#faf7ef] focus-visible:ring-2 focus-visible:ring-gold">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{r.name ?? "No name"} <span className="font-mono text-xs font-normal text-gold-ink">{r.lead_no}</span></span>
                  <span className={`block text-xs ${danger ? "font-semibold text-danger" : "text-[#4b5b75]"}`}>{meta(r)}{r.owner ? ` · ${r.owner}` : ""}</span>
                </span>
                <StatusPill status={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="mt-2 flex items-center gap-2 text-sm text-success"><CircleCheck className="size-4" aria-hidden />{empty}</p>}
    </div>
  );
}

async function SetupCheck() {
  let s: { districts: number; real: number; test: number; staff: number } | null = null;
  try {
    s = await one(`SELECT (SELECT COUNT(*) FROM districts) AS districts,
      (SELECT COUNT(*) FROM leads WHERE is_test = 0 AND deleted_at IS NULL) AS \`real\`,
      (SELECT COUNT(*) FROM leads WHERE is_test = 1 AND deleted_at IS NULL) AS test,
      (SELECT COUNT(*) FROM staff WHERE active = 1) AS staff`);
  } catch { s = null; }
  const Row = ({ ok, label, value }: { ok: boolean; label: string; value: string }) => (
    <li className="flex items-center justify-between gap-4 border-b border-[#f1ece0] py-2.5 last:border-0">
      <span className="flex items-center gap-2.5">{ok ? <CircleCheck className="size-4 text-success" aria-hidden /> : <CircleAlert className="size-4 text-gold-ink" aria-hidden />}{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </li>
  );
  return (
    <details className="group rounded-2xl border border-[#ece4cf] bg-white p-5">
      <summary className="cursor-pointer list-none font-heading font-bold outline-none focus-visible:ring-2 focus-visible:ring-gold">
        <span className="inline-block transition group-open:rotate-90" aria-hidden>›</span> Setup check
      </summary>
      {s ? (
        <ul className="mt-3 text-sm">
          <Row ok label="Database" value="Connected" />
          <Row ok={Number(s.districts) === 33} label="Districts" value={`${s.districts} of 33`} />
          <Row ok label="Website leads saved" value={String(s.real)} />
          <Row ok label="Demo leads (test data)" value={String(s.test)} />
          <Row ok label="Active staff" value={String(s.staff)} />
          <Row ok={smtpConfigured()} label="Sign-in codes" value={smtpConfigured() ? "Sent by email" : "Dev mode: printed in the server console"} />
        </ul>
      ) : <p role="alert" className="mt-3 text-sm text-danger">Can’t read the database. Check that MySQL is running in XAMPP.</p>}
    </details>
  );
}

function OverviewSkeleton() {
  return (
    <div role="status" aria-label="Loading overview" className="animate-pulse space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-32 rounded-2xl bg-white" />)}</div>
      <div className="grid gap-4 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-72 rounded-2xl bg-white" />)}</div>
    </div>
  );
}
