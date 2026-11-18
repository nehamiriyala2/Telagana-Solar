import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { PageHero } from "@/components/page/page-hero";
import { PlanStepper } from "@/components/tools/plan-stepper";
import { planPage as D } from "@/data/plan-page";
import { titleEmphasis } from "@/data/pages";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guide" });
  return pageMeta({ locale, path: "/find-my-solar-plan", title: t("title"), description: pick(D.subtitle, locale) });
}

/** /find-my-solar-plan: the guide as a full page (3-step stepper → plan + call-back request). */
export default async function PlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guide");
  return (
    <>
      <PageHero eyebrow={pick(D.eyebrow, locale)} title={t("title")} emphasis={pick(titleEmphasis.plan, locale)} subtitle={pick(D.subtitle, locale)} Icon={Sparkles} ctas={false} />
      <section className="bg-premium-light pb-16 pt-6 md:pb-24">
        <div className="container-page max-w-5xl">
          <PlanStepper />
        </div>
      </section>
    </>
  );
}
