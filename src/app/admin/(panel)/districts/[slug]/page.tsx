import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { one, q } from "@/lib/admin/db";
import { fullIst } from "@/lib/admin/time";
import { PageHeader } from "@/components/admin/ui";
import { DistrictForm, type DistrictValues } from "@/components/admin/district-form";
import { DISTRICT_BLOCKS } from "@/lib/admin/district-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit district" };

export default async function DistrictEditPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireStaff("districts.edit");
  const { slug } = await params;
  if (!/^[a-z-]{2,60}$/.test(slug)) notFound();
  const d = await one<Record<string, unknown> & { id: number; slug: string; name_en: string; name_te: string; discom: "TGSPDCL" | "TGNPDCL"; region: string | null; hero_image: string | null; published: number }>(
    "SELECT * FROM districts WHERE slug = ?", [slug]);
  if (!d) notFound();
  const [schemes, links, last] = await Promise.all([
    q<{ id: number; name_en: string; status: string }>("SELECT id, name_en, status FROM schemes WHERE deleted_at IS NULL ORDER BY id"),
    q<{ scheme_id: number }>("SELECT scheme_id FROM scheme_districts WHERE district_id = ?", [d.id]),
    one<{ changed_at: Date; name: string | null }>("SELECT h.changed_at, s.name FROM settings_history h LEFT JOIN staff s ON s.id = h.changed_by WHERE h.`key` = ? ORDER BY h.id DESC LIMIT 1", [`district:${slug}`]),
  ]);
  return (
    <>
      <Link href="/admin/districts" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a2b57] hover:underline"><ArrowLeft className="size-4" aria-hidden />All districts</Link>
      <PageHeader title={`${d.name_en} · ${d.name_te}`} subtitle={last ? `Last changed by ${last.name ?? "former staff"} · ${fullIst(last.changed_at)}` : "Not edited yet."} />
      <DistrictForm slug={d.slug} schemes={schemes} initial={{
        name_en: d.name_en, name_te: d.name_te, discom: d.discom, region: d.region ?? "",
        ...Object.fromEntries(DISTRICT_BLOCKS.flatMap((b) => [`${b.key}_en`, `${b.key}_te`]).map((k) => [k, String(d[k] ?? "")])),
        hero_image: d.hero_image ?? "", published: Boolean(d.published), scheme_ids: links.map((l) => l.scheme_id),
      } as DistrictValues} />
    </>
  );
}
