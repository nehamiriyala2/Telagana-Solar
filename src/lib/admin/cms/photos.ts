import "server-only";
import { z } from "zod";
import { audit } from "../audit";
import { exec, one, q, tx } from "../db";
import { HttpError } from "../lead-service";
import type { Staff } from "../auth";
import { refreshPublicSite } from "./store";

export const MAX_PHOTOS = 12;

export async function listPhotos(projectId: number) {
  return q<{ id: number; path: string; thumb_path: string; alt: string; is_cover: number; sort_order: number }>(
    "SELECT id, path, thumb_path, alt, is_cover, sort_order FROM project_photos WHERE project_id = ? ORDER BY sort_order, id", [projectId]);
}

async function ensureProject(projectId: number) {
  const p = await one<{ id: number }>("SELECT id FROM projects WHERE id = ? AND deleted_at IS NULL", [projectId]);
  if (!p) throw new HttpError(404, "not_found");
}

export async function addPhoto(projectId: number, img: { path: string; thumb: string }, alt: string, staff: Staff) {
  await ensureProject(projectId);
  const [{ n }] = await q<{ n: number }>("SELECT COUNT(*) AS n FROM project_photos WHERE project_id = ?", [projectId]);
  if (Number(n) >= MAX_PHOTOS) throw new HttpError(400, "too_many", `Up to ${MAX_PHOTOS} photos per project.`);
  const r = await exec("INSERT INTO project_photos (project_id, path, thumb_path, alt, is_cover, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
    [projectId, img.path, img.thumb, alt, Number(n) === 0 ? 1 : 0, Number(n)]);
  await audit(staff.id, "project_photo_added", `projects:${projectId}`, { photo: r.insertId });
  refreshPublicSite();
  return r.insertId;
}

export const PhotosPatch = z.object({
  order: z.array(z.number().int().positive()).max(MAX_PHOTOS).optional(),
  cover: z.number().int().positive().optional(),
  alt: z.object({ id: z.number().int().positive(), text: z.string().trim().min(3, "Describe the photo in a few words.").max(200) }).optional(),
}).strict();

export async function updatePhotos(projectId: number, input: z.infer<typeof PhotosPatch>, staff: Staff) {
  await ensureProject(projectId);
  await tx(async (conn) => {
    const [rows] = await conn.execute("SELECT id FROM project_photos WHERE project_id = ?", [projectId]);
    const ids = new Set((rows as { id: number }[]).map((r) => r.id));
    const own = (x: number) => { if (!ids.has(x)) throw new HttpError(404, "not_found"); };
    if (input.order) { input.order.forEach(own); for (const [i, pid] of input.order.entries()) await conn.execute("UPDATE project_photos SET sort_order = ? WHERE id = ?", [i, pid]); }
    if (input.cover) { own(input.cover); await conn.execute("UPDATE project_photos SET is_cover = (id = ?) WHERE project_id = ?", [input.cover, projectId]); }
    if (input.alt) { own(input.alt.id); await conn.execute("UPDATE project_photos SET alt = ? WHERE id = ?", [input.alt.text, input.alt.id]); }
  });
  await audit(staff.id, "project_photos_updated", `projects:${projectId}`, { order: !!input.order, cover: input.cover ?? null, alt: input.alt?.id ?? null });
  refreshPublicSite();
}

export async function removePhoto(projectId: number, photoId: number, staff: Staff) {
  const r = await exec("DELETE FROM project_photos WHERE id = ? AND project_id = ?", [photoId, projectId]);
  if (!r.affectedRows) throw new HttpError(404, "not_found");
  // Keep one cover photo.
  await exec("UPDATE project_photos SET is_cover = 1 WHERE project_id = ? AND NOT EXISTS (SELECT 1 FROM (SELECT id FROM project_photos WHERE project_id = ? AND is_cover = 1) x) ORDER BY sort_order LIMIT 1", [projectId, projectId]);
  await audit(staff.id, "project_photo_removed", `projects:${projectId}`, { photo: photoId });
  refreshPublicSite();
}
