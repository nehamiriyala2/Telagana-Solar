"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatINR, formatLakh, formatNum } from "@/lib/utils";

export interface SavingsExample {
  billBefore: number; billAfter: number; monthly: number; lifetime: number; co2: number; payback: number | null;
}

export function SavingsHighlights({ ex }: { ex: SavingsExample }) {
  const t = useTranslations("savings");
  const items = [
    { label: t("monthly"), value: ex.monthly, fmt: formatINR, green: true },
    { label: t("lifetime"), value: ex.lifetime, fmt: formatLakh, green: true },
    { label: t("co2"), value: ex.co2, fmt: (n: number) => formatNum(n, 1) },
    { label: t("payback"), value: ex.payback ?? 0, fmt: (n: number) => formatNum(n, 1) },
  ];
  const ratio = ex.billBefore ? ex.billAfter / ex.billBefore : 0;

  return (
    <section className="section" aria-labelledby="savings-title">
      <div className="container-page">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <div className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Card className="flex h-full flex-col justify-between gap-8 p-6 md:p-8">
              <BillBar label={t("before")} amount={ex.billBefore} ratio={1} tone="navy" />
              <BillBar label={t("after")} amount={ex.billAfter} ratio={ratio} tone="gold" />
              <Button asChild variant="navy" className="self-start">
                <Link href="/bill-calculator">{t("cta")}<ArrowRight /></Link>
              </Button>
            </Card>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 lg:col-span-7">
            {items.map((it, i) => (
              <Reveal key={it.label} delay={i * 0.06}>
                <Card className="flex h-full flex-col justify-end p-6 md:p-8">
                  <p className={`font-heading text-h3 font-extrabold md:text-h2-lg ${it.green ? "text-savings-text" : ""}`}>
                    <CountUp value={it.value} format={it.fmt} />
                  </p>
                  <p className="mt-2 text-caption text-muted">{it.label}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BillBar({ label, amount, ratio, tone }: { label: string; amount: number; ratio: number; tone: "navy" | "gold" }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-caption text-muted">{label}</span>
        <span className="font-heading text-h4 font-bold"><CountUp value={amount} format={formatINR} /></span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-fg/[0.06]">
        <motion.div
          className={tone === "navy" ? "h-full rounded-full bg-navy dark:bg-navy-400" : "h-full rounded-full bg-sun"}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.max(4, ratio * 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}
