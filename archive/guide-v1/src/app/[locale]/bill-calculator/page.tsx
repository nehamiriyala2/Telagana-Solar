import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { BillCalculator } from "@/components/tools/bill-calculator";
import { getAssumptions, getSchemes, getTariffs } from "@/lib/data/repository";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bill" });
  return { title: t("eyebrow"), description: t("subtitle") };
}

export default async function BillPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const [tariffs, assumptions, schemes] = await Promise.all([getTariffs(), getAssumptions(), getSchemes()]);
  return (
    <div className="container-page pb-16 pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+4.5rem)]">
      <SectionHeading as="h1" eyebrow={t("bill.eyebrow")} title={t("bill.title")} subtitle={t("bill.subtitle")} />
      <BillCalculator tariffs={tariffs} assumptions={assumptions} schemes={schemes} />
      <p className="mt-8 text-caption text-muted">{t("common.disclaimer")}</p>
    </div>
  );
}
