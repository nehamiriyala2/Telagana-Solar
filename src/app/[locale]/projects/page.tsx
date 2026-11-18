import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/page/page-hero";
import { ProjectsGallery } from "@/components/page/projects-gallery";
import { FinalCta } from "@/components/home/home-sections";
import { titleEmphasis } from "@/data/pages";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return pageMeta({ locale, path: "/projects", title: t("eyebrow"), description: t("subtitle") });
}

/** Projects: hero → filterable gallery with case-study pop-ups → CTA. */
export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} emphasis={pick(titleEmphasis.projects, locale)} subtitle={t("subtitle")} ctas={false} tone="dark" align="center" reveal="chars" />
      <section className="tone tone-sky pb-16 pt-10 md:pb-24">
        <div className="container-page">
          <ProjectsGallery />
        </div>
      </section>
      <FinalCta />
    </>
  );
}
