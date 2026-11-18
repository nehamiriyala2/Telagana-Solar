import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo (public/brand/logo.webp, 640×361, cropped from the supplied artwork; never stretched or recoloured).
 * - header: inside a rounded deep-navy badge so it sits naturally on the white header; 40px tall on phones, 50px from md
 * - footer: larger, directly on the navy footer
 * Source file: public/brand/logo-original.png. Replace with a transparent PNG/SVG later if available. [EDIT]
 */
const RATIO = 640 / 361;

export function Logo({ variant = "header", className, priority }: { variant?: "header" | "footer"; className?: string; priority?: boolean }) {
  if (variant === "header") {
    return (
      <span className={cn("inline-flex shrink-0 overflow-hidden rounded-xl bg-navy p-0.5 shadow-[0_4px_14px_-6px_rgb(7_23_63/0.5)]", className)}>
        <Image src="/brand/logo.webp" alt="Telangana Solar: Clean energy for a brighter Telangana" width={Math.round(50 * RATIO)} height={50} priority={priority}
          sizes="90px" className="block h-9 w-auto min-[400px]:h-10 md:h-[50px]" />
      </span>
    );
  }
  const h = 120;
  const w = Math.round(h * RATIO);
  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden", className)}>
      <Image src="/brand/logo.webp" alt="Telangana Solar: Clean energy for a brighter Telangana" width={w} height={h} priority={priority} className="block h-auto" style={{ width: w, height: h }} />
    </span>
  );
}
