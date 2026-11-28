/** Shared MySQL connection for CLI scripts (npm run db:*). Reads DB_* from .env.local. */
import mysql from "mysql2/promise";

export function dbConfig() {
  const database = process.env.DB_NAME;
  if (!database) throw new Error("DB_NAME is not set. Copy .env.example to .env.local and fill in the DB_* values.");
  return {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database,
  };
}

/** One connection, UTC session, utf8mb4. `withDb: false` connects to the server only (to create the database). */
export async function connect(opts: { withDb?: boolean; multipleStatements?: boolean } = {}) {
  const { database, ...server } = dbConfig();
  const conn = await mysql.createConnection({
    ...server,
    ...(opts.withDb === false ? {} : { database }),
    charset: "utf8mb4_unicode_ci",
    timezone: "Z",
    multipleStatements: opts.multipleStatements ?? false,
  });
  await conn.query("SET time_zone = '+00:00'");
  return conn;
}

export async function run(main: () => Promise<void>) {
  try {
    await main();
    process.exit(0);
  } catch (e) {
    console.error(`\n✖ ${(e as Error).message}`);
    process.exit(1);
  }
}
