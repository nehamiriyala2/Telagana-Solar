import Link from "next/link";

const TABS = [
  ["posts", "Guides", "/admin/content/posts"], ["faqs", "FAQs", "/admin/content/faqs"],
  ["testimonials", "Testimonials", "/admin/content/testimonials"], ["site", "Home page & banner", "/admin/content/site"],
] as const;

/** Tabs across the Content section. */
export function ContentTabs({ active }: { active: string }) {
  return (
    <nav aria-label="Content sections" className="-mx-1 mb-5 flex gap-1 overflow-x-auto px-1 pb-1">
      {TABS.map(([k, label, href]) => (
        <Link key={k} href={href} aria-current={active === k ? "page" : undefined}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold outline-none ring-1 focus-visible:ring-2 focus-visible:ring-gold ${active === k ? "bg-navy text-white ring-navy" : "bg-white text-[#4b5b75] ring-[#ece4cf] hover:bg-[#faf7ef]"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
