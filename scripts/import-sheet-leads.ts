/**
 * npm run leads:import -- path/to/Leads.csv [--dry-run]
 *
 * Imports old leads from the Google Sheet "Leads" tab (File → Download → CSV).
 * Expected header (from automation/google-sheets-apps-script.gs):
 *   created_at, kind, name, phone, location, property_type, monthly_bill, temperature, tags,
 *   slot_date, slot_time, package_id, message, calc, source_page, locale, status, id
 * Every imported lead gets status "new". Rows already in MySQL (same website id, or same phone + timestamp)
 * and WhatsApp-click rows are skipped. Prints counts only, never customer data.
 */
import { readFileSync } from "node:fs";
import { connect, run } from "./_db";
import { USE, leadSource } from "../src/lib/admin/lead-source";
import { parseCsv } from "../src/lib/admin/csv";

function phone10(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  const ten = d.length === 12 && d.startsWith("91") ? d.slice(2) : d.length === 11 && d.startsWith("0") ? d.slice(1) : d;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}
const num = (v: string) => { const n = Number(String(v).replace(/[₹,\s]/g, "")); return v.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : null; };

run(async () => {
  const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
  const dry = process.argv.includes("--dry-run");
  if (!file) throw new Error("Usage: npm run leads:import -- path/to/Leads.csv [--dry-run]");

  const [header, ...rows] = parseCsv(readFileSync(file, "utf8"));
  const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name);
  const need = ["created_at", "kind", "phone"];
  const missing = need.filter((n) => col(n) < 0);
  if (missing.length) throw new Error(`CSV is missing column(s): ${missing.join(", ")}. Export the "Leads" tab as CSV.`);
  const get = (r: string[], name: string) => (col(name) >= 0 ? (r[col(name)] ?? "").trim() : "");

  const db = await connect();
  const [d] = await db.query("SELECT id, slug FROM districts");
  const districts = new Map((d as { id: number; slug: string }[]).map((x) => [x.slug, x.id]));

  const stats = { imported: 0, duplicate: 0, whatsapp: 0, invalid: 0 };
  for (const r of rows) {
    const kind = get(r, "kind");
    if (kind === "whatsapp_click" || kind === "whatsapp click") { stats.whatsapp++; continue; }
    const created = new Date(get(r, "created_at"));
    if (Number.isNaN(created.getTime())) { stats.invalid++; continue; }
    const phone = get(r, "phone");
    const ten = phone10(phone);
    const publicId = get(r, "id") || null;

    const [dup] = await db.execute(
      "SELECT id FROM leads WHERE (public_id IS NOT NULL AND public_id = ?) OR (phone_normalized = ? AND submitted_at = ?) LIMIT 1",
      [publicId ?? "", ten ?? "", created],
    );
    if ((dup as unknown[]).length) { stats.duplicate++; continue; }

    let calc: Record<string, unknown> | null = null;
    try { calc = get(r, "calc") ? JSON.parse(get(r, "calc")) : null; } catch { calc = null; }
    const location = get(r, "location");
    const districtId = districts.get(location.toLowerCase()) ?? null;
    const propertyType = get(r, "property_type") || (calc?.type as string | undefined) || "";
    const page = get(r, "source_page") || "unknown";
    const source = leadSource({ kind: kind as never, sourcePage: page, calc: calc as never, propertyType: propertyType as never });

    stats.imported++;
    if (dry) continue;
    const [res] = await db.execute(
      `INSERT INTO leads (public_id, created_at, submitted_at, source, kind, name, phone, phone_normalized, area, use_type, bill, units, kw,
         monthly_saving, message, lang, page, package_id, calc, raw, district_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        publicId, created, created, source, kind || null, get(r, "name") || null, phone || null, ten,
        districtId ? null : location || null, USE[propertyType] ?? null,
        num(get(r, "monthly_bill")) ?? (calc?.monthlyBill as number) ?? null, (calc?.monthlyUnits as number) || null, (calc?.kw as number) || null,
        (calc?.monthlySaving as number) || null, get(r, "message") || null, get(r, "locale") === "te" ? "te" : "en", page.slice(0, 255),
        get(r, "package_id") || null, calc ? JSON.stringify(calc) : null, JSON.stringify(Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""]))), districtId,
      ],
    );
    const id = (res as { insertId: number }).insertId;
    await db.execute("UPDATE leads SET lead_no = CONCAT('TS-', LPAD(id, 4, '0')) WHERE id = ?", [id]);
    await db.execute("INSERT INTO lead_activity (lead_id, action, details, created_at) VALUES (?, 'created', ?, ?)", [id, JSON.stringify({ source, imported: "google-sheet" }), created]);
  }
  console.log(`${dry ? "DRY RUN · would import" : "✔ Imported"} ${stats.imported} · skipped ${stats.duplicate} already in MySQL · ${stats.whatsapp} WhatsApp clicks · ${stats.invalid} without a valid date`);
  await db.end();
});
