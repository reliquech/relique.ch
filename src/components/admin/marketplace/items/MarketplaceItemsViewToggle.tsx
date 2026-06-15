"use client";

import { Grid3X3, Table2 } from "lucide-react";
import type { MarketplaceItemsView } from "@/features/marketplace/hooks/useMarketplaceItemsView";

interface MarketplaceItemsViewToggleProps {
  view: MarketplaceItemsView;
  onViewChange: (view: MarketplaceItemsView) => void;
  disabled?: boolean;
}

export function MarketplaceItemsViewToggle({
  view,
  onViewChange,
  disabled,
}: MarketplaceItemsViewToggleProps) {
  return (
    <div className="inline-flex min-h-[40px] rounded-lg border border-border bg-white/5 p-1" aria-label="Items view">
      {(["table", "grid"] as const).map((option) => {
        const active = view === option;
        const Icon = option === "table" ? Table2 : Grid3X3;
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onViewChange(option)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${
              active ? "bg-primary text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {option}
          </button>
        );
      })}
    </div>
  );
}
