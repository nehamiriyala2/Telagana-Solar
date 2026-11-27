import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { faqs, posts, testimonials } from "@/lib/admin/cms/collections";
import { CmsEdit } from "@/components/admin/cms/pages";

export const metadata: Metadata = { title: "Content" };
export const dynamic = "force-dynamic";
const BY_KEY = { posts, faqs, testimonials } as const;

export default async function ContentEditPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const p = await params;
  const c = BY_KEY[p.collection as keyof typeof BY_KEY];
  if (!c) notFound();
  return <CmsEdit c={c} idParam={p.id} />;
}
