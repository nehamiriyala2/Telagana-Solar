import "server-only";
import en from "../../../messages/en.json";
import te from "../../../messages/te.json";
import { site } from "@/config/site";
import { q, tx } from "./db";
import { SETTING_KEYS, SOCIAL_KEYS } from "./settings-schema";
import { HttpError } from "./lead-service";
import type { Staff } from "./auth";

const ten = (v: string | null | undefined) => {
  const d = (v ?? "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : "";
};
const meta = (m: unknown) => (m as { meta: { title: string; description: string } }).meta;

/** What the website uses today (src/config/site.ts + messages). Shown until an admin saves a value. */
export function settingDefaults(): Record<string, unknown> {
  const a = site.address;
  return {
    business_name: site.name,
    phone: ten(site.phone),
    whatsapp: ten(site.whatsapp),
    email: site.email,
    address: [a.street, a.city, a.region, a.postalCode, a.country].filter(Boolean).join(", "),
    map_link: site.mapEmbedUrl ?? "",
    office_hours: "Mon–Sat, 9 am – 7 pm",
    social_links: Object.fromEntries(SOCIAL_KEYS.map((k) => [k, (site.social as Record<string, string | null>)[k] ?? ""])),
    seo_title_en: meta(en).title, seo_title_te: meta(te).title,
    seo_desc_en: meta(en).description, seo_desc_te: meta(te).description,
    alert_recipients: process.env.OWNER_EMAIL && !/example\.com/.test(process.env.OWNER_EMAIL) ? [process.env.OWNER_EMAIL] : [],
  };
}

const parse = (v: unknown) => { if (typeof v !== "string") return v; try { return JSON.parse(v); } catch { return v; } };

export type SettingState = { value: unknown; saved: boolean; updatedBy: string | null; updatedAt: Date | null };

export async function loadSettings(): Promise<Record<string, SettingState>> {
  const rows = await q<{ key: string; value: string; updated_at: Date; name: string | null }>(
    "SELECT s.`key`, s.value, s.updated_at, st.name FROM settings s LEFT JOIN staff st ON st.id = s.updated_by WHERE s.`key` IN (" + SETTING_KEYS.map(() => "?").join(",") + ")",
    SETTING_KEYS,
  );
  const defaults = settingDefaults();
  return Object.fromEntries(SETTING_KEYS.map((k) => {
    const r = rows.find((x) => x.key === k);
    return [k, r ? { value: parse(r.value), saved: true, updatedBy: r.name, updatedAt: r.updated_at } : { value: defaults[k], saved: false, updatedBy: null, updatedAt: null }];
  }));
}

/** Saves changed keys; each change writes settings_history (old → new, who). Returns the keys that changed. */
export async function saveSettings(values: Record<string, unknown>, staff: Staff, opts: { historyKeyPrefix?: string } = {}): Promise<string[]> {
  return tx(async (conn) => {
    const changed: string[] = [];
    for (const [key, value] of Object.entries(values)) {
      const k = `${opts.historyKeyPrefix ?? ""}${key}`;
      const [rows] = await conn.execute("SELECT value FROM settings WHERE `key` = ? FOR UPDATE", [k]);
      const old = (rows as { value: string }[])[0];
      const oldVal = old ? parse(old.value) : (opts.historyKeyPrefix ? null : settingDefaults()[key] ?? null);
      if (old && JSON.stringify(oldVal) === JSON.stringify(value)) continue;
      await conn.execute(
        "INSERT INTO settings (`key`, value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by), updated_at = UTC_TIMESTAMP()",
        [k, JSON.stringify(value), staff.id],
      );
      await conn.execute("INSERT INTO settings_history (`key`, old_value, new_value, changed_by) VALUES (?, ?, ?, ?)",
        [k, JSON.stringify(oldVal ?? null), JSON.stringify(value), staff.id]);
      changed.push(key);
    }
    return changed;
  });
}

export async function settingHistory(key: string) {
  const rows = await q<{ id: number; old_value: string | null; new_value: string | null; changed_at: Date; name: string | null }>(
    "SELECT h.id, h.old_value, h.new_value, h.changed_at, s.name FROM settings_history h LEFT JOIN staff s ON s.id = h.changed_by WHERE h.`key` = ? ORDER BY h.id DESC LIMIT 50",
    [key],
  );
  return rows.map((r) => ({ id: r.id, oldValue: parse(r.old_value), newValue: parse(r.new_value), at: r.changed_at, by: r.name }));
}

/** A value from history: what the setting was before ("old") or after ("new") that change. */
export async function historyEntry(id: number, which: "old" | "new"): Promise<{ key: string; value: unknown }> {
  const [r] = await q<{ key: string; old_value: string | null; new_value: string | null }>("SELECT `key`, old_value, new_value FROM settings_history WHERE id = ?", [id]);
  if (!r) throw new HttpError(404, "not_found");
  return { key: r.key, value: parse(which === "old" ? r.old_value : r.new_value) };
}
