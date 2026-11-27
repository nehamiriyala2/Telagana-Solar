"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, type LucideIcon } from "lucide-react";
import { Button } from "./button";

/** Accessible modal (portalled to <body> so no transformed parent can trap it): focus trap, Esc, scroll lock, bottom sheet on phones. */
export function DialogShell({ open, onClose, title, Icon, closeLabel, children, footer }: {
  open: boolean; onClose: () => void; title: string; Icon?: LucideIcon; closeLabel: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const list = Array.from(panel.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
          .filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    const id = setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-autofocus], button[role=radio], select, input")?.focus(), 60);
    return () => { clearTimeout(id); window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; prevFocus.current?.focus(); };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-cloud/75 backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div ref={panel} role="dialog" aria-modal="true" aria-labelledby="dlg-title" data-lenis-prevent
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-lift sm:rounded-[1.25rem]">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-7">
              <h2 id="dlg-title" className="flex items-center gap-2 font-heading text-h4 font-bold">{Icon && <Icon className="size-5 text-gold" aria-hidden />}{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label={closeLabel}><X /></Button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-line px-5 py-4 md:px-7">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
