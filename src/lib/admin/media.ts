import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { HttpError } from "./lead-service";

/**
 * Uploaded images live in storage/media (outside /public, so they work after a production build too)
 * and are served by app/media/[...path]. Every upload is re-encoded to WebP: this strips EXIF
 * (GPS location of customers' homes), caps the size and blocks non-image files.
 */
export const MEDIA_ROOT = path.join(process.cwd(), "storage", "media");
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const FOLDERS = ["projects", "posts", "districts", "site"] as const;
export type MediaFolder = (typeof FOLDERS)[number];
export const isFolder = (f: string): f is MediaFolder => (FOLDERS as readonly string[]).includes(f);

export async function saveImage(file: File, folder: MediaFolder): Promise<{ path: string; thumb: string; width: number; height: number }> {
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "too_large", "Images must be under 8 MB.");
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) throw new HttpError(400, "bad_type", "Upload a JPG, PNG, WebP or AVIF image.");
  const input = Buffer.from(await file.arrayBuffer());
  let img: Sharp;
  try {
    img = sharp(input, { failOn: "error", limitInputPixels: 50_000_000 }).rotate();
    await img.metadata();
  } catch { throw new HttpError(400, "bad_image", "That file isn’t a readable image."); }
  const month = new Date().toISOString().slice(0, 7);
  const dir = path.join(MEDIA_ROOT, folder, month);
  await mkdir(dir, { recursive: true });
  const name = randomBytes(9).toString("base64url");
  const full = await img.clone().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  const thumb = await img.clone().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
  await writeFile(path.join(dir, `${name}.webp`), full.data);
  await writeFile(path.join(dir, `${name}-480.webp`), thumb);
  const base = `/media/${folder}/${month}/${name}`;
  return { path: `${base}.webp`, thumb: `${base}-480.webp`, width: full.info.width, height: full.info.height };
}
