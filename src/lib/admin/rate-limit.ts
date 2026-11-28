import "server-only";
import { createHash } from "node:crypto";
import { exec, one } from "./db";

/**
 * Fixed-window rate limit stored in MySQL (`rate_limits`), so it holds across restarts and processes.
 * Keys are hashed: no raw IPs or emails are stored.
 * Returns true when the caller is OVER the limit.
 */
export async function overLimit(scope: string, id: string, max: number, windowSeconds: number): Promise<boolean> {
  const key = `${scope}:${createHash("sha256").update(id.toLowerCase()).digest("hex").slice(0, 40)}`;
  await exec(
    `INSERT INTO rate_limits (\`key\`, count, window_start) VALUES (?, 1, UTC_TIMESTAMP())
     ON DUPLICATE KEY UPDATE
       count = IF(window_start < UTC_TIMESTAMP() - INTERVAL ? SECOND, 1, count + 1),
       window_start = IF(window_start < UTC_TIMESTAMP() - INTERVAL ? SECOND, UTC_TIMESTAMP(), window_start)`,
    [key, windowSeconds, windowSeconds],
  );
  const row = await one<{ count: number }>("SELECT count FROM rate_limits WHERE `key` = ?", [key]);
  // Occasional housekeeping of stale windows.
  if (Math.random() < 0.02) await exec("DELETE FROM rate_limits WHERE window_start < UTC_TIMESTAMP() - INTERVAL 1 DAY").catch(() => {});
  return (row?.count ?? 0) > max;
}

/** Client IP from the proxy header (Vercel / reverse proxy) or "local". */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
