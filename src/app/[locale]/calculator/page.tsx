import { permanentRedirect } from "next/navigation";

/** /calculator is a short alias: the calculator lives at /savings-calculator (kept so existing links keep working). */
export default async function CalculatorAlias({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect(locale === "te" ? "/te/savings-calculator" : "/savings-calculator");
}
