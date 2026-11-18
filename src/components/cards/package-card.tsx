import { useTranslations } from "next-intl";
import { ArrowRight, Sun } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EditMark } from "@/components/ui/badge";
import { TiltCard } from "@/components/motion/tilt-card";
import type { SolarPackage } from "@/config/packages";
import { calculatorConfig } from "@/config/calculator";
import { packageFacts } from "@/lib/calculator";
import { cn, formatINR, formatNum } from "@/lib/utils";

/** Package card: size, typical bill range, approx generation, "Starting from ₹[EDIT]", Get quote. */
/** `premium` (homepage): the popular card turns deep navy with a gold glow. */
export function PackageCard({ pkg, premium = false }: { pkg: SolarPackage; premium?: boolean }) {
  const t = useTranslations();
  const f = packageFacts(pkg.kw, pkg.type);
  const dark = premium && pkg.popular;
  return (
    <TiltCard className="h-full rounded-card" max={4}>
      <div className={cn("relative flex h-full flex-col p-6 md:p-7",
        dark ? "bg-premium-navy rounded-[1.5rem] text-white shadow-[0_30px_60px_-28px_rgb(7_23_63/0.8),0_0_50px_-20px_rgb(255_199_44/0.6)] ring-2 ring-gold/70 md:-translate-y-3"
          : premium ? "card-premium"
          : cn("rounded-card border bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift", pkg.popular ? "border-gold shadow-glow" : "border-line"))}>
        {pkg.popular && <span className="absolute -top-3 left-6 rounded-full bg-sun px-3 py-1 text-[0.75rem] font-bold text-navy">{t("common.popular")}</span>}
        <div className="flex items-center justify-between">
          <p className="font-heading text-[2.75rem] font-extrabold leading-none tracking-tightish">{pkg.kw}<span className="ml-1 text-h4">kW</span></p>
          <span className={cn("grid size-12 place-items-center rounded-2xl", premium ? "icon-sun" : "bg-gold-soft text-gold-ink")}><Sun className="size-6" aria-hidden /></span>
        </div>
        <ul className={cn("mt-6 flex-1 space-y-2.5 text-caption", dark ? "text-silver/85" : "text-muted")}>
          <li>{t("packages.billRange", { min: formatINR(f.billMin), max: formatINR(f.billMax) })}</li>
          <li>{t("packages.generation", { units: formatNum(f.generationMonthly) })}</li>
          <li>{t("packages.roof", { sqft: formatNum(pkg.kw * calculatorConfig.sqftPerKw) })}</li>
        </ul>
        <p className={cn("mt-6 border-t pt-5 font-heading text-h4 font-bold", dark ? "border-white/15" : "border-line")}>
          {pkg.priceFrom !== null ? t("common.startingFrom", { price: formatINR(pkg.priceFrom) }) : <>{t("common.startingFrom", { price: "₹" })} <EditMark /></>}
        </p>
        <Button asChild variant={pkg.popular ? "primary" : "outline"} className={cn("mt-4 w-full", dark && "btn-shine")}>
          <Link href={{ pathname: "/contact", query: { package: pkg.id, type: pkg.type } }}>{t("packages.getQuote")}<ArrowRight aria-hidden /></Link>
        </Button>
      </div>
    </TiltCard>
  );
}
