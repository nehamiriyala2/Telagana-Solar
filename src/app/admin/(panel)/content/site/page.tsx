import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { can } from "@/lib/admin/roles";
import { loadSiteContent } from "@/lib/admin/site-content-store";
import { PageHeader } from "@/components/admin/ui";
import { ContentTabs } from "@/components/admin/cms/content-tabs";
import { SiteContentForm } from "@/components/admin/cms/site-content-form";

export const metadata: Metadata = { title: "Home page & banner" };
export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const staff = await requireStaff("content.edit");
  const { trust, banner } = await loadSiteContent();
  return (
    <>
      <PageHeader title="Content" subtitle="Guides, FAQs, testimonials, the home page trust bar and the announcement banner." />
      <ContentTabs active="site" />
      <SiteContentForm trust={trust} banner={banner} canEdit={can(staff.role, "content.edit")} />
    </>
  );
}
