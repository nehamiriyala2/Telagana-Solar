import type { CollectionDef } from "./types";

/** One definition per module. Keep each small: the shared form, list and API do the rest. */

const SCHEME_STATUS: [string, string][] = [["active", "Running"], ["paused", "Paused"], ["closed", "Closed"]];

export const schemes: CollectionDef = {
  key: "schemes", label: "Scheme", plural: "Schemes", table: "schemes", perm: "schemes.edit", basePath: "/admin/schemes",
  intro: "One scheme = one public page at /schemes/<slug>. Check every fact on the official site and set “Last verified”.",
  titleKey: "name", titleIsI18n: true, slugKey: "slug",
  publish: { col: "status", on: "published", off: "draft" }, hasDeletedAt: true, orderBy: "sort_order, id",
  search: ["name_en", "name_te", "slug", "authority_en"], publicPath: "/schemes/{slug}",
  fields: [
    { key: "name", label: "Scheme name", kind: "i18n", section: "Basics", required: true, max: 160, full: true },
    { key: "slug", label: "Web address (slug)", kind: "slug", section: "Basics", max: 60, hint: "Lowercase words with dashes, e.g. pm-surya-ghar. Left empty, it is made from the name." },
    { key: "scheme_status", label: "Scheme status", kind: "select", section: "Basics", options: SCHEME_STATUS },
    { key: "authority", label: "Run by (authority)", kind: "i18n", section: "Basics", max: 200, full: true, hint: "e.g. Ministry of New and Renewable Energy (MNRE)", verify: true },
    { key: "summary", label: "Short summary", kind: "i18nArea", section: "Basics", max: 400, full: true },
    { key: "eligibility", label: "Who is eligible", kind: "i18nArea", section: "Details", max: 3000, full: true, hint: "One point per line.", verify: true },
    { key: "benefit", label: "Benefit", kind: "i18nArea", section: "Details", max: 3000, full: true, hint: "No amounts unless confirmed on the official site.", verify: true },
    { key: "documents", label: "Documents needed", kind: "i18nLines", section: "Details", max: 30, full: true, hint: "One document per line." },
    { key: "steps", label: "How to apply (steps)", kind: "i18nLines", section: "Details", max: 20, full: true, hint: "One step per line, in order." },
    { key: "official_url", label: "Official link", kind: "url", section: "Sources", max: 255 },
    { key: "source_url", label: "Source used to verify", kind: "url", section: "Sources", max: 255, hint: "The page you checked the facts on." },
    { key: "last_verified_at", label: "Last verified", kind: "date", section: "Sources", hint: "After 90 days the scheme is flagged “Needs re-verification”." },
    { key: "districts", label: "Districts covered", kind: "districts", section: "Sources", full: true },
    { key: "sort_order", label: "Display order", kind: "number", section: "Sources", min: 0, max: 999, hint: "Lower shows first." },
  ],
};

const PROJECT_TYPES: [string, string][] = [["home", "Home"], ["farm", "Farm"], ["shop", "Business"]];

export const projects: CollectionDef = {
  key: "projects", label: "Project", plural: "Projects", table: "projects", perm: "projects.edit", basePath: "/admin/projects",
  intro: "Completed installations shown in the public gallery. Real projects only, with the customer’s permission.",
  titleKey: "title", titleIsI18n: false, slugKey: "slug",
  publish: { col: "status", on: "published", off: "draft" }, hasDeletedAt: true, orderBy: "featured DESC, sort_order, install_date DESC, id DESC",
  search: ["title", "title_te", "area"], publicPath: "/projects",
  fields: [
    { key: "title", label: "Title (English)", kind: "text", section: "Project", required: true, max: 160 },
    { key: "title_te", label: "Title (Telugu)", kind: "text", section: "Project", max: 200 },
    { key: "slug", label: "Web address (slug)", kind: "slug", section: "Project", max: 80, hint: "Made from the title when left empty." },
    { key: "district_id", label: "District", kind: "select", section: "Project", hint: "Pick from the 33 districts." },
    { key: "area", label: "Area / village", kind: "text", section: "Project", max: 160 },
    { key: "type", label: "Type", kind: "select", section: "Project", options: PROJECT_TYPES },
    { key: "kw", label: "System size (kW)", kind: "number", section: "Project", min: 0.5, max: 10000, step: 0.5, required: true },
    { key: "install_date", label: "Install date", kind: "date", section: "Project" },
    { key: "savings_month", label: "Saving per month (₹)", kind: "number", section: "Project", min: 0, max: 10_000_000, hint: "From the customer’s bills, not an estimate." },
    { key: "story", label: "Short story", kind: "i18nArea", section: "Story", max: 2000, full: true },
    { key: "customer_name", label: "Customer first name", kind: "text", section: "Story", max: 60, hint: "First name only, for privacy." },
    { key: "quote", label: "Customer quote (optional)", kind: "i18nArea", section: "Story", max: 600, full: true },
    { key: "customer_permission", label: "Customer agreed to be shown", kind: "bool", section: "Story", hint: "Required before publishing." },
    { key: "featured", label: "Featured (shown first)", kind: "bool", section: "Story" },
  ],
};

