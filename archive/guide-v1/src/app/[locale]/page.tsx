import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { CategoryCards } from "@/components/home/category-cards";
import { HowSolarWorks } from "@/components/home/how-solar-works";
import { SavingsHighlights } from "@/components/home/savings-highlights";
import { TrustBadges, Faq } from "@/components/home/trust-faq";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { Link } from "@/i18n/navigation";
import { getSolarData } from "@/lib/data/repository";
import { estimateBill, recommend, tariffFor } from "@/lib/solar/engine";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const data = await getSolarData();

  // Example used in "savings highlights": Hyderabad urban home, ₹3,000 bill, reliable grid.
  const r = recommend({ persona: "urban", district: "hyderabad", supply: "reliable", bill: 3000 }, data);
  const tariff = tariffFor("urban", data.tariffs);
  const gen = r.generationMonthly;
  const ex = {
    billBefore: 3000,
    billAfter: estimateBill(Math.max(0, r.monthlyUnits - gen), tariff).total,
    monthly: r.monthlySavings,
    lifetime: r.projection.at(-1)?.cumulative ?? 0,
    co2: r.co2TonnesPerYear,
    payback: r.paybackYears,
  };

  return (
    <>
      <Hero sunHours={data.assumptions.sunHours} />
      <CategoryCards />
      <HowSolarWorks />
      <SavingsHighlights ex={ex} />
      <TrustBadges />
      <Faq />
      <section className="container-page pb-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-navy px-6 py-16 text-center text-cream md:px-16 md:py-24">
          <div aria-hidden className="absolute left-1/2 top-full -z-10 size-[640px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgb(255_184_0/0.45),transparent_65%)]" />
          <h2 className="mx-auto max-w-2xl text-h2 md:text-h2-lg">{t("hero.title")}</h2>
          <Magnetic className="mt-10 inline-block">
            <Button asChild size="lg"><Link href="/finder">{t("hero.cta")}<ArrowRight /></Link></Button>
          </Magnetic>
        </div>
      </section>
    </>
  );
}
