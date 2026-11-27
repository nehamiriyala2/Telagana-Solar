import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { personaMedia } from "@/data/personas-media";
import { pick } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { UI_IMAGES } from "@/data/section-photos";
import { cn } from "@/lib/utils";

const FLOW = ["sun", "panels", "inverter", "home", "meter", "grid"] as const;

const TYPES = [
  { key: "ongrid", accent: "bg-primary", head: "bg-tint-ice" },
  { key: "offgrid", accent: "bg-[#5F6A76]", head: "bg-[#F1F4F8]" },
  { key: "hybrid", accent: "bg-green", head: "bg-tint-mint" },
] as const;

/**
 * "How solar cuts your bill" (homepage).
 * Two balanced columns: the house illustration with labelled pins (left) and three equal explainer cards with
 * illustrated icons that fill the full height of the picture (right). Below: the 6-step energy flow as illustrated
 * circles joined by arrows (horizontal on desktop, vertical on phones) and the on-grid / off-grid / hybrid cards
 * with illustrated icons, tinted headers and green "Best for" chips.
 */
export function Solar60() {
  const t = useTranslations("solar60");
  const tw = useTranslations("why");
  const locale = useLocale();
  const cards = [
    { title: t("what.title"), desc: t("what.desc"), img: UI_IMAGES.explain.what },
    { title: t("cut.title"), desc: t("cut.desc"), img: UI_IMAGES.explain.cut },
    { title: tw("endToEnd.title"), desc: tw("endToEnd.desc"), img: UI_IMAGES.explain.service },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-mist pb-16 pt-20 md:pb-24" aria-labelledby="s60-title">
      <span aria-hidden className="deco-blob deco-blob--green -right-40 top-0 size-[26rem]" />
      <div className="container-page">
        <SectionHeading premium align="left" eyebrow={t("eyebrow")} title={t("title")} />

        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <Reveal className="lg:col-span-7">
            <div className="h-full rounded-[1.25rem] border border-card-line bg-white p-3 shadow-[0_10px_30px_rgb(41_52_64/0.10)]">
              {/* Natural photo of a solar home (no illustrated flow lines or pins) */}
              <div className="relative h-full min-h-[18rem] overflow-hidden rounded-[0.875rem]">
                <Image src="/personas/urban.webp" alt={personaMedia.urban ? pick(personaMedia.urban.alt, locale) : ""} fill sizes="(min-width: 1024px) 40rem, 100vw" className="object-cover object-[50%_40%]" />
              </div>
            </div>
          </Reveal>
          <div className="grid gap-4 lg:col-span-5 lg:grid-rows-3">
            {cards.map(({ title, desc, img }, i) => (
              <Reveal key={title} delay={0.08 + i * 0.08} className="h-full">
                <div className="card-premium flex h-full items-start gap-5 p-6">
                  <span aria-hidden className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-tint-ice">
                    <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <div>
                    <h3 className="font-heading text-h4 font-bold text-ink">{title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] text-body">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* 6-step energy flow: illustrated circles joined by arrows */}
        <Reveal className="mt-6 rounded-[1.25rem] border border-card-line bg-white p-6 shadow-[0_10px_30px_rgb(41_52_64/0.10)] md:p-8">
          <ol className="grid gap-5 md:grid-cols-6 md:gap-2">
            {FLOW.map((key, i) => (
              <li key={key} className="relative flex items-center gap-4 md:flex-col md:items-center md:gap-3 md:text-center">
                <span className="relative shrink-0">
                  <span aria-hidden className="relative block size-16 overflow-hidden rounded-full bg-[#FCFBF9] md:size-20">
                    <Image src={UI_IMAGES.flow[key]} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-primary text-[0.75rem] font-bold text-white ring-2 ring-white tabular-nums">{i + 1}</span>
                </span>
                {i < FLOW.length - 1 && (
                  <ArrowRight aria-hidden className="absolute -right-3 top-9 hidden size-5 text-primary/60 md:block lg:-right-2.5" />
                )}
                <span>
                  <span className="block font-heading text-[1.0625rem] font-bold text-ink">{t(`flow.${key}.title`)}</span>
                  <span className="mt-0.5 block text-[0.875rem] text-body">{t(`flow.${key}.desc`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* On-grid / off-grid / hybrid */}
        <h3 className="mt-16 font-heading text-h3 font-bold text-ink md:text-[1.75rem]">{t("typesTitle")}</h3>
        <span aria-hidden className="mb-6 mt-3 block h-1 w-14 rounded-full bg-[linear-gradient(90deg,#64758A,#D9B978)]" />
        <ul className="grid gap-5 md:grid-cols-3">
          {TYPES.map(({ key, accent, head }, i) => (
            <Reveal key={key} delay={i * 0.08} className="h-full">
              <li className="card-premium relative flex h-full list-none flex-col overflow-hidden">
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", accent)} />
                <div className={cn("flex items-center gap-4 px-6 pb-4 pt-5", head)}>
                  <span aria-hidden className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={UI_IMAGES.types[key]} alt="" fill sizes="64px" className="object-contain mix-blend-multiply" />
                  </span>
                  <h4 className="font-heading text-h4 font-bold text-ink">{t(`${key}.name`)}</h4>
                </div>
                <p className="flex-1 px-6 pt-5 text-[0.9375rem] text-body">{t(`${key}.desc`)}</p>
                <p className="mx-6 mb-6 mt-5 inline-flex items-start gap-1.5 self-start rounded-full bg-tint-mint px-3 py-1.5 text-caption text-green-ink">
                  <Check className="mt-0.5 size-3.5 shrink-0" strokeWidth={3} aria-hidden />
                  <span><span className="font-semibold">{t("best")}:</span> {t(`${key}.best`)}</span>
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
