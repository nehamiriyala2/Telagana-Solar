import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { FullCalculator } from "@/components/calculator/full-calculator";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculator" });
  return pageMeta({ locale, path: "/savings-calculator", title: t("eyebrow"), description: t("subtitle") });
}

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("calculator");
  return (
    <div className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFBF2_40%,#FFFFFF_100%)]">
      <div className="container-page pb-20 pt-12 md:pt-16">
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <FullCalculator />
      </div>
    </div>
  );
}
