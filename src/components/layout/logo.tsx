import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo (public/brand/logo.webp, cropped from the supplied artwork; never stretched or recoloured).
 * - header: inside a rounded deep-navy badge so it sits naturally on the white header
 * - footer: larger, directly on the navy footer
 * Source file: public/brand/logo-original.png. Replace with a transparent PNG/SVG later if available. [EDIT]
 */
export function Logo({ variant = "header", className, priority }: { variant?: "header" | "footer"; className?: string; priority?: boolean }) {
  const h = variant === "header" ? 52 : 120;
  const w = Math.round((h * 640) / 333);
  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden", variant === "header" && "rounded-xl bg-navy p-0.5 shadow-[0_4px_14px_-6px_rgb(7_23_63/0.5)]", className)}>
      <Image src="/brand/logo.webp" alt="Telangana Solar: Clean energy for a brighter Telangana" width={w} height={h} priority={priority} className="block h-auto" style={{ width: w, height: h }} />
    </span>
  );
}
