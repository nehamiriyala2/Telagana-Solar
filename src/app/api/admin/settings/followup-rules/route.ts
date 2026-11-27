import { adminRoute, jsonBody } from "@/lib/admin/api";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { saveSettings } from "@/lib/admin/settings-store";
import { FU_RULES_KEY, FuRulesSchema } from "@/lib/admin/followup-rules";

export const dynamic = "force-dynamic";

/** PUT { nextDays, defaultTime } → follow-up timing rules (admin). Saved with history. */
export const PUT = adminRoute(ROUTE_PERMS["settings.save"], async (req, staff) => {
  const rules = FuRulesSchema.parse(await jsonBody(req));
  const changed = await saveSettings({ [FU_RULES_KEY]: rules }, staff);
  return Response.json({ ok: true, changed: changed.length > 0 });
});
