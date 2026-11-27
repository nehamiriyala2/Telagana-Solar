import type { Metadata } from "next";
import { schemes } from "@/lib/admin/cms/collections";
import { CmsEdit } from "@/components/admin/cms/pages";

export const metadata: Metadata = { title: "Scheme" };
export const dynamic = "force-dynamic";

export default async function SchemeEditPage({ params }: { params: Promise<{ id: string }> }) {
  return <CmsEdit c={schemes} idParam={(await params).id} />;
}
