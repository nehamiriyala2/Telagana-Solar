"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { GuidePersona } from "@/config/personas";

// Each tool is only downloaded when someone opens (or hovers) its button.
const GuideDialog = dynamic(() => import("./guide-dialog").then((m) => m.GuideDialog), { ssr: false });
const SubsidyDialog = dynamic(() => import("./subsidy-dialog").then((m) => m.SubsidyDialog), { ssr: false });

/** Opens "Find My Solar Plan". */
export function GuideTrigger({ children, persona, ...btn }: ButtonProps & { persona?: GuidePersona }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <Button type="button" {...btn} aria-haspopup="dialog" onPointerEnter={() => setLoaded(true)} onFocus={() => setLoaded(true)} onClick={() => { setLoaded(true); setOpen(true); }}>
        {children}
      </Button>
      {loaded && <GuideDialog open={open} onClose={() => setOpen(false)} initialPersona={persona} />}
    </>
  );
}

/** Opens "Check My Subsidy". */
export function SubsidyTrigger({ children, ...btn }: ButtonProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <Button type="button" {...btn} aria-haspopup="dialog" onPointerEnter={() => setLoaded(true)} onFocus={() => setLoaded(true)} onClick={() => { setLoaded(true); setOpen(true); }}>
        {children}
      </Button>
      {loaded && <SubsidyDialog open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
