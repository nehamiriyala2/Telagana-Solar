import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EditMark } from "@/components/ui/badge";
import { DisplayTitle } from "@/components/ui/display-title";
import { SolarBackdrop } from "./solar-backdrop";

const LAST_UPDATED = "2026-11-17"; // [EDIT] update when the policy changes

function WithEdit({ text }: { text: string }) {
  const parts = text.split("[EDIT]");
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && <EditMark className="mx-1" />}{p}</span>)}</>;
}

/** Privacy / Terms: light mist band with a sky-blue breadcrumb, then the sections in one readable card. Text unchanged. */
export async function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const t = await getTranslations("legal");
  const tn = await getTranslations("nav");
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <SolarBackdrop sun={{ x: "90%", y: "10%" }} particles={false} />
        <div className="container-page max-w-3xl pb-14 pt-12 md:pb-16 md:pt-16">
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumb flex flex-wrap items-center gap-2 text-primary">
              <li><Link href="/" className="text-muted transition-colors hover:text-primary">{tn("home")}</Link></li>
              <li aria-hidden className="text-gold">/</li>
              <li aria-current="page">{t(`${doc}.title`)}</li>
            </ol>
          </nav>
          <DisplayTitle text={t(`${doc}.title`)} size="lg" className="mt-5" />
          <p className="mt-4 animate-rise text-caption font-semibold text-muted" style={{ animationDelay: "0.2s" }}>{t("updated", { date: LAST_UPDATED })}</p>
          <p className="mt-5 animate-rise text-body md:text-body-lg" style={{ animationDelay: "0.3s" }}><WithEdit text={t(`${doc}.intro`)} /></p>
        </div>
      </section>
      <div className="bg-cloud py-14 md:py-20">
        <div className="container-page max-w-3xl">
          <div className="space-y-8 rounded-[1.25rem] border border-line bg-white p-6 shadow-soft md:p-10">
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((s) => (
              <section key={s}>
                <h2 className="text-h4 text-ink">{t(`${doc}.${s}.h`)}</h2>
                <p className="mt-2 text-[var(--ts-text)]"><WithEdit text={t(`${doc}.${s}.p`)} /></p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
