import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="container-page grid min-h-[70svh] place-items-center py-16 text-center">
      <div>
        <div aria-hidden className="relative mx-auto mb-8 grid size-36 place-items-center">
          <span className="absolute inset-0 animate-glow rounded-full bg-[radial-gradient(circle,rgb(245_168_0/0.35),transparent_68%)]" />
          <span className="size-20 rounded-full bg-[radial-gradient(circle_at_35%_35%,#FFE58A,#F5A800_55%,#E88A00)] opacity-70" />
          <span className="absolute right-2 top-10 h-10 w-24 animate-float rounded-full bg-white shadow-soft" />
        </div>
        <p className="font-heading text-h2 font-extrabold text-sky-ink">404</p>
        <h1 className="mt-2 text-h2 md:text-h2-lg">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("body")}</p>
        <Button asChild className="mt-8"><Link href="/">{t("cta")}<ArrowRight aria-hidden /></Link></Button>
      </div>
    </div>
  );
}
