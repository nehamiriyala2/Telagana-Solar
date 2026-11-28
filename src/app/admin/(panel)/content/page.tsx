import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Content opens on Guides; the tabs lead to FAQs, Testimonials and Home page & banner. */
export default function ContentPage() {
  redirect("/admin/content/posts");
}
