import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { NAV } from "@/lib/admin/roles";
import { ComingSoon, DeniedBanner, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/** Placeholder for sidebar sections that are not built yet. Each real page replaces this as its step lands. */
function item(section: string) {
  return NAV.find((n) => n.href === `/admin/${section}` && n.soon);
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  return { title: item((await params).section)?.label ?? "Not found" };
}

export default async function SectionPage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ denied?: string }> }) {
  const nav = item((await params).section);
  if (!nav) notFound();
  await requireStaff(nav.perm);
  const { denied } = await searchParams;
  return (
    <>
      {denied && <DeniedBanner />}
      <PageHeader title={nav.label} />
      <ComingSoon label={nav.label} step={nav.step} />
    </>
  );
}
