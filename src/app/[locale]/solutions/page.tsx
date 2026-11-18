import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/page/page-hero";
import { Solutions } from "@/components/home/solutions";
import { FinalCta } from "@/components/home/home-sections";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solutions" });
  return pageMeta({ locale, path: "/solutions", title: t("eyebrow"), description: t("subtitle") });
}

export default async function SolutionsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("solutions");
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <Solutions />
      <FinalCta />
    </>
  );
}
