import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Calculator, Landmark, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DisplayTitle } from "@/components/ui/display-title";
import { titleEmphasis } from "@/data/pages";
import { pick } from "@/lib/utils";

/** 404: a sun behind a drifting cloud, the display title, and three ways back in. */
export default function NotFound() {
  const t = useTranslations();
  const locale = useLocale();
  const links = [
    { href: "/find-my-solar-plan", label: t("nav.siteVisit"), Icon: Sparkles },
    { href: "/savings-calculator", label: t("nav.calculator"), Icon: Calculator },
    { href: "/schemes", label: t("nav.schemes"), Icon: Landmark },
  ] as const;
  return (
    <section className="bg-premium-light dot-grid relative isolate grid min-h-[78svh] place-items-center overflow-hidden py-16">
      <div aria-hidden className="orb -left-32 top-10 size-96 bg-yellow/25" />
      <div className="container-page text-center">
        <div aria-hidden className="relative mx-auto mb-6 grid h-48 w-72 place-items-center">
          <span className="absolute size-44 animate-glow rounded-full bg-[radial-gradient(circle,rgb(245_168_0/0.4),transparent_68%)]" />
          <span className="absolute size-40 animate-rays rounded-full opacity-60 [background:repeating-conic-gradient(from_0deg,rgb(245_168_0/0.25)_0deg_4deg,transparent_4deg_16deg)] [mask-image:radial-gradient(circle,black_30%,transparent_70%)]" />
          <span className="size-24 rounded-full bg-[radial-gradient(circle_at_35%_35%,#FFE58A,#F5A800_55%,#E88A00)] shadow-[0_0_60px_rgb(255_199_44/0.6)]" />
          <span className="absolute right-0 top-20 h-14 w-36 animate-float rounded-full bg-white shadow-[0_20px_40px_-20px_rgb(7_23_63/0.35)]" />
          <span className="absolute right-16 top-14 h-14 w-20 animate-float rounded-full bg-white" />
        </div>
        <p className="font-heading text-[clamp(4rem,14vw,9rem)] font-extrabold leading-none tracking-[-0.05em] text-navy/10">404</p>
        <DisplayTitle text={t("notFound.title")} emphasis={pick(titleEmphasis.notFound, locale)} size="lg" className="-mt-6 md:-mt-10" />
        <p className="mx-auto mt-5 max-w-md animate-rise text-muted md:text-body-lg" style={{ animationDelay: "0.3s" }}>{t("notFound.body")}</p>
        <Button asChild size="lg" className="btn-shine mt-8 animate-rise" style={{ animationDelay: "0.4s" }}><Link href="/">{t("notFound.cta")}<ArrowRight aria-hidden /></Link></Button>
        <ul className="mx-auto mt-10 flex max-w-2xl animate-rise flex-wrap justify-center gap-3" style={{ animationDelay: "0.5s" }}>
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-caption font-semibold text-navy shadow-soft transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold">
                <Icon className="size-4 text-royal" aria-hidden />{label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
