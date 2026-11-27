import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page/page-hero";
import { WhatsAppButton } from "@/components/ui/contact-buttons";
import { Markdown } from "@/lib/markdown";
import { postBySlug } from "@/lib/public-content";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await postBySlug(slug, locale);
  if (!p) return {};
  return pageMeta({ locale, path: `/guides/${slug}`, title: p.seoTitle || p.title, description: p.seoDesc || p.excerpt || p.title });
}

/** One published guide. Unknown or draft slugs are 404. */
export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await postBySlug(slug, locale);
  if (!p) notFound();
  const te = locale === "te";
  const date = p.publishedAt ? new Intl.DateTimeFormat(te ? "te-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(p.publishedAt)) : null;
  return (
    <>
      <PageHero eyebrow={te ? "గైడ్" : "Guide"} title={p.title} subtitle={p.excerpt || (date ?? "")} Icon={BookOpen} ctas={false} />
      <article className="bg-section-white py-12 md:py-16">
        <div className="container-page max-w-3xl">
          <Link href="/guides" className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary-hover hover:underline"><ArrowLeft className="size-4" aria-hidden />{te ? "అన్ని గైడ్‌లు" : "All guides"}</Link>
          {p.cover && <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[1.25rem]"><Image src={p.cover} alt={p.coverAlt} fill priority sizes="(min-width:768px) 48rem, 100vw" className="object-cover" /></div>}
          {date && <p className="mt-6 text-caption text-muted">{date}</p>}
          <div className="text-body">{p.body ? <Markdown source={p.body} /> : null}</div>
          <div className="mt-12 rounded-[1.25rem] border border-line bg-wash-green p-6">
            <p className="text-body">{te ? "మీ ఇంటికి ఇది ఎలా వర్తిస్తుందో తెలుసుకోవాలా? వాట్సాప్‌లో అడగండి." : "Want to know how this applies to your home? Ask us on WhatsApp."}</p>
            <WhatsAppButton place="guide-article" className="mt-4" />
          </div>
        </div>
      </article>
    </>
  );
}
