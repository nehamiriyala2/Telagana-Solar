import type { L10n } from "@/lib/types";

/**
 * Copy for /savings-calculator (the calculator itself is unchanged).
 * The numbers shown in "How we estimate" come straight from src/config/calculator.ts.
 */
export const calculatorPage = {
  assumptionsTitle: { en: "How we estimate your savings", te: "మీ ఆదాను మేము ఎలా అంచనా వేస్తాం" },
  assumptionsEmphasis: { en: "estimate", te: "అంచనా" },
  assumptionsNote: {
    en: "These are the assumptions behind every result. Your real numbers depend on your roof, shade, tariff and current scheme rules. We confirm them during your plan.",
    te: "ప్రతి ఫలితం వెనుక ఉన్న అంచనాలు ఇవి. మీ అసలు సంఖ్యలు మీ పైకప్పు, నీడ, టారిఫ్, ప్రస్తుత పథకం నియమాలపై ఆధారపడతాయి. మీ ప్లాన్ సమయంలో మేము నిర్ధారిస్తాం.",
  },
  stats: {
    generation: { label: { en: "Units made per kW, per month", te: "ఒక kWకు నెలకు తయారయ్యే యూనిట్లు" }, suffix: { en: " units", te: " యూనిట్లు" } },
    roof: { label: { en: "Shade-free roof needed per kW", te: "ఒక kWకు కావలసిన నీడ లేని పైకప్పు" }, suffix: { en: " sq ft", te: " చ.అ." } },
    tariff: { label: { en: "Average home tariff used", te: "వాడిన సగటు గృహ టారిఫ్" }, suffix: { en: " / unit", te: " / యూనిట్" } },
    life: { label: { en: "Years of savings in the chart", te: "చార్ట్‌లో ఆదా సంవత్సరాలు" }, suffix: { en: " years", te: " సంవత్సరాలు" } },
  } as Record<string, { label: L10n; suffix: L10n }>,
  tipsTitle: { en: "Get a sharper estimate", te: "మరింత ఖచ్చితమైన అంచనా కోసం" },
  tips: [
    { en: "Use the average of your last 6–12 bills, not just one month.", te: "ఒక్క నెల కాకుండా, గత 6–12 బిల్లుల సగటు వాడండి." },
    { en: "Check how much roof gets sun from 9 am to 4 pm.", te: "ఉదయం 9 నుండి సాయంత్రం 4 వరకు ఎంత పైకప్పుపై ఎండ పడుతుందో చూడండి." },
    { en: "Plan for new appliances, like an AC or EV, you will add soon.", te: "త్వరలో కొనబోయే AC, EV వంటివి కూడా లెక్కలో వేయండి." },
  ] as L10n[],
};
