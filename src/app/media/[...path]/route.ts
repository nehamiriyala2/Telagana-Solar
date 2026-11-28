import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { MEDIA_ROOT } from "@/lib/admin/media";

export const runtime = "nodejs";

/** Serves uploaded images from storage/media. Only .webp files made by the uploader; no path tricks. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  if (!parts.every((p) => /^[\w-]+(\.webp)?$/.test(p)) || !parts.at(-1)?.endsWith(".webp")) return new Response("Not found", { status: 404 });
  const file = path.join(MEDIA_ROOT, ...parts);
  if (!file.startsWith(MEDIA_ROOT + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const [buf, info] = await Promise.all([readFile(file), stat(file)]);
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": "image/webp", "Content-Length": String(info.size), "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
