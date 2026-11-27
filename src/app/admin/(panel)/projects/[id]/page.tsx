import type { Metadata } from "next";
import { projects } from "@/lib/admin/cms/collections";
import { CmsEdit } from "@/components/admin/cms/pages";
import { ProjectPhotos } from "@/components/admin/cms/project-photos";

export const metadata: Metadata = { title: "Project" };
export const dynamic = "force-dynamic";

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  return <CmsEdit c={projects} idParam={(await params).id} extra={(id) => <ProjectPhotos projectId={id} />} />;
}