export const posts: CollectionDef = {
  key: "posts", label: "Guide", plural: "Guides", table: "posts", perm: "content.edit", basePath: "/admin/content/posts",
  intro: "Guides and news in English and Telugu. Shown at /guides once published.",
  titleKey: "title", titleIsI18n: true, slugKey: "slug",
  publish: { col: "status", on: "published", off: "draft" }, hasDeletedAt: true, orderBy: "COALESCE(published_at, created_at) DESC",
  search: ["title_en", "title_te", "slug"], publicPath: "/guides/{slug}",
  fields: [
    { key: "title", label: "Title", kind: "i18n", section: "Guide", required: true, max: 200, full: true },
    { key: "slug", label: "Web address (slug)", kind: "slug", section: "Guide", max: 100, hint: "Made from the English title when left empty." },
    { key: "kind", label: "Type", kind: "select", section: "Guide", options: [["guide", "Guide"], ["news", "News"]] },
    { key: "excerpt", label: "Short intro", kind: "i18nArea", section: "Guide", max: 400, full: true },
    { key: "body", label: "Article", kind: "i18nArea", section: "Article", max: 60000, full: true, hint: "Simple formatting: ## Heading, **bold**, - list item, [link](https://…). One blank line between paragraphs." },
    { key: "cover_image", label: "Cover image", kind: "image", section: "Images and SEO", full: true },
    { key: "cover_alt", label: "Cover image description (alt text)", kind: "text", section: "Images and SEO", max: 200, full: true },
    { key: "seo_title", label: "SEO title", kind: "i18n", section: "Images and SEO", max: 160, full: true, hint: "About 50–60 characters. Left empty, the title is used." },
    { key: "seo_desc", label: "SEO description", kind: "i18nArea", section: "Images and SEO", max: 320, full: true, hint: "About 140–160 characters." },
  ],
};

export const faqs: CollectionDef = {
  key: "faqs", label: "FAQ", plural: "FAQs", table: "faqs", perm: "content.edit", basePath: "/admin/content/faqs",
  intro: "Questions shown on the home page, in display order.",
  titleKey: "question", titleIsI18n: true,
  publish: { col: "published", on: 1, off: 0 }, hasDeletedAt: true, orderBy: "sort_order, id",
  search: ["question_en", "question_te", "answer_en"],
  fields: [
    { key: "question", label: "Question", kind: "i18n", section: "FAQ", required: true, max: 300, full: true },
    { key: "answer", label: "Answer", kind: "i18nArea", section: "FAQ", required: true, max: 2000, full: true, hint: "Never promise amounts or free services." },
    { key: "sort_order", label: "Display order", kind: "number", section: "FAQ", min: 0, max: 999 },
  ],
};

export const testimonials: CollectionDef = {
  key: "testimonials", label: "Testimonial", plural: "Testimonials", table: "testimonials", perm: "content.edit", basePath: "/admin/content/testimonials",
  intro: "Real customer words only, with their permission.",
  titleKey: "name", titleIsI18n: false,
  publish: { col: "approved", on: 1, off: 0 }, hasDeletedAt: true, orderBy: "sort_order, id DESC",
  search: ["name", "place", "text_en"],
  fields: [
    { key: "name", label: "Customer name", kind: "text", section: "Testimonial", required: true, max: 120, hint: "First name and initial is enough." },
    { key: "place", label: "Place", kind: "text", section: "Testimonial", max: 120 },
    { key: "district_id", label: "District", kind: "select", section: "Testimonial" },
    { key: "type", label: "Type", kind: "select", section: "Testimonial", options: [["home", "Home"], ["farm", "Farm"], ["business", "Business"]] },
    { key: "text", label: "What they said", kind: "i18nArea", section: "Testimonial", required: true, max: 1000, full: true },
    { key: "sort_order", label: "Display order", kind: "number", section: "Testimonial", min: 0, max: 999 },
  ],
};

export const COLLECTIONS: Record<string, CollectionDef> = { schemes, projects, posts, faqs, testimonials };
