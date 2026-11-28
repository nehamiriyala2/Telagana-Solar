import "server-only";
import type { Lead } from "@/lib/leads";
import { exec, one, tx } from "./db";
import { phone10 } from "./phone";

import { USE, leadSource } from "./lead-source";
export { leadSource, utmFromReferer, type LeadSource } from "./lead-source";

/**
 * Saves a website lead to MySQL and logs a "created" activity. Returns the new row id.
 * Numbers are stored as numbers; the payload exactly as received is kept in `raw`.
 */
export async function insertWebsiteLead(l: Lead, raw: unknown, attr: { utm_source: string | null; utm_campaign: string | null; referrer: string | null }): Promise<number> {
  const slug = (l.district ?? l.location ?? "").trim().toLowerCase();
  const district = /^[a-z][a-z-]{1,58}$/.test(slug) ? await one<{ id: number }>("SELECT id FROM districts WHERE slug = ?", [slug]) : null;
  const source = leadSource(l);
  const calc = l.calc ?? null;

  return tx(async (conn) => {
    const [res] = await conn.execute(
      `INSERT INTO leads (public_id, submitted_at, source, kind, name, phone, phone_normalized, area, use_type, bill, units, kw,
         monthly_saving, message, lang, page, package_id, calc, raw, district_id, utm_source, utm_campaign, referrer, consent_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        l.id, new Date(l.createdAt), source, l.kind, l.name || null, l.phone || null, phone10(l.phone),
        district ? null : (l.location?.trim() || null),
        USE[l.propertyType ?? calc?.type ?? ""] ?? null,
        l.monthlyBill ?? calc?.monthlyBill ?? null,
        calc?.monthlyUnits || null,
        calc?.kw || null,
        calc?.monthlySaving || null,
        l.message || null, l.locale, l.sourcePage.slice(0, 255), l.packageId ?? null,
        calc ? JSON.stringify(calc) : null, JSON.stringify(raw ?? null), district?.id ?? null,
        attr.utm_source, attr.utm_campaign, attr.referrer, l.consent ? new Date(l.createdAt) : null,
      ],
    );
    const id = (res as { insertId: number }).insertId;
    await conn.execute("UPDATE leads SET lead_no = CONCAT('TS-', LPAD(id, 4, '0')) WHERE id = ?", [id]);
    await conn.execute("INSERT INTO lead_activity (lead_id, action, details) VALUES (?, 'created', ?)", [id, JSON.stringify({ source, kind: l.kind })]);
    return id;
  });
}

/** Appends to a lead's activity timeline. staffId null = system. Never put customer data in details. */
export async function logActivity(leadId: number, action: string, details: Record<string, unknown> | null = null, staffId: number | null = null) {
  await exec("INSERT INTO lead_activity (lead_id, staff_id, action, details) VALUES (?, ?, ?, ?)", [leadId, staffId, action, details ? JSON.stringify(details) : null]);
}
