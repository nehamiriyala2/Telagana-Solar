"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, SendHorizontal, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function AssistantBubble() {
  const t = useTranslations("assistant");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 250); }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next, locale }) });
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
    } catch {
      setMsgs([...next, { role: "assistant", content: t("error") }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-label={open ? t("close") : t("open")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-sun text-navy shadow-glow md:bottom-8 md:right-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "x" : "chat"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
            {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="assistant-panel"
            role="dialog"
            aria-label={t("title")}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="glass fixed inset-x-3 bottom-24 z-50 flex max-h-[70svh] flex-col overflow-hidden rounded-3xl shadow-lift sm:inset-x-auto sm:right-8 sm:w-[400px] md:bottom-28"
            data-lenis-prevent
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid size-10 place-items-center rounded-full bg-navy text-gold"><Sparkles className="size-5" aria-hidden /></span>
              <div>
                <p className="font-heading font-bold">{t("title")}</p>
                <p className="text-caption text-muted">{t("subtitle")}</p>
              </div>
            </div>

            <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
              <Bubble role="assistant">{t("greeting")}</Bubble>
              {msgs.map((m, i) => (
                <Bubble key={i} role={m.role}>
                  {m.content || <Dots />}
                </Bubble>
              ))}
              {!msgs.length && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {(["s1", "s2", "s3"] as const).map((k) => (
                    <button key={k} type="button" onClick={() => send(t(`suggestions.${k}`))} className="rounded-full border border-line bg-surface px-3 py-1.5 text-left text-caption transition-colors hover:border-gold">
                      {t(`suggestions.${k}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-line p-3">
              <label htmlFor="assistant-input" className="sr-only">{t("placeholder")}</label>
              <textarea
                id="assistant-input" ref={inputRef} rows={1} value={input} maxLength={1000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder={t("placeholder")}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-surface px-4 py-2.5 text-[1rem] outline-none placeholder:text-muted focus:border-gold"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label={t("send")} className="grid size-11 shrink-0 place-items-center rounded-full bg-sun text-navy transition-opacity disabled:opacity-40">
                <SendHorizontal className="size-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ role, children }: { role: Msg["role"]; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className={cn("max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[0.9375rem] leading-relaxed", role === "user" ? "ml-auto bg-navy text-cream dark:bg-navy-600" : "bg-surface")}>
      {children}
    </motion.div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1" aria-label="…">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="size-1.5 rounded-full bg-muted" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  );
}
