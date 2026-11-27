import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Buttons (pill, 44px): primary blue, secondary white with 1.5px blue border, accent = saffron highlight CTA (dark text, AA), white = on dark bands. */
export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[0.01em] transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.05em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover",
        sky: "bg-primary text-white hover:bg-primary-hover",
        white: "bg-white text-primary hover:bg-tint-ice",
        green: "bg-accent text-ink hover:bg-accent-hover",
        accent: "bg-accent text-ink hover:bg-accent-hover",
        whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-hover",
        outline: "border-[1.5px] border-primary bg-white text-primary hover:bg-tint-ice",
        ghost: "text-primary hover:bg-primary/5",
        solid: "bg-primary text-white hover:bg-primary-hover",
      },
      size: {
        sm: "h-10 px-4 text-caption",
        md: "h-11 px-6 text-base",
        lg: "h-12 px-7 text-[1.0625rem]",
        icon: "size-11 hover:translate-y-0",
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
