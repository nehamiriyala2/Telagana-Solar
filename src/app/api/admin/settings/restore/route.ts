import { z } from "zod";
import { adminRoute, jsonBody } from "@/lib/admin/api";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { SETTING_KEYS, validateSettings } from "@/lib/admin/settings-schema";
import { historyEntry, saveSettings } from "@/lib/admin/settings-store";

export const dynamic = "force-dynamic";

const Body = z.object({ history_id: z.number().int().positive(), which: z.enum(["old", "new"]) });

/** POST { history_id, which } → sets the setting back to that value (validated again, logged as a new change). */
export const POST = adminRoute(ROUTE_PERMS["settings.restore"], async (req, staff) => {
  const { history_id, which } = Body.parse(await jsonBody(req));
  const { key, value } = await historyEntry(history_id, which);
  if (!SETTING_KEYS.includes(key)) return Response.json({ error: "unknown_key" }, { status: 400 });
  const v = validateSettings({ [key]: value });
  if (!v.ok) return Response.json({ error: "invalid", message: "That old value is no longer valid.", errors: v.errors }, { status: 422 });
  await saveSettings(v.values, staff);
  return Response.json({ ok: true, key });
});
