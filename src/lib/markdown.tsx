import { Fragment, type ReactNode } from "react";

/**
 * Tiny, safe Markdown for guides written in the admin: ## headings, paragraphs, - lists, 1. lists, **bold**, [links](https://…).
 * Builds React elements (never raw HTML), so staff text can't inject scripts. Links open safely; only http(s) and site paths.
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${keyBase}-b${i++}`}>{m[1]}</strong>);
    else {
      const external = m[3].startsWith("http");
      out.push(<a key={`${keyBase}-a${i++}`} href={m[3]} className="font-semibold text-primary-hover underline underline-offset-4" {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>{m[2]}</a>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((b, bi) => {
        const lines = b.split("\n");
        const h = /^(#{2,3})\s+(.*)$/.exec(lines[0]);
        if (h && lines.length === 1) return h[1] === "##"
          ? <h2 key={bi} className="mt-10 font-heading text-h3 font-bold text-ink">{inline(h[2], `h${bi}`)}</h2>
          : <h3 key={bi} className="mt-8 font-heading text-h4 font-bold text-ink">{inline(h[2], `h${bi}`)}</h3>;
        if (lines.every((l) => /^[-*]\s+/.test(l))) return <ul key={bi} className="mt-4 list-disc space-y-1.5 pl-6">{lines.map((l, li) => <li key={li}>{inline(l.replace(/^[-*]\s+/, ""), `u${bi}-${li}`)}</li>)}</ul>;
        if (lines.every((l) => /^\d+[.)]\s+/.test(l))) return <ol key={bi} className="mt-4 list-decimal space-y-1.5 pl-6">{lines.map((l, li) => <li key={li}>{inline(l.replace(/^\d+[.)]\s+/, ""), `o${bi}-${li}`)}</li>)}</ol>;
        return <p key={bi} className="mt-4 leading-relaxed">{lines.map((l, li) => <Fragment key={li}>{li > 0 && <br />}{inline(l, `p${bi}-${li}`)}</Fragment>)}</p>;
      })}
    </>
  );
}
