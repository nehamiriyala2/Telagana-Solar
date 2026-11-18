import { getTranslations } from "next-intl/server";
import { EditMark } from "@/components/ui/badge";
import { DisplayTitle } from "@/components/ui/display-title";
import { SolarBackdrop } from "./solar-backdrop";

const LAST_UPDATED = "2026-11-17"; // [EDIT] update when the policy changes

function WithEdit({ text }: { text: string }) {
  const parts = text.split("[EDIT]");
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && <EditMark className="mx-1" />}{p}</span>)}</>;
}

/** Privacy / Terms: soft solar hero, then the sections in one readable card. Text unchanged. */
export async function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const t = await getTranslations("legal");
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <SolarBackdrop sun={{ x: "90%", y: "10%" }} particles={false} />
        <div className="container-page max-w-3xl pb-14 pt-12 md:pb-16 md:pt-16">
          <DisplayTitle text={t(`${doc}.title`)} size="lg" />
          <p className="mt-4 animate-rise text-caption font-semibold text-[var(--ts-text)]" style={{ animationDelay: "0.2s" }}>{t("updated", { date: LAST_UPDATED })}</p>
          <p className="mt-5 animate-rise text-[var(--ts-text)] md:text-body-lg" style={{ animationDelay: "0.3s" }}><WithEdit text={t(`${doc}.intro`)} /></p>
        </div>
      </section>
      <div className="bg-section-white pb-20">
        <div className="container-page max-w-3xl">
          <div className="space-y-8 rounded-[1.75rem] border border-line bg-white p-6 shadow-soft md:p-10">
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((s) => (
              <section key={s}>
                <h2 className="text-h4 text-navy">{t(`${doc}.${s}.h`)}</h2>
                <p className="mt-2 text-[var(--ts-text)]"><WithEdit text={t(`${doc}.${s}.p`)} /></p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
