"use client";
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center py-3", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-fg/10">
      <SliderPrimitive.Range className="absolute h-full bg-sun" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block size-7 rounded-full border-4 border-surface bg-gold shadow-lift transition-transform duration-300 hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber/40" />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";
