import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BellRing, ClipboardList, MapPinned } from "lucide-react";
import { currentStaff } from "@/lib/admin/auth";
import { homeFor } from "@/lib/admin/roles";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: { absolute: "Staff sign in | Telangana Solar" } };
export const dynamic = "force-dynamic";

const POINTS = [
  { Icon: ClipboardList, text: "Track every lead" },
  { Icon: BellRing, text: "Follow up on time" },
  { Icon: MapPinned, text: "Manage districts, schemes and projects" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const staff = await currentStaff().catch(() => null);
  const { next } = await searchParams;
  const safeNext = next && /^\/admin(\/[\w\-/]*)?$/.test(next) ? next : null;
  if (staff) redirect(safeNext ?? homeFor(staff.role));

  const hasPhoto = existsSync(path.join(process.cwd(), "public", "admin", "login-hero.webp"));

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Left: brand panel (desktop only) */}
      <section className="relative hidden overflow-hidden bg-navy text-white lg:flex lg:flex-col lg:justify-between">
        {hasPhoto ? (
          <>
            <Image src="/admin/login-hero.webp" alt="" fill priority sizes="55vw" className="object-cover" />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_23_63/0.55)_0%,rgb(7_23_63/0.78)_55%,rgb(7_23_63/0.95)_100%)]" />
          </>
        ) : (
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgb(245_168_0/0.28),transparent_45%),radial-gradient(circle_at_10%_90%,rgb(18_101_216/0.35),transparent_50%),repeating-linear-gradient(135deg,rgb(255_255_255/0.035)_0_2px,transparent_2px_22px)]" />
        )}
        <div className="relative p-10 xl:p-14">
          <Image src="/brand/mark-64.png" alt="Telangana Solar" width={48} height={48} className="rounded-xl" />
        </div>
        <div className="relative p-10 pt-0 xl:p-14 xl:pt-0">
          <h1 className="max-w-md font-heading text-[2.5rem] font-extrabold leading-[1.1] xl:text-5xl">
            Run your solar business from <span className="text-gold">one place.</span>
          </h1>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-lg text-silver">
                <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-gold ring-1 ring-white/15"><Icon className="size-5" aria-hidden /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Right: sign-in card */}
      <section className="flex items-center justify-center bg-[radial-gradient(ellipse_at_top,#fff3d1_0%,#fffbf2_45%,#fbf8f1_100%)] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Image src="/brand/mark-64.png" alt="" width={40} height={40} className="rounded-lg" />
            <span className="font-heading text-lg font-bold">Telangana Solar</span>
          </div>
          <div className="rounded-3xl border border-[#ecdcb5] bg-white p-6 shadow-[0_30px_60px_-30px_rgb(7_23_63/0.35)] sm:p-9">
            <LoginForm next={safeNext} />
          </div>
          <p className="mt-6 text-center text-sm text-[#4b5b75]">Staff only. Access is by invitation.</p>
        </div>
      </section>
    </main>
  );
}
