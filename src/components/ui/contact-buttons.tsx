"use client";
import { MessageCircle, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Button, type ButtonProps } from "./button";
import { EditMark } from "./badge";
import { recordWhatsappClick, telHref, whatsappHref } from "@/lib/contact-links";
import { track } from "@/lib/analytics";

/** WhatsApp button: pre-filled message, tracked as a conversion and logged to the lead endpoint. */
export function WhatsAppButton({ message, label, place, className, size, variant = "whatsapp", iconOnly }: {
  message?: string; label?: string; place: string; className?: string; size?: ButtonProps["size"]; variant?: ButtonProps["variant"]; iconOnly?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale() as "en" | "te";
  const pathname = usePathname();
  const href = whatsappHref(message ?? t("common.whatsappMessage"));
  const text = label ?? t("nav.whatsapp");
  if (!href) {
    return (
      <Button variant={variant} size={size} className={className} disabled title="[EDIT] Set NEXT_PUBLIC_WHATSAPP_NUMBER" aria-label={iconOnly ? text : undefined}>
        <MessageCircle aria-hidden />{!iconOnly && <>{text}<EditMark className="ml-1" /></>}
      </Button>
    );
  }
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={iconOnly ? text : undefined}
        onClick={() => { track({ name: "whatsapp_click", location: place }); recordWhatsappClick(`${pathname}#${place}`, locale); }}>
        <MessageCircle aria-hidden />{!iconOnly && text}
      </a>
    </Button>
  );
}

export function CallButton({ label, place, className, size, variant = "outline" }: {
  label?: string; place: string; className?: string; size?: ButtonProps["size"]; variant?: ButtonProps["variant"];
}) {
  const t = useTranslations("nav");
  const href = telHref();
  if (!href) {
    return <Button variant={variant} size={size} className={className} disabled title="Set NEXT_PUBLIC_PHONE"><Phone aria-hidden />{label ?? t("call")}<EditMark className="ml-1" /></Button>;
  }
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={href} onClick={() => track({ name: "call_click", location: place })}><Phone aria-hidden />{label ?? t("call")}</a>
    </Button>
  );
}
