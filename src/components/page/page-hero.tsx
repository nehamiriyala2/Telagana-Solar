import { ArrowRight, Calculator, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GuideTrigger } from "@/components/tools/triggers";
import type { GuidePersona } from "@/config/personas";

const TYPE_TO_PERSONA: Record<string, GuidePersona> = { home: "urban", farm: "farmer", business: "shop" };

/** Inner-page hero: text left, sun-lit icon art right. CSS-only entrance (visible before JS). */
export function PageHero({ eyebrow, title, subtitle, Icon, ctas = true, calcType, guidePersona }: {
  eyebrow: string; title: string; subtitle: string; Icon?: LucideIcon; ctas?: boolean; calcType?: string; guidePersona?: GuidePersona;
}) {
  const t = useTranslations("common");
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFBF2_100%)]">
      <div aria-hidden className="absolute -right-32 -top-32 -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(245_168_0/0.16),transparent_65%)]" />
      <div className="container-page grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12">
        <div className={Icon ? "lg:col-span-7" : "lg:col-span-9"}>
          <p className="eyebrow animate-rise">{eyebrow}</p>
          <h1 className="mt-3 animate-rise text-hero md:text-hero-lg" style={{ animationDelay: "0.08s" }}>{title}</h1>
          <p className="mt-5 max-w-2xl animate-rise text-muted md:text-body-lg" style={{ animationDelay: "0.16s" }}>{subtitle}</p>
          {ctas && (
            <div className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.24s" }}>
              <GuideTrigger size="lg" persona={guidePersona ?? (calcType ? TYPE_TO_PERSONA[calcType] : undefined)}>{t("bookVisit")}<ArrowRight aria-hidden /></GuideTrigger>
              <Button asChild size="lg" variant="outline"><Link href={{ pathname: "/savings-calculator", query: calcType ? { type: calcType } : {} }}><Calculator aria-hidden />{t("calculate")}</Link></Button>
            </div>
          )}
        </div>
        {Icon && (
          <div className="relative hidden lg:col-span-5 lg:block" aria-hidden>
            <div className="relative mx-auto grid aspect-square max-w-sm place-items-center">
              <div className="absolute inset-0 animate-rays rounded-full opacity-60 [background:repeating-conic-gradient(from_0deg,rgb(245_168_0/0.22)_0deg_5deg,transparent_5deg_18deg)] [mask-image:radial-gradient(circle,black_25%,transparent_68%)]" />
              <div className="absolute size-2/3 animate-glow rounded-full bg-[radial-gradient(circle,rgb(255_210_122/0.9),rgb(245_168_0/0.25)_55%,transparent_70%)]" />
              <span className="relative grid size-40 place-items-center rounded-[2.5rem] bg-white text-sky-ink shadow-lift">
                <Icon className="size-20" strokeWidth={1.3} />
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
