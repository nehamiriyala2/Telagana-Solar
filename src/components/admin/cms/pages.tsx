import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { q } from "@/lib/admin/db";
import { can } from "@/lib/admin/roles";
import { emptyValues } from "@/lib/admin/cms/schema";
import { getRow, listRows, type ListRow } from "@/lib/admin/cms/store";
import type { CollectionDef } from "@/lib/admin/cms/types";
import { HttpError } from "@/lib/admin/lead-service";
import { receivedLabel } from "@/lib/admin/time";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/cms/entity-form";
import { EntityList, type ListItem } from "@/components/admin/cms/entity-list";

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

/** Short meta line per collection on the list. */
function meta(c: CollectionDef, r: ListRow): string | null {
  const x = r.raw;
  if (c.key === "projects") return [x.kw ? `${Number(x.kw)} kW` : null, x.area ? String(x.area) : null, x.featured ? "Featured" : null].filter(Boolean).join(" · ") || null;
  if (c.key === "schemes") return r.slug ? `/schemes/${r.slug}` : null;
  if (c.key === "posts") return [x.kind === "news" ? "News" : "Guide", r.slug ? `/guides/${r.slug}` : null].filter(Boolean).join(" · ");
  if (c.key === "testimonials") return [x.place, x.type].filter(Boolean).map(String).join(" · ") || null;
  if (c.key === "faqs") return `Order ${x.sort_order ?? 0}`;
  return null;
}

/** Server list page for any collection (search/filter via the URL). */
export async function CmsList({ c, sp, children }: { c: CollectionDef; sp: Record<string, string | undefined>; children?: React.ReactNode }) {
  const staff = await requireStaff(c.perm);
  return (
    <>
      <PageHeader title={c.plural} subtitle={c.intro} />
      {children}
      <Suspense key={JSON.stringify(sp)} fallback={<div role="status" aria-label={`Loading ${c.plural}`} className="h-72 animate-pulse rounded-2xl bg-white" />}>
        <ListBody c={c} sp={sp} canEdit={can(staff.role, c.perm)} />
      </Suspense>
    </>
  );
}

async function ListBody({ c, sp, canEdit }: { c: CollectionDef; sp: Record<string, string | undefined>; canEdit: boolean }) {
  let rows: ListRow[], total: number;
  try {
    const state = (["published", "draft"].includes(sp.state ?? "") ? sp.state : "all") as "all" | "published" | "draft";
    [rows, total] = await Promise.all([
      listRows(c, { q: (sp.q ?? "").trim().slice(0, 80), state }),
      q<{ n: number }>(`SELECT COUNT(*) AS n FROM \`${c.table}\`${c.hasDeletedAt ? " WHERE deleted_at IS NULL" : ""}`).then((r) => Number(r[0]?.n ?? 0)),
    ]);
  } catch {
    return <p role="alert" className="rounded-2xl border border-[#f3c9c5] bg-[#fdecea] p-6 text-danger">{c.plural} couldn’t load. If you’re on XAMPP, check that MySQL is running, then refresh.</p>;
  }
  const thumbs = c.key === "projects" && rows.length
    ? new Map((await q<{ project_id: number; thumb_path: string }>(`SELECT project_id, thumb_path FROM project_photos WHERE project_id IN (${rows.map(() => "?").join(",")}) ORDER BY is_cover DESC, sort_order`, rows.map((r) => r.id))).reverse().map((p) => [p.project_id, p.thumb_path]))
    : null;
  const now = new Date();
  const items: ListItem[] = rows.map((r) => ({
    id: r.id, title: r.title, subtitle: r.subtitle, published: r.published, flags: r.flags, meta: meta(c, r),
    updated: r.updatedAt ? receivedLabel(r.updatedAt, now) : null,
    thumb: thumbs ? thumbs.get(r.id) ?? "" : c.key === "posts" ? (r.raw.cover_image as string) || "" : null,
  }));
  return <EntityList collection={c.key} label={c.label} plural={c.plural} basePath={c.basePath} items={items} canEdit={canEdit} total={total} />;
}

/** Server edit/new page for any collection. `id` is a number or "new". */
export async function CmsEdit({ c, idParam, extra }: { c: CollectionDef; idParam: string; extra?: (id: number) => React.ReactNode }) {
  await requireStaff(c.perm);
  const isNew = idParam === "new";
  const rowId = Number(idParam);
  if (!isNew && (!Number.isInteger(rowId) || rowId <= 0)) notFound();

  const needsDistricts = c.fields.some((f) => f.key === "district_id" || f.kind === "districts");
  const districtRows = needsDistricts ? await q<{ id: number; name_en: string; name_te: string }>("SELECT id, name_en, name_te FROM districts ORDER BY name_en") : [];
  let data: { values: Record<string, unknown>; published: boolean; row: Record<string, unknown> | null };
  if (isNew) data = { values: emptyValues(c), published: false, row: null };
  else {
    try { const g = await getRow(c, rowId); data = { values: g.values, published: g.published, row: g.row }; }
    catch (e) { if (e instanceof HttpError) notFound(); throw e; }
  }
  const title = isNew ? `New ${c.label.toLowerCase()}` : String((c.titleIsI18n ? data.row?.[`${c.titleKey}_en`] : data.row?.[c.titleKey]) ?? c.label);
  const slug = c.slugKey ? (data.row?.[c.slugKey] as string | undefined) : undefined;
  const publicUrl = c.publicPath ? `${SITE}${c.publicPath.replace("{slug}", slug ?? "")}` : null;

  return (
    <>
      <Link href={c.basePath} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a2b57] hover:underline"><ArrowLeft className="size-4" aria-hidden />All {c.plural.toLowerCase()}</Link>
      <PageHeader title={title} subtitle={isNew ? "Fill in English first; Telugu falls back to English until it is added." : undefined} />
      <EntityForm c={c} id={isNew ? null : rowId} initial={data.values} published={data.published}
        options={needsDistricts ? { district_id: districtRows.map((d) => [String(d.id), `${d.name_en} · ${d.name_te}`]) } : {}}
        districts={districtRows.map((d) => ({ id: d.id, name: d.name_en }))} publicUrl={publicUrl}>
        {!isNew && extra?.(rowId)}
      </EntityForm>
    </>
  );
}
