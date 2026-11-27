import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Solar60 } from "@/components/home/solar-60";
import { WhoAreYou } from "@/components/home/who-are-you";
import { SchemesSection } from "@/components/home/schemes-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { KnowBefore } from "@/components/home/know-before";
import { FaqSection, FinalCta } from "@/components/home/home-sections";
import { SiteMarquee } from "@/components/motion/site-marquee";
import { site } from "@/config/site";
import { pick } from "@/lib/utils";
import { TrustStrip } from "@/components/home/trust-strip";
import { JsonLd, faqJsonLd, pageMeta } from "@/lib/seo";
import { publishedFaqs } from "@/lib/public-content";
import { loadPublicSettings } from "@/lib/public-settings";
import { schemeCards } from "@/lib/public-schemes";

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
  // Admin content: published FAQs and the trust bar (built-in text when the database isn't available).
  const [dbFaqs, ps, cards] = await Promise.all([publishedFaqs(locale), loadPublicSettings(), schemeCards(locale)]);
  const faqs = dbFaqs?.length ? dbFaqs : faqKeys.map((k) => ({ q: t(`${k}.q`), a: t(`${k}.a`) }));
  const trust = ps.trust.map((x) => ({ value: locale === "te" ? x.value_te || x.value_en : x.value_en, caption: locale === "te" ? x.caption_te || x.caption_en : x.caption_en }));

  return (
    <div className="home-premium">
      <JsonLd data={faqJsonLd(faqs)} />
      <Hero />
      <TrustStrip items={trust} />
      <Solar60 />
      <WhoAreYou />
      <HowItWorks premium dark />
      <SiteMarquee phrases={pick(site.tagline, locale).split(/\.\s*/).filter(Boolean)} />
      <SchemesSection premium cards={cards} />
      <KnowBefore />
      <FaqSection keys={faqKeys} items={faqs} premium />
      <FinalCta />
    </div>
  );
}
