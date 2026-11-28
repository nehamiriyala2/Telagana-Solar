import "server-only";
import nodemailer from "nodemailer";

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

/**
 * Sends the sign-in code. Without SMTP in development the code is printed in the server console
 * (only the code and the staff email, never customer data), so login works on XAMPP with no mail server.
 * Returns false if the email could not be sent.
 */
export async function sendLoginCode(email: string, code: string): Promise<boolean> {
  if (!smtpConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.log(`\n┌─ DEV MODE · admin sign-in code ─────────────\n│ ${email}: ${code}  (valid 10 minutes)\n└─────────────────────────────────────────────\n`);
      return true;
    }
    console.error("[admin] SMTP is not configured: cannot send sign-in codes");
    return false;
  }
  try {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `${code} is your Telangana Solar sign-in code`,
      text: `Your sign-in code is ${code}.\n\nIt expires in 10 minutes. If you did not ask for it, ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;color:#07173f;max-width:420px">
        <p>Your Telangana Solar staff sign-in code is:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;background:#fff3d1;padding:16px;border-radius:12px;text-align:center">${code}</p>
        <p style="color:#4b5b75">It expires in 10 minutes. If you did not ask for it, ignore this email.</p></div>`,
    });
    return true;
  } catch (e) {
    console.error("[admin] sign-in email failed:", (e as Error).message);
    return false;
  }
}

/** Tells a new staff member they have access. Dev without SMTP: printed in the console. */
export async function sendInvite(email: string, name: string, role: string, siteUrl: string): Promise<boolean> {
  const link = `${siteUrl.replace(/\/$/, "")}/admin/login`;
  if (!smtpConfigured()) {
    if (process.env.NODE_ENV === "development") { console.log(`\n[DEV MODE] Invite for ${email} (${role}): sign in at ${link}\n`); return true; }
    return false;
  }
  try {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
    await transport.sendMail({
      from: process.env.SMTP_FROM, to: email,
      subject: "You've been added to the Telangana Solar dashboard",
      text: `Hello ${name},\n\nYou now have ${role} access to the Telangana Solar staff dashboard.\nSign in with this email at ${link} — we'll email you a code each time.\n`,
    });
    return true;
  } catch (e) { console.error("[admin] invite email failed:", (e as Error).message); return false; }
}
