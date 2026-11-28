import { z } from "zod";
import { adminRoute, jsonBody } from "@/lib/admin/api";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { HttpError } from "@/lib/admin/lead-service";
import { StagesSchema } from "@/lib/admin/stages";
import { STAGES_KEY, loadStages } from "@/lib/admin/stages-store";
import { historyEntry, saveSettings, settingHistory } from "@/lib/admin/settings-store";
import { fullIst } from "@/lib/admin/time";

export const dynamic = "force-dynamic";

const issue = (e: z.ZodError) => e.issues[0]?.message ?? "Check the stages and try again.";

/** GET → current stages + last 50 changes (who, when). Admin only. */
export const GET = adminRoute(ROUTE_PERMS["settings.history"], async () => {
  const [stages, history] = await Promise.all([loadStages(), settingHistory(STAGES_KEY)]);
  return Response.json({ stages, history: history.map((h) => ({ id: h.id, at: fullIst(h.at), by: h.by })) });
});

/** PUT { stages } → validates (all stages present once, New/Won/Lost visible, unique names) and saves with history. */
export const PUT = adminRoute(ROUTE_PERMS["settings.save"], async (req, staff) => {
  const body = z.object({ stages: z.unknown() }).parse(await jsonBody(req));
  const r = StagesSchema.safeParse(body.stages);
  if (!r.success) return Response.json({ error: "invalid", message: issue(r.error) }, { status: 422 });
  const changed = await saveSettings({ [STAGES_KEY]: r.data }, staff);
  return Response.json({ ok: true, changed: changed.length > 0 });
});

/** POST { history_id } → puts the stages back to how they were after that change (logged as a new change). */
export const POST = adminRoute(ROUTE_PERMS["settings.restore"], async (req, staff) => {
  const { history_id } = z.object({ history_id: z.number().int().positive() }).parse(await jsonBody(req));
  const { key, value } = await historyEntry(history_id, "new");
  if (key !== STAGES_KEY) throw new HttpError(400, "unknown_key");
  const r = StagesSchema.safeParse(value);
  if (!r.success) return Response.json({ error: "invalid", message: "That version is no longer valid." }, { status: 422 });
  await saveSettings({ [STAGES_KEY]: r.data }, staff);
  return Response.json({ ok: true });
});
