import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { one } from "@/lib/admin/db";
import { fullIst } from "@/lib/admin/time";
import { CALC_KEY, DEFAULT_CALC, normalizeCalc } from "@/lib/calc-settings";
import { PageHeader } from "@/components/admin/ui";
import { CalculatorForm } from "@/components/admin/calculator/calculator-form";

export const metadata: Metadata = { title: "Calculator" };
export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  await requireStaff("calculator.edit");
  let row: { value: unknown; updated_at: Date; name: string | null } | null = null;
  try {
    row = await one("SELECT s.value, s.updated_at, st.name FROM settings s LEFT JOIN staff st ON st.id = s.updated_by WHERE s.`key` = ?", [CALC_KEY]);
  } catch { row = null; }
  const settings = row ? normalizeCalc(typeof row.value === "string" ? JSON.parse(row.value) : row.value) : DEFAULT_CALC;
  return (
    <>
      <PageHeader title="Calculator" subtitle={row ? `Settings for the public savings calculator. Last saved by ${row.name ?? "former staff"} · ${fullIst(row.updated_at)}.` : "Settings for the public savings calculator. Using the built-in defaults until you save."} />
      <CalculatorForm initial={settings} />
    </>
  );
}
