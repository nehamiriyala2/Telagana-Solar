/**
 * Signed session cookie value: "<sessionId>.<expiresUnixSeconds>.<hmac>".
 * Uses Web Crypto only, so it runs in middleware (Edge) and on the server.
 * The signature proves the cookie came from us; the sessions table decides whether it is still valid
 * (revocable sign-out, deactivated staff). Middleware checks the signature only; pages and APIs check the DB.
 */
export const SESSION_COOKIE = "ts_admin";
export const SESSION_DAYS = 7;

const enc = new TextEncoder();

function b64url(buf: ArrayBuffer) {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function secret() {
  const s = process.env.AUTH_SECRET;
  return s && s.length >= 32 ? s : null;
}

export async function signSession(sessionId: string, expiresAt: Date): Promise<string> {
  const s = secret();
  if (!s) throw new Error("AUTH_SECRET missing or shorter than 32 characters");
  const body = `${sessionId}.${Math.floor(expiresAt.getTime() / 1000)}`;
  return `${body}.${await hmac(body, s)}`;
}

/** Returns the session id if the signature is valid and not expired, else null. */
export async function verifySession(value: string | undefined | null): Promise<string | null> {
  const s = secret();
  if (!s || !value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (!/^[a-f0-9]{64}$/.test(id) || !/^\d+$/.test(exp)) return null;
  if (Number(exp) * 1000 < Date.now()) return null;
  const expected = await hmac(`${id}.${exp}`, s);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0 ? id : null;
}
