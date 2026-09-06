import { useState } from "react";

// Mount-time snapshot (not reactive): consumers use it to seed animation
// state once, so mid-session preference changes are intentionally ignored.
export function usePrefersReducedMotion(): boolean {
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return reduced;
}
