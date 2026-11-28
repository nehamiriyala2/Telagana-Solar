import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
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
  return (
    <TiltCard className="h-full rounded-card" max={4}>
      <div className={cn("relative flex h-full flex-col p-6 md:p-7",
        premium ? "card-premium"
          : "rounded-card border border-line bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift")}>
        <p className="font-heading text-[2.75rem] font-extrabold leading-none tracking-tightish">{pkg.kw}<span className="ml-1 text-h4">kW</span></p>
        <ul className="mt-6 flex-1 space-y-2.5 text-caption text-muted">
          <li>{t("packages.billRange", { min: formatINR(f.billMin), max: formatINR(f.billMax) })}</li>
          <li>{t("packages.generation", { units: formatNum(f.generationMonthly) })}</li>
          <li>{t("packages.roof", { sqft: formatNum(pkg.kw * calculatorConfig.sqftPerKw) })}</li>
        </ul>
        {pkg.priceFrom !== null && (
          <p className="mt-6 border-t border-line pt-5 font-heading text-h4 font-bold">
            {t("common.startingFrom", { price: formatINR(pkg.priceFrom) })}
          </p>
        )}
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href={{ pathname: "/contact", query: { package: pkg.id, type: pkg.type } }}>{t("packages.getQuote")}<ArrowRight aria-hidden /></Link>
        </Button>
      </div>
    </TiltCard>
  );
}
