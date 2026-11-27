import type { Metadata } from "next";
import { Suspense } from "react";
import { requireStaff } from "@/lib/admin/auth";
import { q } from "@/lib/admin/db";
import { SCHEME_NAMES } from "@/lib/admin/scheme-names";
import { toDto } from "@/lib/admin/lead-dto";
import { PAGE_SIZE, filterToParams, listLeads, parseFilter, type LeadFilter } from "@/lib/admin/leads-query";
import { can, ownLeadsOnly } from "@/lib/admin/roles";
import type { Staff } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { LeadFilters, type FilterOptions } from "@/components/admin/leads/lead-filters";
import { LeadTable } from "@/components/admin/leads/lead-table";
import { LeadFormButton } from "@/components/admin/leads/lead-form";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

async function options(): Promise<FilterOptions> {
  const [districts, staff, places] = await Promise.all([
    q<{ slug: string; name_en: string; name_te: string }>("SELECT slug, name_en, name_te FROM districts ORDER BY name_en"),
    q<{ id: number; name: string; active: number }>("SELECT id, name, active FROM staff WHERE role IN ('admin','sales') ORDER BY active DESC, name"),
    q<{ place: string }>("SELECT DISTINCT place FROM leads WHERE place IS NOT NULL AND place <> '' AND deleted_at IS NULL ORDER BY place LIMIT 200"),
  ]);
  return { districts, staff, places: places.map((p) => p.place), schemes: Object.entries(SCHEME_NAMES).map(([slug, n]) => ({ slug, name: n.en })) };
}

/** Form options load separately so the header button works even while the table is loading. */
async function formOptions() {
  try { const o = await options(); return { districts: o.districts, staff: o.staff, schemes: o.schemes }; }
  catch { return null; }
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const staff = await requireStaff("leads.view");
  const f = parseFilter(await searchParams);
  const key = filterToParams(f).toString();
  const formOpts = can(staff.role, "leads.create") ? await formOptions() : null;
  const own = ownLeadsOnly(staff.role);
  return (
    <>
      <PageHeader title="Leads" subtitle={own ? "Leads assigned to you, newest first." : "Every enquiry from the website, phone and WhatsApp, newest first."}>
        {formOpts && <LeadFormButton mode="create" options={formOpts} canAssign={can(staff.role, "leads.assign")} staffId={staff.id} />}
      </PageHeader>
      <Suspense key={key} fallback={<TableSkeleton />}>
        <LeadsBody f={f} staff={staff} />
      </Suspense>
    </>
  );
}

async function LeadsBody({ f, staff }: { f: LeadFilter; staff: Staff }) {
  let data: { rows: Awaited<ReturnType<typeof listLeads>>["rows"]; total: number; opts: FilterOptions };
  try {
    const [list, opts] = await Promise.all([listLeads(f, staff), options()]);
    data = { ...list, opts };
  } catch {
    return (
      <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">
        Leads couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.
      </p>
    );
  }
  const now = new Date();
  return (
    <div className="space-y-5">
      <LeadFilters options={data.opts} isAdmin={staff.role === "admin"} canExport={can(staff.role, "leads.export")} total={data.total} />
      <LeadTable rows={data.rows.map((r) => toDto(r, now))} staffId={staff.id} qs={filterToParams(f, { page: 1 }).toString()}
        tab={f.tab} page={f.page} total={data.total} pageSize={PAGE_SIZE} canEdit={can(staff.role, "leads.edit")}
        canAssign={can(staff.role, "leads.assign")} owners={data.opts.staff} />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div role="status" aria-label="Loading leads" className="animate-pulse space-y-4">
      <div className="h-11 w-72 rounded-2xl bg-white" />
      <div className="h-11 rounded-xl bg-white" />
      <div className="space-y-2 rounded-2xl bg-white p-4">
        {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-10 rounded-lg bg-[#f4efe2]" />)}
      </div>
    </div>
  );
}
