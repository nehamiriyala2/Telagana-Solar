import { z } from "zod";
import { adminRoute, jsonBody } from "@/lib/admin/api";
import { q, tx } from "@/lib/admin/db";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { TEMPLATE_KEYS, unknownVars } from "@/lib/admin/templates";
import { bannedPhrase } from "@/lib/admin/site-content";

export const dynamic = "force-dynamic";

export const GET = adminRoute(ROUTE_PERMS["templates.list"], async () =>
  Response.json({ templates: await q("SELECT `key`, lang, body, active, updated_at FROM wa_templates ORDER BY `key`, lang") }));

const Body = z.object({
  key: z.enum(TEMPLATE_KEYS),
  lang: z.enum(["en", "te"]),
  body: z.string().trim().min(1, "The message can’t be empty.").max(1000, "Keep it under 1000 characters."),
  active: z.boolean(),
});

/** PUT { key, lang, body, active } (admin). Unknown {variables} block saving. Logged in settings_history. */
export const PUT = adminRoute(ROUTE_PERMS["templates.save"], async (req, staff) => {
  const t = Body.parse(await jsonBody(req));
  const banned = bannedPhrase([t.body]);
  if (banned) return Response.json({ error: "banned_phrase", message: banned }, { status: 422 });
  const bad = unknownVars(t.body);
  if (bad.length) return Response.json({ error: "unknown_vars", message: `Unknown variable${bad.length > 1 ? "s" : ""}: ${bad.map((v) => `{${v}}`).join(", ")}. Use {name}, {kw}, {district}, {area} or {phone}.` }, { status: 422 });
  await tx(async (conn) => {
    const [rows] = await conn.execute("SELECT body, active FROM wa_templates WHERE `key` = ? AND lang = ? FOR UPDATE", [t.key, t.lang]);
    const old = (rows as { body: string; active: number }[])[0];
    if (old && old.body === t.body && Boolean(old.active) === t.active) return;
    await conn.execute(
      "INSERT INTO wa_templates (`key`, lang, body, active, updated_by) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE body = VALUES(body), active = VALUES(active), updated_by = VALUES(updated_by)",
      [t.key, t.lang, t.body, t.active ? 1 : 0, staff.id],
    );
    await conn.execute("INSERT INTO settings_history (`key`, old_value, new_value, changed_by) VALUES (?, ?, ?, ?)", [
      `wa_template:${t.key}:${t.lang}`, JSON.stringify(old ? { body: old.body, active: Boolean(old.active) } : null), JSON.stringify({ body: t.body, active: t.active }), staff.id,
    ]);
  });
  return Response.json({ ok: true });
});
