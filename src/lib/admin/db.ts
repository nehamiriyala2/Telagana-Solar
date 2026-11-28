import "server-only";
import mysql, { type Pool, type PoolConnection, type ResultSetHeader } from "mysql2/promise";

/**
 * MySQL pool (XAMPP locally). Every connection runs in UTC and utf8mb4.
 * Queries are ALWAYS parameterized: pass values as `params`, never build SQL from input.
 */
export function isDbConfigured() {
  return Boolean(process.env.DB_NAME);
}

const g = globalThis as unknown as { __tsAdminPool?: Pool };

export function pool(): Pool {
  if (!isDbConfigured()) throw new Error("db_not_configured");
  if (!g.__tsAdminPool) {
    const p = mysql.createPool({
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME,
      charset: "utf8mb4_unicode_ci",
      timezone: "Z",
      connectionLimit: 10,
      connectTimeout: 4000,
      waitForConnections: true,
    });
    p.on("connection", (conn) => { conn.query("SET time_zone = '+00:00'"); });
    g.__tsAdminPool = p;
  }
  return g.__tsAdminPool;
}

type Param = string | number | boolean | Date | null | Buffer;

export async function q<T = Record<string, unknown>>(sql: string, params: Param[] = []): Promise<T[]> {
  const [rows] = await pool().execute(sql, params);
  return rows as T[];
}

export async function one<T = Record<string, unknown>>(sql: string, params: Param[] = []): Promise<T | null> {
  return (await q<T>(sql, params))[0] ?? null;
}

export async function exec(sql: string, params: Param[] = []): Promise<ResultSetHeader> {
  const [res] = await pool().execute(sql, params);
  return res as ResultSetHeader;
}

/** Runs `fn` in a transaction; rolls back on any error. */
export async function tx<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool().getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
}
