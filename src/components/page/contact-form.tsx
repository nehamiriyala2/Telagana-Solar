"use client";
import { useEffect, useState } from "react";
import { LeadForm } from "@/components/forms/lead-form";
import type { PropertyType } from "@/config/calculator";

/** Contact-page booking form. Reads ?package= and ?type= from "Get quote" buttons. */
export function ContactForm() {
  const [pkg, setPkg] = useState<string | null>(null);
  const [type, setType] = useState<PropertyType | undefined>();
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = q.get("package");
    if (p && /^[a-z0-9-]{1,40}$/.test(p)) setPkg(p);
    const ty = q.get("type");
    if (ty === "home" || ty === "farm" || ty === "business") setType(ty);
  }, []);
  return (
    <LeadForm kind={pkg ? "quote" : "plan_request"} packageId={pkg} defaultPropertyType={type}
      fields={{ location: true, propertyType: true, bill: true, message: true }} wide />
  );
}
