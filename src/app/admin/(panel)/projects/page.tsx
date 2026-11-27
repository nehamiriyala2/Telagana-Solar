import type { Metadata } from "next";
import { projects } from "@/lib/admin/cms/collections";
import { CmsList } from "@/components/admin/cms/pages";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <CmsList c={projects} sp={await searchParams} />;
}
