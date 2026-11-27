"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightLeft, Loader2, Power, UserPlus } from "lucide-react";

export type Member = { id: number; name: string; email: string; role: "admin" | "sales" | "installer" | "content"; active: boolean; openLeads: number; lastLogin: string | null };
const ROLE = { admin: "Admin", sales: "Sales", content: "Content", installer: "Installer" } as const;

async function call(url: string, method: string, body: unknown): Promise<{ ok: boolean; message?: string; data?: Record<string, unknown> }> {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data };
    return { ok: false, message: data.message ?? data.issues?.[0]?.message ?? "Something went wrong. Try again." };
  } catch { return { ok: false, message: "No connection. Try again." }; }
}

export function TeamManager({ members, meId }: { members: Member[]; meId: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [inv, setInv] = useState({ name: "", email: "", role: "sales" });
  const [reassign, setReassign] = useState<Record<number, string>>({});
  const owners = members.filter((m) => m.active && (m.role === "admin" || m.role === "sales"));

  async function run(key: string, url: string, method: string, body: unknown, ok: (d?: Record<string, unknown>) => string) {
    setBusy(key); setMsg(null);
    const r = await call(url, method, body);
    setBusy(null);
    if (!r.ok) { setMsg({ tone: "err", text: r.message! }); return false; }
    setMsg({ tone: "ok", text: ok(r.data) });
    router.refresh();
    return true;
  }

  const input = "h-10 rounded-xl border border-[#e2dccb] bg-white px-3 text-sm outline-none focus:border-gold focus:ring-4 focus:ring-gold/20";
  return (
    <div className="space-y-6">
      {msg && <p role={msg.tone === "err" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.tone === "err" ? "bg-[#fdecea] text-danger" : "bg-[#e7f5e4] text-success"}`}>{msg.text}</p>}

      <section aria-labelledby="invite-title" className="rounded-2xl border border-[#ece4cf] bg-white p-6">
        <h2 id="invite-title" className="font-heading text-lg font-bold">Invite someone</h2>
        <p className="mt-1 text-sm text-[#4b5b75]">They sign in with this email and get a code each time. There is no public sign-up.</p>
        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={async (e) => {
          e.preventDefault();
          if (await run("invite", "/api/admin/team", "POST", inv, (d) => `${inv.name} was added.${d?.emailed ? " We emailed them the sign-in link." : " Email isn’t set up, so tell them to sign in at /admin/login."}`)) setInv({ name: "", email: "", role: "sales" });
        }}>
          <label className="text-sm font-semibold text-[#1a2b57]">Name<br /><input required value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} className={`${input} mt-1 w-48`} /></label>
          <label className="text-sm font-semibold text-[#1a2b57]">Email<br /><input required type="email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} className={`${input} mt-1 w-64`} /></label>
          <label className="text-sm font-semibold text-[#1a2b57]">Role<br />
            <select value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value })} className={`${input} mt-1`}>
              {Object.entries(ROLE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <button type="submit" disabled={busy === "invite"} className="inline-flex h-10 items-center gap-2 rounded-full bg-gold px-5 font-bold text-navy disabled:opacity-60">
            {busy === "invite" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}Invite
          </button>
        </form>
        <p className="mt-3 text-xs text-[#8a94a6]">Admin: everything · Sales: leads, pipeline, follow-ups, reports (read) · Installer: won jobs only.</p>
      </section>

      <ul className="grid gap-4 lg:grid-cols-2">
        {members.map((m) => {
          const me = m.id === meId;
          return (
            <li key={m.id} className={`rounded-2xl border bg-white p-5 ${m.active ? "border-[#ece4cf]" : "border-dashed border-[#d6dbe4] opacity-80"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-full font-heading text-lg font-bold ${m.active ? "bg-navy text-gold" : "bg-[#e2e5ea] text-[#5b6473]"}`} aria-hidden>{m.name.slice(0, 1).toUpperCase()}</span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{m.name}{me && <span className="ml-1.5 text-xs font-bold text-gold-ink">(you)</span>}{!m.active && <span className="ml-1.5 text-xs font-bold text-[#5b6473]">(inactive)</span>}</p>
                    <p className="truncate text-sm text-[#4b5b75]">{m.email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${m.role === "admin" ? "bg-[#fff3d1] text-gold-ink" : m.role === "sales" ? "bg-[#e8f0fe] text-[#1a4fa0]" : "bg-[#e7f5e4] text-success"}`}>{ROLE[m.role]}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-xs text-[#8a94a6]">Open leads</dt><dd className="font-semibold">{m.openLeads}</dd></div>
                <div><dt className="text-xs text-[#8a94a6]">Last sign-in</dt><dd className="font-semibold">{m.lastLogin ?? "Never"}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f1ece0] pt-4">
                <label className="text-sm">
                  <span className="sr-only">Role for {m.name}</span>
                  <select value={m.role} disabled={me || !!busy} title={me ? "You can’t change your own role" : undefined}
                    onChange={(e) => run(`role-${m.id}`, `/api/admin/team/${m.id}`, "PATCH", { role: e.target.value }, () => `${m.name} is now ${ROLE[e.target.value as Member["role"]]}.`)}
                    className={`${input} h-9 disabled:opacity-60`}>
                    {Object.entries(ROLE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </label>
                <button type="button" disabled={me || !!busy} title={me ? "You can’t deactivate yourself" : undefined}
                  onClick={() => {
                    if (m.active && !window.confirm(`Deactivate ${m.name}? They are signed out everywhere and can’t sign in until reactivated.`)) return;
                    void run(`act-${m.id}`, `/api/admin/team/${m.id}`, "PATCH", { active: !m.active }, () => `${m.name} is ${m.active ? "deactivated and signed out" : "active again"}.`);
                  }}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold disabled:opacity-50 ${m.active ? "text-danger hover:bg-[#fdecea]" : "text-success hover:bg-[#e7f5e4]"}`}>
                  {busy === `act-${m.id}` ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Power className="size-4" aria-hidden />}{m.active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
              {m.openLeads > 0 && (!m.active || m.role === "installer" || m.role === "content") && (
                <form className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[#fff8e6] p-3" onSubmit={(e) => {
                  e.preventDefault();
                  const to = Number(reassign[m.id]);
                  if (to) void run(`re-${m.id}`, `/api/admin/team/${m.id}/reassign`, "POST", { to }, (d) => `${d?.moved ?? 0} open lead(s) moved.`);
                }}>
                  <span className="text-sm font-semibold text-gold-ink">{m.openLeads} open lead(s) still assigned.</span>
                  <label className="text-sm"><span className="sr-only">Reassign to</span>
                    <select required value={reassign[m.id] ?? ""} onChange={(e) => setReassign({ ...reassign, [m.id]: e.target.value })} className={`${input} h-9`}>
                      <option value="">Reassign to…</option>
                      {owners.filter((o) => o.id !== m.id).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </label>
                  <button type="submit" disabled={!!busy} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-navy px-3 text-sm font-semibold text-white disabled:opacity-50">
                    <ArrowRightLeft className="size-4" aria-hidden />Reassign open leads
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
