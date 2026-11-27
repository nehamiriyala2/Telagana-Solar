import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, TriangleAlert } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { q } from "@/lib/admin/db";
import { LOST_LABEL, ROOF_LABEL, SOURCE_LABEL, USE_LABEL, inr, kwLabel, type LeadStatus, type LostReason } from "@/lib/admin/labels";
import { SCHEME_NAMES, schemeName } from "@/lib/admin/scheme-names";
import { HttpError, duplicatesFor, getLead } from "@/lib/admin/lead-service";
import { describeActivity, type ActivityRow } from "@/lib/admin/activity";
import { loadStages } from "@/lib/admin/stages-store";
import { stageLabels } from "@/lib/admin/stages";
import { filterToParams, neighbours, parseFilter, parseSchemes } from "@/lib/admin/leads-query";
import { waLink } from "@/lib/admin/phone";
import { can } from "@/lib/admin/roles";
import { pickTemplate, renderTemplate } from "@/lib/admin/templates";
import { dateIst, fullIst, utcToIstLocal } from "@/lib/admin/time";
import { Card } from "@/components/admin/ui";
import { LeadBadges, StatusPill, SystemChip } from "@/components/admin/lead-bits";
import { StatusControl } from "@/components/admin/leads/status-control";
import { DealCard } from "@/components/admin/leads/deal-card";
import { NotesPanel } from "@/components/admin/leads/notes-panel";
import { AdminLeadActions } from "@/components/admin/leads/admin-actions";
import { ContactActions } from "@/components/admin/leads/contact-actions";
import { LeadFormButton, type LeadFormValues } from "@/components/admin/leads/lead-form";
import { LeadFollowUps, type LeadFu } from "@/components/admin/leads/lead-follow-ups";
import { leadFollowUps } from "@/lib/admin/follow-ups";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return { title: `Lead TS-${String((await params).id).padStart(4, "0")}` };
}

