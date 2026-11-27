"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small photo thumbnail with a graceful fallback: `fallback` (usually an icon) sits underneath and
 * stays visible until the photo loads, or for good if the file is missing.
 */
export function PhotoTile({ src, alt = "", className, style, fallback, children }: {
  src?: string; alt?: string; className?: string; style?: CSSProperties; fallback?: ReactNode; children?: ReactNode;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  // The image can fail before hydration attaches onError, so check once on mount too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  return (
    <span className={cn("relative block", className)} style={style}>
      <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-[inherit]">{fallback}</span>
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)}
          className="absolute inset-0 size-full rounded-[inherit] object-cover" />
      )}
      {children}
    </span>
  );
}
