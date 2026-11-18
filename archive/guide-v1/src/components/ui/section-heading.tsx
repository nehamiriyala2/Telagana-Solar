import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow, title, subtitle, align = "center", as: Tag = "h2", className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
}) {
  const cls = cn("mb-10 md:mb-14", align === "center" && "mx-auto max-w-2xl text-center", className);
  const body = (
    <>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag className={Tag === "h1" ? "text-hero md:text-h2-lg" : "text-h2 md:text-h2-lg"}>{title}</Tag>
      {subtitle && <p className="mt-4 text-muted">{subtitle}</p>}
    </>
  );
  // Page titles (h1) are LCP candidates: render visible immediately. Section titles reveal on scroll.
  return Tag === "h1" ? <div className={cls}>{body}</div> : <Reveal className={cls}>{body}</Reveal>;
}
