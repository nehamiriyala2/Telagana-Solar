import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,box-shadow,background-color,color] duration-300 ease-out-soft disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:size-[1.15em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Gold is the 10% accent: primary CTAs only. Navy text on gold ≈ 9.8:1 */
        primary: "bg-sun text-navy shadow-glow hover:brightness-105",
        navy: "bg-navy text-cream hover:bg-navy-700 dark:bg-cream dark:text-navy dark:hover:bg-white",
        outline: "border border-line bg-surface/60 text-fg backdrop-blur hover:bg-surface",
        ghost: "text-fg hover:bg-fg/5",
      },
      size: {
        sm: "h-9 px-4 text-caption",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-[1.0625rem]",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
