import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

const ITEMS = ["k1", "k2", "k3", "k4", "k5", "k6", "k7"] as const;

/** "Know before you buy": the 7-point pre-purchase checklist as a two-column list inside one framed card. */
export function KnowBefore() {
  const t = useTranslations("knowBefore");
  return (
    <section className="bg-cloud py-16 md:py-24" aria-labelledby="kb-title">
      <div className="container-page">
        <SectionHeading premium eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <Reveal>
          <div className="mx-auto max-w-5xl rounded-3xl border border-line bg-card p-6 shadow-soft md:p-10">
            <ol className="grid gap-x-10 md:grid-cols-2">
              {ITEMS.map((key, i) => (
                <li key={key} className="flex gap-4 border-b border-line py-5 last:border-b-0">
                  <span aria-hidden className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-primary/30 bg-tint-ice text-primary">
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                  <span>
                    <span className="block font-heading text-[1.125rem] font-semibold text-ink"><span className="sr-only">{i + 1}. </span>{t(`${key}.title`)}</span>
                    <span className="mt-1 block text-caption text-muted">{t(`${key}.desc`)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
