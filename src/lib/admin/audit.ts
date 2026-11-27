import "server-only";
import { exec } from "./db";

/** Logs an admin action that is not tied to one lead or one setting. Never put customer data in details. */
export async function audit(staffId: number | null, action: string, target: string | null, details: Record<string, unknown> | null = null) {
  await exec("INSERT INTO admin_audit (staff_id, action, target, details) VALUES (?, ?, ?, ?)", [staffId, action, target, details ? JSON.stringify(details) : null]);
}
