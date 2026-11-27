import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/page/page-hero";
import { ProjectsGallery } from "@/components/page/projects-gallery";
import { titleEmphasis } from "@/data/pages";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";
import type { Project } from "@/config/content";
import { publishedProjects } from "@/lib/public-content";

export const revalidate = 300;

const monthYear = (d: Date | null, locale: string) =>
  d ? new Intl.DateTimeFormat(locale === "te" ? "te-IN" : "en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(d)) : null;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return pageMeta({ locale, path: "/projects", title: t("eyebrow"), description: t("subtitle") });
}

/** Projects: hero → filterable gallery with case-study pop-ups. */
export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  // Published projects from Admin → Projects (customer permission given). None yet → the gallery shows its placeholders.
  const db = (await publishedProjects(locale)) ?? [];
  const items: Project[] = db.map((p) => {
    const same = (v: string) => (v ? { en: v, te: v } : null);
    return {
      id: `db-${p.id}`, type: p.type, district: p.district ?? "", locality: p.area, kw: p.kw, monthlySaving: p.savingsMonth,
      photo: p.photos[0]?.src ?? null, photos: p.photos.map((x) => ({ src: x.src, alt: x.alt })), featured: p.featured, title: p.title, fromAdmin: true,
      caseStudy: { scheme: null, completed: monthYear(p.installDate, locale), challenge: null, solution: same(p.story), result: same(p.quote ? `“${p.quote}”${p.customer ? ` (${p.customer})` : ""}` : "") },
    };
  });
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} emphasis={pick(titleEmphasis.projects, locale)} subtitle={t("subtitle")} ctas={false} tone="dark" align="center" reveal="chars" />
      <section className="tone tone-sky pb-16 pt-10 md:pb-24">
        <div className="container-page">
          <ProjectsGallery items={items} />
        </div>
      </section>
    </>
  );
}
