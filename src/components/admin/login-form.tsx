"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

const RESEND_SECONDS = 30;

const ERRORS: Record<string, string> = {
  invalid_email: "Please enter a valid email address.",
  rate_limited: "Too many tries. Please wait 15 minutes and try again.",
  db_unavailable: "We can't reach the database right now. If you're on XAMPP, check that MySQL is running.",
  wrong_code: "That code isn't right. Check the email and try again.",
  expired: "That code has expired. Tap “Resend code” for a new one.",
  too_many_attempts: "Too many wrong tries for this code. Tap “Resend code” for a new one.",
  network: "No connection. Check your internet and try again.",
};

async function post(url: string, body: unknown) {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { status: res.status, data: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } catch {
    return { status: 0, data: { error: "network" } as Record<string, unknown> };
  }
}

export function LoginForm({ next }: { next: string | null }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => { if (step === "code") boxes.current[0]?.focus(); else emailRef.current?.focus(); }, [step]);

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(ERRORS.invalid_email); return; }
    setBusy(true);
    const { status, data } = await post("/api/admin/auth/request-code", { email: email.trim() });
    setBusy(false);
    if (status === 200) {
      setInfo(String(data.message ?? "If this email has access, a code is on its way."));
      setDigits(Array(6).fill(""));
      setStep("code");
      setCountdown(RESEND_SECONDS);
    } else {
      setError(ERRORS[String(data.error)] ?? "Something went wrong. Please try again.");
    }
  }

  async function verify(code: string) {
    setError(null);
    setBusy(true);
    const { status, data } = await post("/api/admin/auth/verify", { email: email.trim(), code });
    if (status === 200 && data.ok) {
      window.location.assign(next ?? String(data.redirect ?? "/admin"));
      return;
    }
    setBusy(false);
    const key = String(data.error ?? "wrong_code");
    const left = typeof data.attemptsLeft === "number" ? ` ${data.attemptsLeft} ${data.attemptsLeft === 1 ? "try" : "tries"} left.` : "";
    setError((ERRORS[key] ?? ERRORS.wrong_code) + (key === "wrong_code" ? left : ""));
    setDigits(Array(6).fill(""));
    boxes.current[0]?.focus();
  }

  function fill(from: number, text: string) {
    const clean = text.replace(/\D/g, "").slice(0, 6 - from);
    if (!clean) return;
    const nextDigits = [...digits];
    clean.split("").forEach((d, i) => { nextDigits[from + i] = d; });
    setDigits(nextDigits);
    const last = Math.min(from + clean.length, 5);
    boxes.current[last]?.focus();
    if (nextDigits.every((d) => d !== "")) void verify(nextDigits.join(""));
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const d = [...digits]; d[i - 1] = ""; setDigits(d);
      boxes.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) boxes.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < 5) boxes.current[i + 1]?.focus();
  }

  const alert = (msg: string | null, tone: "error" | "info") => (
    <p role={tone === "error" ? "alert" : "status"} aria-live="polite"
      className={tone === "error" ? "mt-4 rounded-xl bg-[#fdecea] px-4 py-3 text-sm text-danger" : "mt-4 rounded-xl bg-[#fff3d1] px-4 py-3 text-sm text-gold-ink"}>
      {msg}
    </p>
  );

  if (step === "email") {
    return (
      <form onSubmit={requestCode} noValidate>
        <h2 className="font-heading text-3xl font-extrabold">Welcome back</h2>
        <p className="mt-2 text-[#4b5b75]">Sign in with your work email. We’ll send you a 6-digit code.</p>
        <label htmlFor="admin-email" className="mt-8 block text-sm font-semibold">Email</label>
        <input ref={emailRef} id="admin-email" type="email" inputMode="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? "admin-login-error" : undefined}
          className="mt-2 h-12 w-full rounded-xl border border-[#d6dbe4] bg-white px-4 text-base outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/25"
          placeholder="you@company.com" />
        <button type="submit" disabled={busy}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold font-heading font-bold text-navy shadow-[0_12px_24px_-12px_rgb(245_168_0/0.8)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/30 disabled:opacity-70">
          {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Mail className="size-5" aria-hidden />}
          {busy ? "Sending…" : "Email me a code"}
        </button>
        <div id="admin-login-error">{error && alert(error, "error")}</div>
      </form>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-3xl font-extrabold">Enter your code</h2>
      <p className="mt-2 text-[#4b5b75]">We sent a 6-digit code to <b className="text-navy">{email.trim()}</b>. It expires in 10 minutes.</p>
      {info && !error && alert(info, "info")}
      <fieldset className="mt-6" disabled={busy}>
        <legend className="sr-only">6-digit sign-in code</legend>
        <div className="flex justify-between gap-2" onPaste={(e) => { e.preventDefault(); fill(0, e.clipboardData.getData("text")); }}>
          {digits.map((d, i) => (
            <input key={i} ref={(el) => { boxes.current[i] = el; }} value={d} inputMode="numeric" pattern="[0-9]*" maxLength={i === 0 ? 6 : 1}
              autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Digit ${i + 1} of 6`}
              onChange={(e) => fill(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} onFocus={(e) => e.target.select()}
              className="h-14 w-full min-w-0 rounded-xl border border-[#d6dbe4] bg-white text-center font-heading text-2xl font-bold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/25 disabled:bg-[#f3f4f6]" />
          ))}
        </div>
      </fieldset>
      {busy && <p className="mt-4 flex items-center gap-2 text-sm text-[#4b5b75]" role="status"><Loader2 className="size-4 animate-spin" aria-hidden />Checking…</p>}
      {error && alert(error, "error")}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button type="button" onClick={() => { setStep("email"); setError(null); setInfo(null); }}
          className="inline-flex items-center gap-1 font-semibold text-[#1a2b57] underline-offset-4 hover:underline">
          <ArrowLeft className="size-4" aria-hidden />Use a different email
        </button>
        <button type="button" onClick={() => requestCode()} disabled={countdown > 0 || busy}
          className="font-semibold text-gold-ink underline-offset-4 hover:underline disabled:text-[#8a94a6] disabled:no-underline">
          {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
