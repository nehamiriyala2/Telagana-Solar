/**
 * Slow mist band with the brand line in sky-blue serif and gold stars ("Make your own power ✦ Pay less for it").
 * CSS-only loop (styles in site-theme.css), pauses on hover, static for reduced motion.
 * The repeated copies are decorative: screen readers get one readable line.
 */
export function SiteMarquee({ phrases }: { phrases: string[] }) {
  const run = Array.from({ length: 6 }, () => phrases).flat();
  const half = (key: string) => (
    <span key={key} className="flex shrink-0 items-center">
      {run.map((p, i) => (
        <span key={i} className="flex items-center whitespace-nowrap px-6 font-heading text-[1.375rem] italic md:text-[1.75rem]">
          {p}<span aria-hidden className="ml-12 text-[0.9rem] not-italic text-gold/70">✦</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="site-marquee py-5 md:py-6">
      <p className="sr-only">{phrases.join(". ")}</p>
      <div aria-hidden className="site-marquee__track">{half("a")}{half("b")}</div>
    </div>
  );
}
