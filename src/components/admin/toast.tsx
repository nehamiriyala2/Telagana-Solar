"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";

type Tone = "ok" | "err";
type Item = { id: number; text: string; tone: Tone };
const EVENT = "ts-admin-toast";

/** Shows a short message at the bottom of the screen. Call from any admin client component. */
export function toast(text: string, tone: Tone = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<Omit<Item, "id">>(EVENT, { detail: { text, tone } }));
}

/** Mounted once in the admin layout. */
export function Toaster() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    let n = 0;
    const on = (e: Event) => {
      const { text, tone } = (e as CustomEvent<Omit<Item, "id">>).detail;
      const id = ++n;
      setItems((list) => [...list.slice(-2), { id, text, tone }]);
      setTimeout(() => setItems((list) => list.filter((i) => i.id !== id)), tone === "err" ? 7000 : 4000);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end">
      {items.map((i) => (
        <div key={i.id} role={i.tone === "err" ? "alert" : "status"}
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-[0_24px_48px_-20px_rgb(7_23_63/0.55)] ${i.tone === "err" ? "bg-[#fdecea] text-danger ring-1 ring-[#f3c9c5]" : "bg-navy text-white"}`}>
          {i.tone === "err" ? <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />}
          <span className="flex-1">{i.text}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setItems((list) => list.filter((x) => x.id !== i.id))} className="-m-1 grid size-6 place-items-center rounded-full opacity-70 hover:opacity-100">
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
