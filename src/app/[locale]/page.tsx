import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Solar60 } from "@/components/home/solar-60";
import { WhoAreYou } from "@/components/home/who-are-you";
import { SchemesSection } from "@/components/home/schemes-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { KnowBefore } from "@/components/home/know-before";
import { FaqSection } from "@/components/home/home-sections";
import { TrustStrip } from "@/components/home/trust-strip";
import { JsonLd, faqJsonLd, pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta({ locale, path: "/", title: t("title"), description: t("description") });
}

/**
 * Home: Hero → Trust strip → How solar cuts your bill (+ on-grid/off-grid/hybrid) → Which solar suits you →
 * How it works (deep-blue band) → Schemes → Solar checklist → FAQ → Final CTA (deep-blue band).
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const faqKeys = ["q1", "q2", "q3", "q4"];

  return (
    <div className="home-premium">
      <JsonLd data={faqJsonLd(faqKeys.map((k) => ({ q: t(`${k}.q`), a: t(`${k}.a`) })))} />
      <Hero />
      <TrustStrip />
      <Solar60 />
      <WhoAreYou />
      <HowItWorks premium />
      <SchemesSection premium />
      <KnowBefore />
      <FaqSection keys={faqKeys} premium />
    </div>
  );
}
