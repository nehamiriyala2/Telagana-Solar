import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BellRing, ClipboardList, MapPinned } from "lucide-react";
import { currentStaff } from "@/lib/admin/auth";
import { homeFor } from "@/lib/admin/roles";
import { LoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/layout/logo";

export const metadata: Metadata = { title: { absolute: "Staff sign in | Telangana Solar" } };
export const dynamic = "force-dynamic";

const POINTS = [
  { Icon: ClipboardList, text: "Track every lead" },
  { Icon: BellRing, text: "Follow up on time" },
  { Icon: MapPinned, text: "Manage districts, schemes and projects" },
];

/** The site's logo (white "footer" version of the mark, as the public footer shows it on navy), with a soft sun glow. */
function Brand({ size = "lg" }: { size?: "lg" | "sm" }) {
  const lg = size === "lg";
  return (
    <span className="flex items-center gap-3">
      <span className="relative grid place-items-center">
        <span aria-hidden className={`absolute rounded-full bg-[radial-gradient(circle,var(--adm-glow)_0%,transparent_70%)] blur-md ${lg ? "size-28" : "size-16"}`} />
        <LogoMark light className={`relative ${lg ? "size-[68px]" : "size-11"}`} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-heading font-semibold tracking-[0.08em] ${lg ? "text-[1.375rem]" : "text-base"}`}>
          <span className="text-white">TELANGANA</span> <span className="text-[#4ADE80]">SOLAR</span>
        </span>
        <span className={`mt-1.5 font-medium uppercase tracking-[0.16em] text-gold ${lg ? "text-[0.7rem]" : "text-[0.6rem]"}`}>Staff dashboard</span>
      </span>
    </span>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const staff = await currentStaff().catch(() => null);
  const { next } = await searchParams;
  const safeNext = next && /^\/admin(\/[\w\-/]*)?$/.test(next) ? next : null;
  if (staff) redirect(safeNext ?? homeFor(staff.role));

  return (
    <main className="adm-theme flex min-h-dvh flex-col bg-cream lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left: navy brand panel (desktop) */}
      <section className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between" style={{ background: "var(--adm-panel)" }}>
        {/* quiet texture: fine diagonal lines + warm gold light from the top right */}
        <span aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.035)_0_1px,transparent_1px_24px)]" />
        <span aria-hidden className="absolute -right-32 -top-32 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--adm-glow)_0%,transparent_65%)]" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgb(11_31_58/0.5))]" />

        <div className="relative p-10 xl:p-14"><Brand /></div>

        <div className="relative px-10 xl:px-14">
          <h1 className="max-w-md font-[family-name:var(--font-display)] text-[2.75rem] font-semibold leading-[1.12] tracking-[-0.01em] xl:text-[3.25rem]">
            Run your solar business from <span className="text-gold">one place.</span>
          </h1>
          <ul className="mt-10 space-y-4">
            {POINTS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-[1.0625rem] text-silver">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-800 text-gold ring-1 ring-gold/30">
                  <Icon className="size-[18px]" strokeWidth={1.5} aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative p-10 text-sm text-silver/70 xl:p-14">Telangana Solar · Clean energy for a brighter Telangana</p>
      </section>

      {/* Mobile / tablet: short navy band */}
      <header className="relative overflow-hidden px-5 py-6 text-white lg:hidden" style={{ background: "var(--adm-panel)" }}>
        <span aria-hidden className="absolute -right-16 -top-20 size-56 rounded-full bg-[radial-gradient(circle,var(--adm-glow)_0%,transparent_65%)]" />
        <div className="relative"><Brand size="sm" /></div>
        <p className="relative mt-3 text-sm text-silver/80">Clean energy for a brighter Telangana</p>
      </header>

      {/* Right: sign-in card */}
      <section className="flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--color-gold-soft)_0%,var(--color-cream)_55%)] px-4 py-10 sm:px-8">
        <div className="w-full max-w-[29rem]">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-[var(--adm-shadow)] sm:p-10">
            <LoginForm next={safeNext} />
          </div>
          <p className="mt-6 text-center text-sm text-muted">Staff only. Access is by invitation.</p>
        </div>
      </section>
    </main>
  );
}
