"use client";
import { useEffect } from "react";

/**
 * Reads a query param once on mount and passes it to `apply` if it is allowed.
 * Lets statically prerendered pages honour deep links like /finder?persona=farmer.
 */
export function useQueryParam<T extends string>(name: string, allowed: readonly T[] | ((v: string) => boolean), apply: (v: T) => void) {
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get(name);
    if (!v) return;
    const ok = typeof allowed === "function" ? allowed(v) : (allowed as readonly string[]).includes(v);
    if (ok) apply(v as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
