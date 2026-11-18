import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectsGallery } from "@/components/page/projects-gallery";
import { FinalCta } from "@/components/home/home-sections";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return pageMeta({ locale, path: "/projects", title: t("eyebrow"), description: t("subtitle") });
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  return (
    <>
      <div className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFBF2_100%)]">
        <div className="container-page pb-16 pt-12 md:pt-16">
          <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
          <ProjectsGallery />
        </div>
      </div>
      <FinalCta />
    </>
  );
}
