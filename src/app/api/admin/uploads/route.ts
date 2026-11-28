import { guardApi } from "@/lib/admin/auth";
import { audit } from "@/lib/admin/audit";
import { errorResponse, HttpError } from "@/lib/admin/lead-service";
import { isFolder, saveImage } from "@/lib/admin/media";
import { overLimit } from "@/lib/admin/rate-limit";
import { can, type Permission } from "@/lib/admin/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PERM: Record<string, Permission> = { projects: "projects.edit", posts: "content.edit", districts: "districts.edit", site: "content.edit" };

/** POST multipart { file, folder } → { path, thumb } of a compressed WebP. Max 8 MB. */
export async function POST(req: Request) {
  const g = await guardApi();
  if (!g.ok) return g.res;
  try {
    const form = await req.formData().catch(() => null);
    const folder = String(form?.get("folder") ?? "");
    const file = form?.get("file");
    if (!isFolder(folder)) throw new HttpError(400, "bad_folder");
    if (!can(g.staff.role, PERM[folder])) return Response.json({ error: "forbidden" }, { status: 403 });
    if (!(file instanceof File)) throw new HttpError(400, "no_file", "Choose an image to upload.");
    if (await overLimit("upload-staff", String(g.staff.id), 200, 3600)) throw new HttpError(429, "rate_limited", "Too many uploads in the last hour.");
    const out = await saveImage(file, folder);
    await audit(g.staff.id, "image_uploaded", `media:${out.path}`, { folder, bytes: file.size });
    return Response.json({ ok: true, ...out }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
