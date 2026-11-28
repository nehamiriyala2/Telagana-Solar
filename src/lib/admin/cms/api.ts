import "server-only";
import { guardApi, type Staff } from "../auth";
import { HttpError, errorResponse } from "../lead-service";
import { COLLECTIONS } from "./collections";
import type { CollectionDef } from "./types";

type Ctx<P> = { params: Promise<P> };

/** Like adminRoute, but the permission comes from the collection being edited (schemes.edit, content.edit …). */
export function cmsRoute<P extends { collection: string }>(handler: (req: Request, staff: Staff, c: CollectionDef, params: P) => Promise<Response>) {
  return async (req: Request, ctx: Ctx<P>) => {
    const params = await ctx.params;
    const c = COLLECTIONS[params.collection];
    if (!c) return Response.json({ error: "not_found" }, { status: 404 });
    const g = await guardApi(c.perm);
    if (!g.ok) return g.res;
    try { return await handler(req, g.staff, c, params); } catch (e) { return errorResponse(e); }
  };
}

export function rowId(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(404, "not_found");
  return n;
}
