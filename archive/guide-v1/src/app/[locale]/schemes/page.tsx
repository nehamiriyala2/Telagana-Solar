import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { SchemeExplorer } from "@/components/tools/scheme-explorer";
import { getSchemes } from "@/lib/data/repository";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "schemes" });
  return { title: t("eyebrow"), description: t("subtitle") };
}

export default async function SchemesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const schemes = await getSchemes();
  return (
    <div className="container-page pb-16 pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+4.5rem)]">
      <SectionHeading as="h1" eyebrow={t("schemes.eyebrow")} title={t("schemes.title")} subtitle={t("schemes.subtitle")} />
      <SchemeExplorer schemes={schemes} />
      <p className="mt-10 rounded-2xl border border-line bg-surface p-5 text-caption text-muted">{t("common.disclaimer")}</p>
    </div>
  );
}
