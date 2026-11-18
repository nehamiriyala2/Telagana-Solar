import { getTranslations } from "next-intl/server";
import { EditMark } from "@/components/ui/badge";

const LAST_UPDATED = "2026-11-17"; // [EDIT] update when the policy changes

function WithEdit({ text }: { text: string }) {
  const parts = text.split("[EDIT]");
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && <EditMark className="mx-1" />}{p}</span>)}</>;
}

export async function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const t = await getTranslations("legal");
  return (
    <div className="container-page max-w-3xl pb-20 pt-12 md:pt-16">
      <h1 className="text-hero md:text-h2-lg">{t(`${doc}.title`)}</h1>
      <p className="mt-3 text-caption text-muted">{t("updated", { date: LAST_UPDATED })}</p>
      <p className="mt-6 text-muted"><WithEdit text={t(`${doc}.intro`)} /></p>
      <div className="mt-10 space-y-8">
        {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((s) => (
          <section key={s}>
            <h2 className="text-h4">{t(`${doc}.${s}.h`)}</h2>
            <p className="mt-2 text-muted"><WithEdit text={t(`${doc}.${s}.p`)} /></p>
          </section>
        ))}
      </div>
    </div>
  );
}
