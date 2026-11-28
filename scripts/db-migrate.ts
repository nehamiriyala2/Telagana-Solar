/**
 * npm run db:migrate
 * Creates the database (utf8mb4) if missing, then applies db/migrations/*.sql in name order.
 * Applied files are recorded in the `migrations` table and never run twice.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { connect, dbConfig, run } from "./_db";

run(async () => {
  const { database } = dbConfig();
  if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error("DB_NAME may only contain letters, numbers and _");

  const server = await connect({ withDb: false });
  await server.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await server.end();

  const db = await connect({ multipleStatements: true });
  await db.query(`CREATE TABLE IF NOT EXISTS migrations (
    name VARCHAR(190) PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  const [rows] = await db.query("SELECT name FROM migrations");
  const done = new Set((rows as { name: string }[]).map((r) => r.name));
  const dir = path.join(process.cwd(), "db", "migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  let applied = 0;
  for (const file of files) {
    if (done.has(file)) continue;
    process.stdout.write(`→ ${file} … `);
    // DDL auto-commits in MySQL, so a failed file may be partly applied: fix it and re-run on a fresh DB.
    await db.query(readFileSync(path.join(dir, file), "utf8"));
    await db.query("INSERT INTO migrations (name) VALUES (?)", [file]);
    console.log("done");
    applied++;
  }
  console.log(applied ? `✔ Applied ${applied} migration(s) to ${database}.` : `✔ ${database} is up to date.`);
  await db.end();
});
