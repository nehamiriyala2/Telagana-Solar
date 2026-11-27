import { z } from "zod";
import { adminRoute, jsonBody } from "@/lib/admin/api";
import { ROUTE_PERMS } from "@/lib/admin/route-perms";
import { validateSettings } from "@/lib/admin/settings-schema";
import { saveSettings } from "@/lib/admin/settings-store";

export const dynamic = "force-dynamic";

const Body = z.object({ values: z.record(z.string(), z.unknown()) });

/** PUT { values: { key: value } } → saves changed keys, each logged in settings_history. Admin only. */
export const PUT = adminRoute(ROUTE_PERMS["settings.save"], async (req, staff) => {
  const { values } = Body.parse(await jsonBody(req));
  const v = validateSettings(values);
  if (!v.ok) return Response.json({ error: "invalid", errors: v.errors }, { status: 422 });
  const changed = await saveSettings(v.values, staff);
  return Response.json({ ok: true, changed });
});
