import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { faqs, posts, testimonials } from "@/lib/admin/cms/collections";
import { CmsList } from "@/components/admin/cms/pages";
import { ContentTabs } from "@/components/admin/cms/content-tabs";

export const metadata: Metadata = { title: "Content" };
export const dynamic = "force-dynamic";
const BY_KEY = { posts, faqs, testimonials } as const;

export default async function ContentListPage({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const c = BY_KEY[(await params).collection as keyof typeof BY_KEY];
  if (!c) notFound();
  return <CmsList c={c} sp={await searchParams}><ContentTabs active={c.key} /></CmsList>;
}
