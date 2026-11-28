import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Settings2 } from "lucide-react";
import { requireStaff, type Staff } from "@/lib/admin/auth";
import { q } from "@/lib/admin/db";
import { STATUSES, type LeadStatus } from "@/lib/admin/labels";
import { can, ownLeadsOnly } from "@/lib/admin/roles";
import { loadStages } from "@/lib/admin/stages-store";
import { PageHeader } from "@/components/admin/ui";
import { PipelineBoard, PipelineFilters, type PipeCard, type PipeColumn } from "@/components/admin/pipeline-board";

export const metadata: Metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

const CLOSED_DAYS = 90;
const PER_COLUMN = 100;

type Filter = { owner: string; district: string; test: boolean };

function parse(sp: Record<string, string | undefined>, staff: Staff): Filter {
  const rawOwner = sp.owner ?? (sp.mine === "1" ? "me" : "");
  return {
    // Sales always see only their own leads, whatever the URL says.
    owner: ownLeadsOnly(staff.role) ? "me" : /^(\d+|none|me)$/.test(rawOwner) ? rawOwner : "",
    district: /^[a-z][a-z-]{1,58}$/.test(sp.district ?? "") ? sp.district! : "",
    test: sp.test === "1",
  };
}

export default async function PipelinePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const staff = await requireStaff("pipeline.view");
  const f = parse(await searchParams, staff);
  const [districts, owners] = await Promise.all([
    q<{ slug: string; name_en: string }>("SELECT slug, name_en FROM districts ORDER BY name_en").catch(() => []),
    ownLeadsOnly(staff.role) ? Promise.resolve([]) : q<{ id: number; name: string; active: number }>("SELECT id, name, active FROM staff WHERE role IN ('admin','sales') ORDER BY active DESC, name").catch(() => []),
  ]);
  return (
    <>
      <PageHeader title="Pipeline" subtitle={`Drag a lead to change its stage, or use “Move to”. Won and lost show the last ${CLOSED_DAYS} days.`}>
        {staff.role === "admin" && (
          <Link href="/admin/settings#pipeline-stages" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm font-semibold text-[#1a2b57] hover:bg-[#faf7ef]">
            <Settings2 className="size-4" aria-hidden />Edit stages
          </Link>
        )}
      </PageHeader>
      <PipelineFilters districts={districts} owners={owners} canPickOwner={!ownLeadsOnly(staff.role)} staffId={staff.id} />
      <Suspense key={JSON.stringify(f)} fallback={<BoardSkeleton />}>
        <Board staff={staff} f={f} />
      </Suspense>
    </>
  );
}

async function Board({ staff, f }: { staff: Staff; f: Filter }) {
  const where = [
    "l.deleted_at IS NULL",
    "NOT (l.phone_normalized IS NULL AND l.anonymized_at IS NULL)",
    `(l.status NOT IN ('won','lost') OR COALESCE(l.won_at, l.updated_at) >= UTC_TIMESTAMP() - INTERVAL ${CLOSED_DAYS} DAY)`,
  ];
  const params: (string | number)[] = [];
  if (!f.test) where.push("l.is_test = 0");
  if (f.owner === "me") { where.push("l.assigned_to = ?"); params.push(staff.id); }
  else if (f.owner === "none") where.push("l.assigned_to IS NULL");
  else if (f.owner) { where.push("l.assigned_to = ?"); params.push(Number(f.owner)); }
  if (f.district) { where.push("l.district_id = (SELECT id FROM districts WHERE slug = ?)"); params.push(f.district); }
  const w = where.join(" AND ");

  type Row = {
    id: number; lead_no: string; name: string | null; status: LeadStatus; kw: string | null; final_kw: string | null; bill: number | null;
    quote_amount: number | null; final_amount: number | null; subsidy_applied: number | null;
    district: string | null; owner: string | null; owner_active: number | null; stage_since: Date;
  };
  let rows: Row[], counts: { status: LeadStatus; n: number; kw: string | null }[], stages;
  try {
    [rows, counts, stages] = await Promise.all([
      q<Row>(`SELECT l.id, l.lead_no, l.name, l.status, l.kw, l.final_kw, l.bill, l.quote_amount, l.final_amount, l.subsidy_applied,
          d.name_en AS district, s.name AS owner, s.active AS owner_active,
          COALESCE((SELECT MAX(a.created_at) FROM lead_activity a WHERE a.lead_id = l.id AND a.action = 'status_changed'), l.created_at) AS stage_since
        FROM leads l LEFT JOIN districts d ON d.id = l.district_id LEFT JOIN staff s ON s.id = l.assigned_to
        WHERE ${w} ORDER BY l.created_at DESC`, params),
      q<{ status: LeadStatus; n: number; kw: string | null }>(`SELECT l.status, COUNT(*) AS n, SUM(COALESCE(l.final_kw, l.kw, 0)) AS kw FROM leads l WHERE ${w} GROUP BY l.status`, params),
      loadStages(),
    ]);
  } catch {
    return <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">The pipeline couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>;
  }

  const now = Date.now();
  const perCol: Record<string, number> = {};
  const cards: PipeCard[] = [];
  for (const r of rows) {
    perCol[r.status] = (perCol[r.status] ?? 0) + 1;
    if (perCol[r.status] > PER_COLUMN) continue;
    cards.push({
      id: r.id, leadNo: r.lead_no, name: r.name, status: r.status, kw: r.final_kw !== null ? Number(r.final_kw) : r.kw !== null ? Number(r.kw) : null,
      district: r.district, bill: r.bill, owner: r.owner, ownerInactive: r.owner !== null && !r.owner_active,
      days: Math.floor((now - new Date(r.stage_since).getTime()) / 86400_000),
      amount: r.final_amount ?? r.quote_amount, subsidy: r.subsidy_applied === null ? null : Boolean(r.subsidy_applied),
    });
  }
  const totals = Object.fromEntries(STATUSES.map((s) => {
    const c = counts.find((x) => x.status === s);
    return [s, { count: Number(c?.n ?? 0), kw: Math.round(Number(c?.kw ?? 0) * 10) / 10 }];
  })) as Record<LeadStatus, { count: number; kw: number }>;

  // Hidden stages still show while leads are in them, so nobody loses a lead.
  const columns: PipeColumn[] = stages
    .filter((s) => s.visible || totals[s.key].count > 0)
    .map((s) => ({ key: s.key, hidden: !s.visible, shown: Math.min(totals[s.key].count, PER_COLUMN) }));

  if (!rows.length) {
    const filtered = f.owner || f.district;
    return (
      <div className="rounded-2xl border border-dashed border-[#e2dccb] bg-white px-6 py-16 text-center">
        <p className="font-heading text-lg font-bold">{filtered ? "No leads match these filters" : "No leads here yet"}</p>
        <p className="mt-1 text-[#4b5b75]">
          {ownLeadsOnly(staff.role) ? "No leads are assigned to you yet." : filtered ? "Try another owner or district, or turn on “Include test data”." : "New website enquiries will appear in the first column."}
        </p>
      </div>
    );
  }
  return <PipelineBoard cards={cards} totals={totals} columns={columns} canEdit={can(staff.role, "leads.edit")} />;
}

function BoardSkeleton() {
  return (
    <div role="status" aria-label="Loading pipeline" className="flex animate-pulse gap-4 overflow-hidden">
      {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-96 w-72 shrink-0 rounded-2xl bg-white" />)}
    </div>
  );
}
