import type { Metadata } from "next";
import { Suspense } from "react";
import { requireStaff, type Staff } from "@/lib/admin/auth";
import { q } from "@/lib/admin/db";
import { listFollowUps, parseListFilter, tabCounts, type ListFilter } from "@/lib/admin/follow-ups";
import { dueLabel, followUpTemplate } from "@/lib/admin/kpi";
import { kwLabel } from "@/lib/admin/labels";
import { waLink } from "@/lib/admin/phone";
import { can, ownLeadsOnly } from "@/lib/admin/roles";
import { pickTemplate, renderTemplate } from "@/lib/admin/templates";
import { fullIst, receivedLabel, utcToIstLocal } from "@/lib/admin/time";
import { PageHeader } from "@/components/admin/ui";
import { FollowUpBoard, FollowUpFilters, FollowUpTabs, type FuItem } from "@/components/admin/follow-up-list";

export const metadata: Metadata = { title: "Follow-ups" };
export const dynamic = "force-dynamic";

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const staff = await requireStaff("followups.view");
  const f = parseListFilter(await searchParams, staff);
  const owners = ownLeadsOnly(staff.role) ? [] : await q<{ id: number; name: string; active: number }>("SELECT id, name, active FROM staff WHERE role IN ('admin','sales') ORDER BY active DESC, name").catch(() => []);
  let counts: Awaited<ReturnType<typeof tabCounts>> | null = null;
  try { counts = await tabCounts(f, staff); } catch { counts = null; }
  return (
    <>
      <PageHeader title="Follow-ups" subtitle={ownLeadsOnly(staff.role) ? "Your calls, WhatsApps and visits. Times are India time (IST)." : "Every planned call, WhatsApp and visit, by person. Times are India time (IST)."} />
      <FollowUpFilters owners={owners} canPickOwner={!ownLeadsOnly(staff.role)} staffId={staff.id} />
      {counts ? <FollowUpTabs active={f.tab} counts={counts} /> : null}
      <Suspense key={JSON.stringify(f)} fallback={<div role="status" aria-label="Loading follow-ups" className="mt-5 h-96 animate-pulse rounded-2xl bg-white" />}>
        <List staff={staff} f={f} />
      </Suspense>
    </>
  );
}

async function List({ staff, f }: { staff: Staff; f: ListFilter }) {
  let rows, templates: { key: string; lang: string; body: string; active: number }[];
  try {
    [rows, templates] = await Promise.all([
      listFollowUps(f, staff),
      q<{ key: string; lang: string; body: string; active: number }>("SELECT `key`, lang, body, active FROM wa_templates WHERE `key` IN ('day1','day3','day7')"),
    ]);
  } catch {
    return <p role="alert" className="mt-5 rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">Follow-ups couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>;
  }
  const now = new Date();
  const items: FuItem[] = rows.map((r) => {
    const text = renderTemplate(pickTemplate(followUpTemplate(new Date(r.created_at), now), r.lang, templates), {
      name: r.name, kw: r.kw ? kwLabel(Number(r.kw)) : null, district: r.district, area: r.area, phone: r.phone_normalized,
    });
    const due = new Date(r.due_at);
    return {
      id: r.id, leadId: r.lead_id, leadNo: r.lead_no, name: r.name, phone: r.phone_normalized,
      place: [r.district, r.area].filter(Boolean).join(" / ") || null,
      ownerId: r.owner_id, owner: r.owner, ownerInactive: r.owner !== null && !r.owner_active, leadStatus: r.lead_status,
      type: r.type as FuItem["type"], note: r.note, status: r.status,
      due: r.status === "none" ? `Came in ${receivedLabel(r.created_at, now)}` : dueLabel(due, now), dueFull: fullIst(due), dueLocal: utcToIstLocal(due),
      outcome: r.outcome, outcomeNote: r.outcome_note, doneAt: r.done_at ? fullIst(r.done_at) : null, doneBy: r.done_by_name,
      waHref: r.phone_normalized ? waLink(r.phone_normalized, text) : null,
    };
  });
  const grouped = !ownLeadsOnly(staff.role) && !f.owner && f.tab !== "done";
  return <FollowUpBoard tab={f.tab} items={items} grouped={grouped} canEdit={can(staff.role, "leads.edit")} />;
}