export default async function LeadPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const staff = await requireStaff("leads.view");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const sp = await searchParams;
  const f = parseFilter(sp);
  // Neighbours follow the list's filter, but a lead opened directly (e.g. a test lead) should still be reachable.
  let lead;
  try { lead = await getLead(id, staff); } catch (e) { if (e instanceof HttpError) notFound(); throw e; }

  const [notes, activity, staffList, templates, nb, districts, dups, stages, fus] = await Promise.all([
    q<{ id: number; body: string; created_at: Date; updated_at: Date | null; staff_id: number | null; author: string | null }>(
      "SELECT n.id, n.body, n.created_at, n.updated_at, n.staff_id, s.name AS author FROM lead_notes n LEFT JOIN staff s ON s.id = n.staff_id WHERE n.lead_id = ? ORDER BY n.created_at DESC", [id]),
    q<ActivityRow>("SELECT a.id, a.action, a.details, a.created_at, s.name AS staff_name FROM lead_activity a LEFT JOIN staff s ON s.id = a.staff_id WHERE a.lead_id = ? ORDER BY a.created_at DESC, a.id DESC LIMIT 200", [id]),
    q<{ id: number; name: string; active: number }>("SELECT id, name, active FROM staff WHERE role IN ('admin','sales') AND (active = 1 OR id = ?) ORDER BY name", [lead.assigned_to ?? 0]),
    q<{ key: string; lang: string; body: string; active: number }>("SELECT `key`, lang, body, active FROM wa_templates WHERE `key` = 'welcome'"),
    neighbours(id, lead.created_at, { ...f, test: f.test || Boolean(lead.is_test), deleted: f.deleted || Boolean(lead.deleted_at) }, staff),
    q<{ slug: string; name_en: string; name_te: string }>("SELECT slug, name_en, name_te FROM districts ORDER BY name_en"),
    duplicatesFor([lead.phone_normalized, lead.alt_phone_normalized], id, staff),
    loadStages(),
    leadFollowUps(id),
  ]);
  const labels = stageLabels(stages);
  const nowMs = Date.now();
  const fuItems: LeadFu[] = fus.map((f) => ({
    id: f.id, type: f.type as LeadFu["type"], note: f.note, status: f.status, due: fullIst(f.due_at), dueLocal: utcToIstLocal(f.due_at),
    overdue: f.status === "open" && new Date(f.due_at).getTime() < nowMs, outcome: f.outcome, outcomeNote: f.outcome_note,
    done: f.done_at ? fullIst(f.done_at) : null, doneBy: f.done_by_name, createdBy: f.created_by_name,
  }));

  const qs = filterToParams(f, { page: 1 }).toString();
  const listHref = `/admin/leads${qs ? `?${qs}` : ""}`;
  const leadHref = (lid: number) => `/admin/leads/${lid}${qs ? `?${qs}` : ""}`;
  const schemes = parseSchemes(lead.schemes);
  const waText = renderTemplate(pickTemplate("welcome", lead.lang, templates), {
    name: lead.name, kw: lead.kw ? kwLabel(Number(lead.kw)) : null, district: lead.district_en, area: lead.area, phone: lead.phone_normalized,
  });
  const canEdit = can(staff.role, "leads.edit") && !lead.deleted_at;
  const formValues: LeadFormValues = {
    name: lead.name ?? "", phone: lead.phone_normalized ?? "", alt_phone: lead.alt_phone_normalized ?? "", email: lead.email ?? "",
    district: lead.district_slug ?? "", area: lead.area ?? "", address: lead.address ?? "", use_type: lead.use_type ?? "",
    bill: lead.bill === null ? "" : String(lead.bill), units: lead.units === null ? "" : String(lead.units), roof: lead.roof ?? "",
    roof_area_sqft: lead.roof_area_sqft === null ? "" : String(lead.roof_area_sqft), schemes: schemes, source: lead.source ?? "call",
    status: lead.status, assigned_to: lead.assigned_to ? String(lead.assigned_to) : "", note: "", is_test: Boolean(lead.is_test),
  };
  const formOptions = { districts, staff: staffList, schemes: Object.entries(SCHEME_NAMES).map(([slug, n]) => ({ slug, name: n.en })) };
  const leadNo = lead.lead_no ?? `TS-${String(id).padStart(4, "0")}`;
  const dto = {
    repeat: Number(lead.repeat_count) > 0, powerCuts: lead.power_cuts === null ? null : Boolean(lead.power_cuts), roof: lead.roof,
    isTest: Boolean(lead.is_test), deleted: Boolean(lead.deleted_at), anonymized: Boolean(lead.anonymized_at),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={listHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a2b57] hover:underline"><ArrowLeft className="size-4" aria-hidden />All leads</Link>
        <nav aria-label="Lead navigation" className="flex gap-2">
          {nb.prev ? <Link href={leadHref(nb.prev)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm font-semibold hover:bg-[#faf7ef]"><ChevronLeft className="size-4" aria-hidden />Previous</Link>
            : <span className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#eee8da] px-3 text-sm font-semibold text-[#b5bcc8]" aria-disabled="true"><ChevronLeft className="size-4" aria-hidden />Previous</span>}
          {nb.next ? <Link href={leadHref(nb.next)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm font-semibold hover:bg-[#faf7ef]">Next<ChevronRight className="size-4" aria-hidden /></Link>
            : <span className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#eee8da] px-3 text-sm font-semibold text-[#b5bcc8]" aria-disabled="true">Next<ChevronRight className="size-4" aria-hidden /></span>}
        </nav>
      </div>

      {/* Header */}
      <Card className={lead.status === "new" ? "border-l-4 border-l-gold" : ""}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold text-gold-ink">{leadNo}</p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold sm:text-3xl">{lead.name ?? (lead.anonymized_at ? "Anonymized lead" : "No name given")}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusPill status={lead.status} />
              {lead.status === "lost" && lead.lost_reason && <span className="text-sm text-[#4b5b75]">Reason: {LOST_LABEL[lead.lost_reason as LostReason]}</span>}
              <LeadBadges l={dto} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ContactActions id={id} phone={lead.phone_normalized} waUrl={lead.phone_normalized ? waLink(lead.phone_normalized, waText) : null} canLog={canEdit} />
            {canEdit && lead.phone_normalized && <LeadFormButton mode="edit" variant="outline" leadId={id} initial={formValues} options={formOptions} canAssign={false} staffId={staff.id} />}
            {canEdit && <StatusControl id={id} status={lead.status} lostReason={lead.lost_reason} name={lead.name ?? leadNo}
              won={{ kw: lead.final_kw !== null ? Number(lead.final_kw) : lead.kw !== null ? Number(lead.kw) : null, amount: lead.final_amount ?? lead.quote_amount, subsidy: lead.subsidy_applied === null ? null : Boolean(lead.subsidy_applied) }} />}
          </div>
        </div>
      </Card>

      {dups.length > 0 && (
        <p role="note" className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-[#f5d27a] bg-[#fff8e6] px-4 py-3 text-sm">
          <TriangleAlert className="size-4 text-[#8a5a00]" aria-hidden /><span className="font-bold text-[#8a5a00]">Same phone number as:</span>
          {dups.map((d, i) => (
            <span key={d.id}><Link href={leadHref(d.id)} className="font-semibold text-navy hover:underline">{d.lead_no}</Link> ({d.name ?? "No name"}, {labels[d.status as LeadStatus] ?? d.status}){i < dups.length - 1 ? "," : ""}</span>
          ))}
          {staff.role === "admin" && <span className="text-[#4b5b75]">Use “Merge” on the right to combine them.</span>}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="Customer" rows={[
              ["Name", lead.name], ["Phone", lead.phone_normalized ? lead.phone_normalized.replace(/(\d{5})(\d{5})/, "$1 $2") : lead.phone],
              ["Alternate phone", lead.alt_phone_normalized ? <a key="alt" href={`tel:+91${lead.alt_phone_normalized}`} className="hover:underline">{lead.alt_phone_normalized.replace(/(\d{5})(\d{5})/, "$1 $2")}</a> : null],
              ["Email", lead.email ? <a key="em" href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a> : null],
              ["District", lead.district_en ? `${lead.district_en} · ${lead.district_te}${lead.discom ? ` (${lead.discom})` : ""}` : null],
              ["Area", lead.area], ["Address", lead.address], ["Place", lead.place], ["Property type", lead.use_type ? USE_LABEL[lead.use_type] ?? lead.use_type : null],
              ["Language", lead.lang === "te" ? "Telugu (తెలుగు)" : lead.lang === "en" ? "English" : null],
            ]} />
            <InfoCard title="Energy use" rows={[
              ["Monthly bill", lead.bill === null ? null : inr(lead.bill)], ["Units per month", lead.units === null ? null : `${lead.units} kWh`],
              ["Power cuts", lead.power_cuts === null ? null : lead.power_cuts ? "Yes (needs backup)" : "No"],
              ["Roof", lead.roof ? ROOF_LABEL[lead.roof] ?? lead.roof : null],
              ["Roof area", lead.roof_area_sqft === null ? null : `${lead.roof_area_sqft.toLocaleString("en-IN")} sq ft`],
            ]} />
            <InfoCard title="Plan shown on website" rows={[
              ["System size", lead.kw === null ? null : kwLabel(Number(lead.kw))],
              ["System type", lead.system_type ? <SystemChip key="s" system={lead.system_type} /> : null],
              ["Monthly saving", lead.monthly_saving === null ? null : <span key="m">{inr(lead.monthly_saving)}<span className="text-xs text-[#8a94a6]"> (shown on website)</span></span>],
              ["Schemes", schemes.length ? <span key="sc" className="flex flex-wrap justify-end gap-1">{schemes.map((s) => <span key={s} className="rounded bg-[#e7f5e4] px-1.5 py-px text-xs font-semibold text-[#2b7a23]">{schemeName(s)}</span>)}</span> : null],
            ]} />
            <InfoCard title="Where it came from" rows={[
              ["Received", fullIst(lead.created_at)], ["Source", SOURCE_LABEL[lead.source ?? ""] ?? lead.source],
              ["Page", lead.page ? <span key="p" className="font-mono text-xs">{lead.page}</span> : null],
              ["Message", lead.message ? <span key="msg" className="whitespace-pre-wrap text-left">{lead.message}</span> : null],
              ["UTM source", lead.utm_source], ["UTM campaign", lead.utm_campaign], ["Referrer", lead.referrer], ["Lead no", leadNo],
            ]} />
          </div>

          <NotesPanel leadId={id} canAdd={canEdit} staffId={staff.id} isAdmin={staff.role === "admin"}
            notes={notes.map((n) => ({ id: n.id, body: n.body, author: n.author, staffId: n.staff_id, at: fullIst(n.created_at), edited: Boolean(n.updated_at) }))} />

          <Card>
            <h2 className="font-heading text-lg font-bold">Timeline</h2>
            {activity.length ? (
              <ol className="mt-4 space-y-4 border-l-2 border-[#f1ece0] pl-5">
                {activity.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-gold ring-4 ring-white" aria-hidden />
                    <p className="text-[0.95rem]">{describeActivity(a, labels)}</p>
                    <p className="text-xs text-[#8a94a6]">{fullIst(a.created_at)} · {a.staff_name ?? "System"}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-3 text-[#4b5b75]">No activity yet.</p>}
          </Card>
        </div>

        <aside className="space-y-6">
          <LeadFollowUps leadId={id} items={fuItems} canEdit={canEdit} />
          <DealCard id={id} canEdit={canEdit} staff={staffList} initial={{
            assigned_to: lead.assigned_to, site_visit_at: utcToIstLocal(lead.site_visit_at),
            final_kw: lead.final_kw === null ? "" : String(Number(lead.final_kw)), quote_amount: lead.quote_amount === null ? "" : String(lead.quote_amount), final_amount: lead.final_amount === null ? "" : String(lead.final_amount),
            subsidy_applied: lead.subsidy_applied === null ? null : Boolean(lead.subsidy_applied), loan_needed: lead.loan_needed === null ? null : Boolean(lead.loan_needed),
            install_date: lead.install_date ? (lead.install_date instanceof Date ? lead.install_date.toISOString() : String(lead.install_date)).slice(0, 10) : "",
          }} wonAt={lead.won_at ? dateIst(lead.won_at) : null} />
          {staff.role === "admin" && (
            <AdminLeadActions id={id} leadNo={leadNo} deleted={Boolean(lead.deleted_at)} anonymized={Boolean(lead.anonymized_at)} listHref={listHref} />
          )}
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ title, rows }: { title: string; rows: [string, React.ReactNode][] }) {
  return (
    <Card className="!p-5">
      <h2 className="font-heading text-base font-bold">{title}</h2>
      <dl className="mt-3 divide-y divide-[#f1ece0] text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 py-2">
            <dt className="shrink-0 text-[#4b5b75]">{k}</dt>
            <dd className="min-w-0 break-words text-right font-medium">{v === null || v === undefined || v === "" ? <span className="text-[#a0a8b6]">-</span> : v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
