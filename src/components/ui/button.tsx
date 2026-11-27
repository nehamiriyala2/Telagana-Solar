import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Buttons: sun-gold gradient = main action (dark text), sky-blue `solid` / outline for the rest, green = WhatsApp (white icon). */
export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[0.01em] transition-[box-shadow,background-color,color,border-color] duration-300 ease-out-soft active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.05em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-light))] text-on-gold shadow-[0_8px_20px_-12px_rgb(226_171_53/0.7)] hover:bg-[linear-gradient(135deg,var(--color-gold-dark),var(--color-gold))] hover:shadow-glow",
        sky: "bg-primary text-card hover:bg-primary-hover",
        whatsapp: "bg-whatsapp text-card hover:bg-whatsapp-hover",
        outline: "border border-primary/40 bg-card text-primary hover:border-primary hover:bg-tint-ice",
        ghost: "text-primary hover:bg-primary/5",
        solid: "bg-primary text-card hover:bg-primary-hover",
      },
      size: {
        sm: "h-10 px-4 text-caption",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-7 text-[1.0625rem]",
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
