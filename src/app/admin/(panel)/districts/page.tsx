import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, EyeOff, Pencil } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { q } from "@/lib/admin/db";
import { PageHeader } from "@/components/admin/ui";
import { DISTRICT_BLOCKS, districtCompleteness } from "@/lib/admin/district-content";

export const metadata: Metadata = { title: "Districts" };
export const dynamic = "force-dynamic";

type Row = Record<string, unknown> & { slug: string; name_en: string; name_te: string; discom: string; region: string | null; published: number; leads: number; won: number; schemes: number };

export default async function DistrictsPage() {
  await requireStaff("districts.edit");
  let rows: Row[] | null = null;
  try {
    rows = await q<Row>(`SELECT d.slug, d.name_en, d.name_te, d.discom, d.region, d.published,
        (SELECT COUNT(*) FROM leads l WHERE l.district_id = d.id AND l.deleted_at IS NULL AND l.is_test = 0) AS leads,
        (SELECT COUNT(*) FROM leads l WHERE l.district_id = d.id AND l.deleted_at IS NULL AND l.is_test = 0 AND l.status = 'won') AS won,
        (SELECT COUNT(*) FROM scheme_districts sd WHERE sd.district_id = d.id) AS schemes,
        ${DISTRICT_BLOCKS.flatMap((b) => [`d.${b.key}_en`, `d.${b.key}_te`]).join(", ")}
      FROM districts d ORDER BY d.sort_order, d.name_en`);
  } catch { rows = null; }

  return (
    <>
      <PageHeader title="Districts" subtitle="All 33 districts of Telangana. Lead counts exclude test data." />
      <p className="mb-4 rounded-xl border border-[#f5d27a] bg-[#fff8e6] px-4 py-3 text-sm text-gold-ink">
        <b>VERIFY:</b> the DISCOM for each district follows the usual TGSPDCL (south) / TGNPDCL (north) split. Border areas can differ. Check with the DISCOM and correct it here.
      </p>
      {rows === null ? (
        <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">Districts couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>
      ) : !rows.length ? (
        <p className="rounded-2xl border border-dashed border-[#e2dccb] bg-white p-8 text-center text-[#4b5b75]">No districts yet. Run <code>npm run db:seed:districts</code>.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#ece4cf] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf7ef] text-xs uppercase tracking-wide text-[#4b5b75]">
              <tr>{["District", "Telugu", "DISCOM", "Region", "Leads", "Won", "Schemes", "Published", ""].map((h, i) => <th key={i} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">{h || <span className="sr-only">Edit</span>}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.slug} className="border-t border-[#f1ece0] hover:bg-[#fffbf2]">
                  <th scope="row" className="px-4 py-3 font-semibold">{d.name_en}<Filled row={d} /></th>
                  <td className="px-4 py-3">{d.name_te}</td>
                  <td className="px-4 py-3"><span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${d.discom === "TGSPDCL" ? "bg-[#e8f0fe] text-[#1a4fa0]" : "bg-[#fff3d1] text-gold-ink"}`}>{d.discom}</span></td>
                  <td className="px-4 py-3 text-[#4b5b75]">{d.region ?? "-"}</td>
                  <td className="px-4 py-3"><Link href={`/admin/leads?district=${d.slug}`} className="font-semibold hover:underline">{d.leads}</Link></td>
                  <td className="px-4 py-3 font-semibold text-success">{d.won}</td>
                  <td className="px-4 py-3">{d.schemes}</td>
                  <td className="px-4 py-3">{d.published ? <span className="inline-flex items-center gap-1 text-success"><CircleCheck className="size-4" aria-hidden />Yes</span> : <span className="inline-flex items-center gap-1 text-[#5b6473]"><EyeOff className="size-4" aria-hidden />Hidden</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/districts/${d.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e2dccb] px-3 font-semibold text-[#1a2b57] hover:bg-[#faf7ef]"><Pencil className="size-4" aria-hidden />Edit<span className="sr-only"> {d.name_en}</span></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Filled({ row }: { row: Record<string, unknown> }) {
  const c = districtCompleteness(row);
  const tone = c.done === c.total ? (c.teMissing ? "bg-[#fff3d1] text-[#8a5a00]" : "bg-[#e7f5e4] text-success") : c.done === 0 ? "bg-[#f1f2f4] text-[#5b6473]" : "bg-[#fff3d1] text-[#8a5a00]";
  return (
    <span title={c.teMissing ? `Telugu missing in ${c.teMissing} field(s)` : undefined} className={`ml-2 rounded px-1.5 py-px text-[0.68rem] font-bold ${tone}`}>
      {c.done}/{c.total} fields{c.teMissing ? " · TE" : ""}
    </span>
  );
}
