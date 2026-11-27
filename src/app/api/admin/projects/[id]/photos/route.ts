import { z } from "zod";
import { adminRoute, jsonBody } from "@/lib/admin/api";
import { HttpError } from "@/lib/admin/lead-service";
import { saveImage } from "@/lib/admin/media";
import { PhotosPatch, addPhoto, listPhotos, removePhoto, updatePhotos } from "@/lib/admin/cms/photos";
import { rowId } from "@/lib/admin/cms/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type P = { id: string };

export const GET = adminRoute<P>("projects.edit", async (_req, _staff, { id }) => Response.json({ photos: await listPhotos(rowId(id)) }));

/** POST multipart { file, alt } → compressed WebP + 480px thumbnail, added at the end. */
export const POST = adminRoute<P>("projects.edit", async (req, staff, { id }) => {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const alt = String(form?.get("alt") ?? "").trim().slice(0, 200);
  if (!(file instanceof File)) throw new HttpError(400, "no_file", "Choose a photo to upload.");
  if (alt.length < 3) throw new HttpError(400, "alt_required", "Describe the photo (alt text) before uploading, e.g. “3 kW panels on a terrace in Hanamkonda”.");
  const img = await saveImage(file, "projects");
  const photoId = await addPhoto(rowId(id), img, alt, staff);
  return Response.json({ ok: true, id: photoId }, { status: 201 });
});

/** PATCH { order?: [ids], cover?: id, alt?: { id, text } } */
export const PATCH = adminRoute<P>("projects.edit", async (req, staff, { id }) => {
  await updatePhotos(rowId(id), PhotosPatch.parse(await jsonBody(req)), staff);
  return Response.json({ ok: true });
});

/** DELETE ?photo=<id> */
export const DELETE = adminRoute<P>("projects.edit", async (req, staff, { id }) => {
  const photo = z.coerce.number().int().positive().parse(new URL(req.url).searchParams.get("photo"));
  await removePhoto(rowId(id), photo, staff);
  return Response.json({ ok: true });
});
