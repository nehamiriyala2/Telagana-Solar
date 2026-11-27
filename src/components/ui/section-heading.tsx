import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

/**
 * Section heading. `premium` (homepage only) adds an eyebrow pill and larger display type;
 * `tone="dark"` is for navy sections. Defaults keep the original style used on other pages.
 */
export function SectionHeading({
  eyebrow, title, subtitle, align = "center", as: Tag = "h2", className, premium = false, tone = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
  premium?: boolean;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const cls = cn("mb-10 md:mb-14", align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", premium && (align === "center" ? "max-w-4xl" : "max-w-3xl"), className);
  const body = (
    <>
      {eyebrow && (premium
        ? <p className={cn("eyebrow-pill mb-4", dark && "eyebrow-pill--dark")}>{eyebrow}</p>
        : <p className="eyebrow mb-3">{eyebrow}</p>)}
      <Tag className={cn(
        Tag === "h1" ? "text-hero md:text-hero-lg" : "text-h2 md:text-h2-lg",
        premium && Tag === "h2" && "md:text-[3.25rem] md:leading-[3.75rem]",
        dark ? "text-white" : "text-ink",
      )}>{title}</Tag>
      {subtitle && <p className={cn("mt-4 md:text-body-lg", dark ? "text-silver/85" : "text-muted")}>{subtitle}</p>}
    </>
  );
  // Page titles (h1) are LCP candidates: visible immediately. Section titles reveal on scroll.
  return Tag === "h1" ? <div className={cn(cls, "animate-rise")}>{body}</div> : <Reveal className={cls}>{body}</Reveal>;
}
