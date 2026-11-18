import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Buttons lift and glow softly on hover. Gold = primary actions, sky = trust, green = WhatsApp. */
export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-out-soft hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-sun text-navy shadow-[0_6px_18px_-8px_rgb(245_168_0/0.6)] hover:shadow-glow",
        sky: "bg-sky text-white shadow-[0_6px_18px_-8px_rgb(77_163_255/0.6)] hover:shadow-[0_10px_30px_-8px_rgb(77_163_255/0.55)]",
        whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-hover hover:shadow-[0_10px_30px_-10px_rgb(21_128_61/0.6)]",
        outline: "border border-[#1769E8]/25 bg-white text-navy hover:border-[#1769E8]/60 hover:bg-[#F4F8FF] hover:shadow-soft",
        ghost: "text-navy hover:bg-navy/5 hover:translate-y-0",
        navy: "bg-navy text-white hover:bg-navy-700",
      },
      size: {
        sm: "h-10 px-4 text-caption",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-7 text-[1.0625rem]",
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
