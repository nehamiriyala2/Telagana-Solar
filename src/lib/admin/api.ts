import "server-only";
import { guardApi, type Staff } from "./auth";
import { errorResponse } from "./lead-service";
import type { Permission } from "./roles";

type Ctx<P> = { params: Promise<P> };

/**
 * Wraps an admin API handler: session → active staff → permission (401/403), then runs it and turns
 * thrown HttpError / ZodError into JSON responses. Every /api/admin route uses this.
 */
export function adminRoute<P = Record<string, string>>(perm: Permission, handler: (req: Request, staff: Staff, params: P) => Promise<Response>) {
  return async (req: Request, ctx: Ctx<P>) => {
    const g = await guardApi(perm);
    if (!g.ok) return g.res;
    try {
      return await handler(req, g.staff, await ctx.params);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export async function jsonBody(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { return null; }
}
