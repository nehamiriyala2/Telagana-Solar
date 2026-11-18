import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        neutral: "bg-fg/[0.06] text-fg",
        gold: "bg-gold-soft text-navy dark:bg-gold/15 dark:text-gold",
        savings: "bg-savings/12 text-savings-text",
        warn: "bg-amber/12 text-[#8a4200] dark:text-gold",
        outline: "border border-line text-muted",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className, variant, ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
