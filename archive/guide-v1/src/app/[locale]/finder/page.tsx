import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FinderWizard } from "@/components/finder/finder-wizard";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSolarData } from "@/lib/data/repository";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "finder" });
  return { title: t("eyebrow"), description: t("subtitle") };
}

export default async function FinderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("finder");
  const data = await getSolarData();

  return (
    <div className="container-page pb-16 pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+4.5rem)]">
      <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <FinderWizard data={data} />
    </div>
  );
}
