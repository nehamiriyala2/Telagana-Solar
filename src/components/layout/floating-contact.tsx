"use client";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { CallButton, WhatsAppButton } from "@/components/ui/contact-buttons";
import { recordWhatsappClick, whatsappHref } from "@/lib/contact-links";
import { track } from "@/lib/analytics";

/** Mobile: sticky bottom bar with Call + WhatsApp. Desktop: floating WhatsApp bubble. */
export function FloatingContact() {
  const t = useTranslations();
  const locale = useLocale() as "en" | "te";
  const pathname = usePathname();
  const href = whatsappHref(t("common.whatsappMessage"));

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(11_31_58/0.2)] backdrop-blur md:hidden">
        <CallButton place="mobile-bar" className="w-full" />
        <WhatsAppButton place="mobile-bar" className="w-full" />
      </div>

      {href && (
        <motion.a
          href={href} target="_blank" rel="noopener noreferrer" aria-label={t("floating.whatsapp")}
          onClick={() => { track({ name: "whatsapp_click", location: "floating" }); recordWhatsappClick(`${pathname}#floating`, locale); }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
          className="group fixed bottom-8 right-8 z-40 hidden items-center gap-2 rounded-full bg-whatsapp py-3.5 pl-3.5 pr-3.5 text-white shadow-lift md:flex"
        >
          <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-whatsapp/40 [animation-duration:2.5s]" />
          <MessageCircle className="size-6" aria-hidden />
          <span className="max-w-0 overflow-hidden whitespace-nowrap font-semibold transition-[max-width,margin] duration-500 group-hover:ml-1 group-hover:max-w-48">{t("floating.whatsapp")}</span>
        </motion.a>
      )}
    </>
  );
}
