import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-3 py-1 text-caption font-semibold [&_svg]:size-3.5", {
  variants: {
    variant: {
      gold: "bg-gold-soft text-gold-ink",
      sky: "bg-sky-tint text-sky-ink",
      outline: "border border-line text-muted",
      neutral: "bg-navy/[0.06] text-navy",
    },
  },
  defaultVariants: { variant: "sky" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Visible placeholder for content the owner still has to add. */
export function EditMark({ label = "[EDIT]", className }: { label?: string; className?: string }) {
  return <span className={cn("edit-mark", className)} title="Placeholder: edit in src/config">{label}</span>;
}
