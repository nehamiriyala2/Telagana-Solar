import { z } from "zod";
import { adminRoute, jsonBody } from "@/lib/admin/api";
import { HttpError } from "@/lib/admin/lead-service";
import { refreshPublicSite } from "@/lib/admin/cms/store";
import { historyEntry, saveSettings, settingHistory } from "@/lib/admin/settings-store";
import { fullIst } from "@/lib/admin/time";
import { CALC_KEY, CalcSchema } from "@/lib/calc-settings";

export const dynamic = "force-dynamic";

/** GET → last 50 versions (who, when). */
export const GET = adminRoute("calculator.edit", async () => {
  const h = await settingHistory(CALC_KEY);
  return Response.json({ history: h.map((x) => ({ id: x.id, at: fullIst(x.at), by: x.by })) });
});

/** PUT { settings } → validated, saved with history; the public calculator uses it on the next page view. */
export const PUT = adminRoute("calculator.edit", async (req, staff) => {
  const { settings } = z.object({ settings: z.unknown() }).parse(await jsonBody(req));
  const s = CalcSchema.parse(settings);
  const changed = await saveSettings({ [CALC_KEY]: s }, staff);
  if (changed.length) refreshPublicSite();
  return Response.json({ ok: true, changed: changed.length > 0 });
});

/** POST { history_id } → restore that version (logged as a new change). */
export const POST = adminRoute("calculator.edit", async (req, staff) => {
  const { history_id } = z.object({ history_id: z.number().int().positive() }).parse(await jsonBody(req));
  const { key, value } = await historyEntry(history_id, "new");
  if (key !== CALC_KEY) throw new HttpError(400, "unknown_key");
  const s = CalcSchema.safeParse(value);
  if (!s.success) throw new HttpError(422, "invalid", "That version is no longer valid.");
  await saveSettings({ [CALC_KEY]: s.data }, staff);
  refreshPublicSite();
  return Response.json({ ok: true });
});
