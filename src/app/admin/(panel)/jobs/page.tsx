import type { Metadata } from "next";
import { CalendarDays, MapPin, Phone } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { q } from "@/lib/admin/db";
import { kwLabel } from "@/lib/admin/labels";
import { dateIst } from "@/lib/admin/time";
import { DeniedBanner, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Installer jobs" };
export const dynamic = "force-dynamic";

type Job = { id: number; lead_no: string; name: string | null; phone: string | null; district: string | null; district_te: string | null; area: string | null; final_kw: string | null; install_date: Date | string | null; is_test: number };

/** Installers see ONLY this: won jobs from the installer_jobs view (no money, notes or other leads). */
export default async function JobsPage({ searchParams }: { searchParams: Promise<{ denied?: string; test?: string }> }) {
  await requireStaff("installer.jobs");
  const sp = await searchParams;
  const test = sp.test === "1";
  let jobs: Job[] | null = null;
  try {
    jobs = await q<Job>(`SELECT id, lead_no, name, phone, district, district_te, area, final_kw, install_date, is_test FROM installer_jobs
      ${test ? "" : "WHERE is_test = 0"} ORDER BY install_date IS NULL, install_date, id DESC LIMIT 500`);
  } catch { jobs = null; }

  const ymd = (d: Date | string | null) => (d ? (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10) : null);
  const today = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);

  return (
    <>
      {sp.denied && <DeniedBanner />}
      <PageHeader title="Installer jobs" subtitle="Won jobs ready to install, soonest first.">
        <a href={test ? "/admin/jobs" : "/admin/jobs?test=1"} className="text-sm font-semibold text-[#1a2b57] underline-offset-4 hover:underline">{test ? "Hide test data" : "Include test data"}</a>
      </PageHeader>
      {jobs === null ? (
        <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">Jobs couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e2dccb] bg-white px-6 py-16 text-center">
          <p className="font-heading text-lg font-bold">No jobs yet</p>
          <p className="mt-1 text-[#4b5b75]">When a lead is marked Won it shows up here.</p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {jobs.map((j) => {
            const d = ymd(j.install_date);
            const past = d !== null && d < today;
            return (
              <li key={j.id} className="rounded-2xl border border-l-4 border-[#ece4cf] border-l-[#2b7a23] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg font-bold">{j.name ?? "Customer"}</p>
                    <p className="font-mono text-xs text-gold-ink">{j.lead_no}{j.is_test ? " · test" : ""}</p>
                  </div>
                  <span className="rounded-full bg-[#e7f5e4] px-3 py-1 text-sm font-bold text-success">{kwLabel(j.final_kw)}</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2"><MapPin className="size-4 text-[#8a94a6]" aria-hidden />{[j.area, j.district].filter(Boolean).join(", ") || "Location not set"}{j.district_te && <span className="text-[#8a94a6]">· {j.district_te}</span>}</li>
                  <li className={`flex items-center gap-2 ${past ? "text-[#4b5b75]" : "font-semibold"}`}><CalendarDays className="size-4 text-[#8a94a6]" aria-hidden />{d ? `Install ${dateIst(`${d}T00:00:00+05:30`)}` : "Install date not set"}</li>
                </ul>
                {j.phone && (
                  <a href={`tel:${j.phone.replace(/[^\d+]/g, "")}`} className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white outline-none hover:bg-navy-800 focus-visible:ring-4 focus-visible:ring-gold/40">
                    <Phone className="size-4" aria-hidden />Call {j.phone}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
