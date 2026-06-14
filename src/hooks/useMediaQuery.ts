"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    m.addEventListener("change", listener);
    return () => m.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function useIsMobile(breakpoint = 768): boolean {
  return !useMediaQuery(`(min-width: ${breakpoint}px)`);
}
