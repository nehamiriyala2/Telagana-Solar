import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import type { Lead } from "@/lib/leads";

/**
 * Lead storage. Every configured target receives the lead:
 *  1. Supabase table `leads`   (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY): needed for 1-hour reminders
 *  2. Webhook (LEAD_WEBHOOK_URL): Google Sheets Apps Script, Zapier, Make, n8n…
 *  3. Local file .data/leads.jsonl: development only, so the flow works with no keys
 */
let _db: SupabaseClient | null | undefined;
export function db(): SupabaseClient | null {
  if (_db !== undefined) return _db;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  _db = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return _db;
}

export function toRow(l: Lead) {
  return {
    id: l.id,
    created_at: l.createdAt,
    kind: l.kind,
    name: l.name ?? null,
    phone: l.phoneE164,
    location: l.location ?? null,
    property_type: l.propertyType ?? l.calc?.type ?? null,
    monthly_bill: l.monthlyBill ?? l.calc?.monthlyBill ?? null,
    message: l.message ?? null,
    slot_date: l.slotDate ?? null,
    slot_time: l.slotTime ?? null,
    calc: l.calc ?? null,
    package_id: l.packageId ?? null,
    tags: l.tags,
    temperature: l.temperature,
    source_page: l.sourcePage,
    locale: l.locale,
    status: l.kind === "whatsapp_click" ? "event" : "new",
  };
}

export async function saveLead(l: Lead): Promise<{ stored: string[]; errors: string[] }> {
  const stored: string[] = [];
  const errors: string[] = [];
  const row = toRow(l);

  const supa = db();
  if (supa) {
    const { error } = await supa.from("leads").insert(row);
    if (error) errors.push(`supabase: ${error.message}`); else stored.push("supabase");
  }

  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(process.env.LEAD_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.LEAD_WEBHOOK_SECRET } : {}) },
        // Flat shape is easiest for spreadsheets
        body: JSON.stringify({ ...row, tags: row.tags.join(", "), calc: row.calc ? JSON.stringify(row.calc) : "", secret: process.env.LEAD_WEBHOOK_SECRET ?? undefined }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) stored.push("webhook"); else errors.push(`webhook: HTTP ${res.status}`);
    } catch (e) { errors.push(`webhook: ${(e as Error).message}`); }
  }

  if (process.env.NODE_ENV !== "production") {
    const dir = path.join(process.cwd(), ".data");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(row) + "\n");
    stored.push("local-file");
  }
  return { stored, errors };
}
