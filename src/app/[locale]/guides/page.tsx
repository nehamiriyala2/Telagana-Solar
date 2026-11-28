import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/page/page-hero";
import { publishedPosts } from "@/lib/public-content";
import { pageMeta } from "@/lib/seo";
import { Develop } from "@/components/motion/develop";

export const revalidate = 300;

const COPY = {
  en: { eyebrow: "Guides", title: "Solar guides for Telangana", subtitle: "Plain answers on subsidies, net metering, roofs and costs, written by our team.", empty: "Guides are on their way. Meanwhile, ask us anything on WhatsApp.", read: "Read guide", news: "News" },
  te: { eyebrow: "గైడ్‌లు", title: "తెలంగాణ కోసం సోలార్ గైడ్‌లు", subtitle: "సబ్సిడీ, నెట్ మీటరింగ్, పైకప్పు, ఖర్చుల గురించి సులభమైన సమాధానాలు.", empty: "గైడ్‌లు త్వరలో వస్తాయి. ఈలోగా వాట్సాప్‌లో ఏదైనా అడగండి.", read: "గైడ్ చదవండి", news: "వార్తలు" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale === "te" ? "te" : "en"];
  return pageMeta({ locale, path: "/guides", title: c.title, description: c.subtitle });
}

/** Published guides from Admin → Content → Guides. Drafts never show. */
export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === "te" ? "te" : "en"];
  const posts = await publishedPosts(locale);
  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} Icon={BookOpen} />
      <section className="bg-section-white py-14 md:py-20">
        <div className="container-page">
          {!posts.length ? <p className="rounded-[1.25rem] border border-line bg-white p-10 text-center text-muted">{c.empty}</p> : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <Develop as="li" key={p.slug} index={i % 3} className="list-none">
                  <Link href={`/guides/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-soft transition-colors hover:border-gold/50">
                    {p.cover
                      ? <span className="dv-photo relative block aspect-[16/9] overflow-hidden"><Image src={p.cover} alt={p.coverAlt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /></span>
                      : <span aria-hidden className="grid aspect-[16/9] place-items-center bg-[#EBE3D3] text-primary"><BookOpen className="size-10" /></span>}
                    <span className="flex flex-1 flex-col p-6">
                      {p.kind === "news" && <span className="mb-2 text-caption font-bold uppercase tracking-wide text-gold-ink">{c.news}</span>}
                      <span className="font-heading text-[1.25rem] font-bold leading-snug text-ink">{p.title}</span>
                      {p.excerpt && <span className="mt-2 text-caption text-muted">{p.excerpt}</span>}
                      <span className="mt-auto flex items-center gap-1.5 pt-5 text-caption font-semibold text-primary-hover">{c.read}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                    </span>
                  </Link>
                </Develop>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
