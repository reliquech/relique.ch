"use client";

import { useCallback, useEffect, useState } from "react";

export type MarketplaceItemsView = "table" | "grid";

const STORAGE_KEY = "relique.admin.marketplace.itemsView";

function isView(value: string | null): value is MarketplaceItemsView {
  return value === "table" || value === "grid";
}

export function useMarketplaceItemsView() {
  const [view, setViewState] = useState<MarketplaceItemsView>("table");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isView(stored)) {
        setViewState(stored);
        return;
      }
    } catch {
      // Ignore blocked storage and fall through to viewport default.
    }

    setViewState(window.matchMedia("(max-width: 767px)").matches ? "grid" : "table");
  }, []);

  const setView = useCallback((next: MarketplaceItemsView) => {
    setViewState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // View preference is non-critical.
    }
  }, []);

  return { view, setView, mounted };
}
