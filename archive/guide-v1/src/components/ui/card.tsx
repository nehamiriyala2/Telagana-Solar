import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, glass, ...props }: React.HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return (
    <div
      className={cn("rounded-card shadow-soft", glass ? "glass" : "border border-line bg-surface", className)}
      {...props}
    />
  );
}
