import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="container-page grid min-h-[70svh] place-items-center pt-[var(--header-h)] text-center">
      <div>
        <div aria-hidden className="mx-auto mb-8 size-28 rounded-full bg-[radial-gradient(circle_at_40%_35%,#FFE7A3,#FFB800_45%,#FF8A00)] opacity-60 shadow-glow" />
        <h1 className="text-h2 md:text-h2-lg">{t("title")}</h1>
        <Button asChild className="mt-8"><Link href="/">{t("cta")}</Link></Button>
      </div>
    </div>
  );
}
