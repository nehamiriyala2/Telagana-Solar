/**
 * npm run admin:create
 * Creates (or re-activates) the first admin from ADMIN_FIRST_EMAIL. There is no public signup:
 * every other staff member is invited from Admin → Team.
 * Optional: ADMIN_FIRST_NAME for the display name.
 */
import { connect, run } from "./_db";

run(async () => {
  const email = process.env.ADMIN_FIRST_EMAIL?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Set ADMIN_FIRST_EMAIL in .env.local to a valid email address.");
  const name = process.env.ADMIN_FIRST_NAME?.trim() || email.split("@")[0];

  const db = await connect();
  await db.execute(
    `INSERT INTO staff (name, email, role, active) VALUES (?, ?, 'admin', 1)
     ON DUPLICATE KEY UPDATE role = 'admin', active = 1`,
    [name, email],
  );
  console.log(`✔ ${email} is an active admin. Sign in at /admin/login with an email code.`);
  await db.end();
});
