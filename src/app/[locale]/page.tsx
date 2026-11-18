import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Solar60 } from "@/components/home/solar-60";
import { WhoAreYou } from "@/components/home/who-are-you";
import { SchemesSection } from "@/components/home/schemes-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { MiniCalculator } from "@/components/calculator/mini-calculator";
import { KnowBefore } from "@/components/home/know-before";
import { FaqSection, FinalCta, Packages } from "@/components/home/home-sections";
import { JsonLd, faqJsonLd, pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta({ locale, path: "/", title: t("title"), description: t("description") });
}

/**
 * Home (informational): Hero → Solar in 60 seconds → Which solar suits you → Schemes →
 * How it works → Calculator → Know before you buy → Packages → FAQ → Final banner.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

  return (
    <div className="home-premium">
      <JsonLd data={faqJsonLd(faqKeys.map((k) => ({ q: t(`${k}.q`), a: t(`${k}.a`) })))} />
      <Hero />
      <Solar60 />
      <WhoAreYou />
      <SchemesSection premium />
      <HowItWorks premium />
      <MiniCalculator />
      <KnowBefore />
      <Packages premium />
      <FaqSection keys={faqKeys} premium />
      <FinalCta />
    </div>
  );
}
