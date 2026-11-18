import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { ApplianceCalculator } from "@/components/tools/appliance-calculator";
import { getAppliances, getAssumptions } from "@/lib/data/repository";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appliances" });
  return { title: t("eyebrow"), description: t("subtitle") };
}

export default async function AppliancesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("appliances");
  const [appliances, assumptions] = await Promise.all([getAppliances(), getAssumptions()]);
  return (
    <div className="container-page pb-16 pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+4.5rem)]">
      <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <ApplianceCalculator appliances={appliances} assumptions={assumptions} />
    </div>
  );
}
