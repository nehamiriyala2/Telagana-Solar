import type { Metadata } from "next";
import { schemes } from "@/lib/admin/cms/collections";
import { CmsList } from "@/components/admin/cms/pages";

export const metadata: Metadata = { title: "Schemes" };
export const dynamic = "force-dynamic";

export default async function SchemesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <CmsList c={schemes} sp={await searchParams} />;
}
