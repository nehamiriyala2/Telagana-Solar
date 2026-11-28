"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto mt-10 max-w-lg rounded-2xl border border-[#f3c9c5] bg-white p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#fdecea] text-danger"><TriangleAlert className="size-7" aria-hidden /></span>
      <h1 className="mt-5 font-heading text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-[#4b5b75]">This page couldn’t load. If you’re on XAMPP, check that MySQL is running, then try again.</p>
      <button type="button" onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 font-semibold text-white outline-none hover:bg-navy-800 focus-visible:ring-4 focus-visible:ring-gold/40">
        <RotateCcw className="size-4" aria-hidden />Try again
      </button>
    </div>
  );
}
