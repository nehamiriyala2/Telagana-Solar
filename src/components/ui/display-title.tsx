import { cn } from "@/lib/utils";

export type TitleReveal = "mask" | "chars" | "slide";

/** Split a word into user-perceived characters (keeps Telugu vowel signs with their consonant). */
function graphemes(word: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  return Seg ? Array.from(new Seg(undefined, { granularity: "grapheme" }).segment(word), (s) => s.segment) : Array.from(word);
}

/**
 * Page title (h1) in the display style: clamp(2.5rem, 7vw, 6rem), 800, -0.03em, leading 0.95.
 * CSS-only entrance on purpose (the title is the LCP element, so it paints with the server HTML):
 * - reveal="mask": each word rises out of a mask (default)
 * - reveal="chars": characters rise one after another
 * - reveal="slide": words glide in from the left out of a soft blur
 * Words in `emphasis` get the moving gold gradient; `underline` draws a hand-drawn gold stroke under the last one.
 */
export function DisplayTitle({ text, emphasis, className, as: Tag = "h1", id, size = "xl", reveal = "mask", underline = false }: {
  text: string; emphasis?: string; className?: string; as?: "h1" | "h2"; id?: string; size?: "xl" | "lg"; reveal?: TitleReveal; underline?: boolean;
}) {
  const em = new Set((emphasis ?? "").toLowerCase().split(/\s+/).filter(Boolean));
  const words = text.split(" ");
  const isEm = (w: string) => em.has(w.toLowerCase().replace(/[.,!?:]/g, ""));
  const lastEm = words.reduce((acc, w, i) => (isEm(w) ? i : acc), -1);
  let charIndex = 0;

  return (
    <Tag id={id} aria-label={text} className={cn(size === "xl" ? "display-xl" : "display-lg", "text-navy", className)}>
      {words.map((w, i) => {
        const highlight = isEm(w);
        const space = i < words.length - 1 ? " " : "";
        let body: React.ReactNode;
        if (reveal === "chars") {
          body = (
            <span aria-hidden className="char-word">
              {graphemes(w).map((c, j) => (
                <span key={j} className={cn("char-up", highlight && "text-gold-shine")} style={{ animationDelay: `${0.05 + charIndex++ * 0.028}s` }}>{c}</span>
              ))}
              {space}
            </span>
          );
        } else {
          body = (
            <span aria-hidden className={reveal === "slide" ? "word-slide" : "word-mask"}>
              <span className={cn(highlight && "text-gold-shine")} style={{ animationDelay: `${0.06 + i * (reveal === "slide" ? 0.09 : 0.07)}s` }}>{w}</span>
              {space}
            </span>
          );
        }
        if (underline && i === lastEm) {
          return (
            <span key={i} aria-hidden className="title-underline">
              {body}
              <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="title-underline__svg">
                <path d="M4 16 C 70 6, 150 4, 296 10 C 210 12, 120 16, 40 21" pathLength={1} />
              </svg>
            </span>
          );
        }
        return <span key={i}>{body}</span>;
      })}
    </Tag>
  );
}

/** Uppercase eyebrow pill with the amber dot (reuses the homepage .eyebrow-pill). */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow-pill", className)}>{children}</p>;
}
