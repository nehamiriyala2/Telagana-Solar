import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Landmark } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { SchemesSection } from "@/components/home/schemes-section";
import { FinalCta } from "@/components/home/home-sections";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "schemes" });
  return pageMeta({ locale, path: "/schemes", title: t("eyebrow"), description: t("subtitle") });
}

export default async function SchemesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("schemes");
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} Icon={Landmark} />
      <SchemesSection />
      <FinalCta />
    </>
  );
}
