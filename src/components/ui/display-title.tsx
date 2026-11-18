import { cn } from "@/lib/utils";

/**
 * Page title (h1) in the display style: clamp(2.5rem, 7vw, 6rem), 800, -0.03em, leading 0.95.
 * Each word rises out of a mask on load. This is CSS-only on purpose: the title is the LCP element,
 * so it paints with the server HTML instead of waiting for JavaScript. Words in `emphasis` get amber.
 */
export function DisplayTitle({ text, emphasis, className, as: Tag = "h1", id, size = "xl" }: {
  text: string; emphasis?: string; className?: string; as?: "h1" | "h2"; id?: string; size?: "xl" | "lg";
}) {
  const em = new Set((emphasis ?? "").toLowerCase().split(/\s+/).filter(Boolean));
  const words = text.split(" ");
  return (
    <Tag id={id} aria-label={text} className={cn(size === "xl" ? "display-xl" : "display-lg", "text-navy", className)}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="word-mask">
          <span className={cn(em.has(w.toLowerCase().replace(/[.,!?:]/g, "")) && "text-gold-gradient")} style={{ animationDelay: `${0.06 + i * 0.07}s` }}>{w}</span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

/** Uppercase eyebrow pill with the amber dot (reuses the homepage .eyebrow-pill). */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow-pill", className)}>{children}</p>;
}
