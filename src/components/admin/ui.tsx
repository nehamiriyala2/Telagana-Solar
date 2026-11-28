import { Construction, ShieldAlert } from "lucide-react";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-[2.1rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[#4b5b75]">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#ece4cf] bg-white p-6 shadow-[0_18px_40px_-34px_rgb(7_23_63/0.45)] ${className}`}>{children}</section>;
}

export function ComingSoon({ label, step }: { label: string; step: number }) {
  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#fff3d1] text-gold-ink"><Construction className="size-7" aria-hidden /></span>
      <h2 className="mt-5 font-heading text-xl font-bold">{label} is coming soon</h2>
      <p className="mt-2 max-w-md text-[#4b5b75]">This page is built in step {step} of the dashboard. Until then, nothing here can change your website or leads.</p>
    </Card>
  );
}

export function DeniedBanner() {
  return (
    <p role="alert" className="mb-6 flex items-center gap-3 rounded-xl border border-[#f3c9c5] bg-[#fdecea] px-4 py-3 text-sm text-danger">
      <ShieldAlert className="size-5 shrink-0" aria-hidden />
      You don’t have access to that page. Ask an admin if you need it.
    </p>
  );
}
