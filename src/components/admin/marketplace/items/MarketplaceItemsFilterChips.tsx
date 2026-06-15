"use client";

import { X } from "lucide-react";
import type { MarketplaceItemsUrlState } from "@/features/marketplace/types/itemsList";

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

function buildChips(
  state: MarketplaceItemsUrlState,
  onPatch: (patch: Partial<MarketplaceItemsUrlState>) => void
): Chip[] {
  const chips: Chip[] = [];

  state.statusMulti.forEach((status) => {
    chips.push({
      key: `status-${status}`,
      label: `Status: ${status}`,
      onRemove: () =>
        onPatch({
          statusMulti: state.statusMulti.filter((s) => s !== status),
          page: 1,
        }),
    });
  });

  if (state.featured !== "all") {
    chips.push({
      key: "featured",
      label: `Featured: ${state.featured === "true" ? "Yes" : "No"}`,
      onRemove: () => onPatch({ featured: "all", page: 1 }),
    });
  }

  if (state.athlete.trim()) {
    chips.push({
      key: "athlete",
      label: `Athlete: ${state.athlete}`,
      onRemove: () => onPatch({ athlete: "", page: 1 }),
    });
  }

  if (state.priceMin.trim()) {
    chips.push({
      key: "price-min",
      label: `Min: $${state.priceMin}`,
      onRemove: () => onPatch({ priceMin: "", page: 1 }),
    });
  }

  if (state.priceMax.trim()) {
    chips.push({
      key: "price-max",
      label: `Max: $${state.priceMax}`,
      onRemove: () => onPatch({ priceMax: "", page: 1 }),
    });
  }

  if (state.q.trim()) {
    chips.push({
      key: "q",
      label: `Search: ${state.q}`,
      onRemove: () => onPatch({ q: "", page: 1 }),
    });
  }

  return chips;
}

interface MarketplaceItemsFilterChipsProps {
  state: MarketplaceItemsUrlState;
  onPatch: (patch: Partial<MarketplaceItemsUrlState>) => void;
}

export function MarketplaceItemsFilterChips({ state, onPatch }: MarketplaceItemsFilterChipsProps) {
  const chips = buildChips(state, onPatch);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 bg-white/5 border border-border rounded-full px-3 py-1 text-xs text-gray-300"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="p-1 rounded-full hover:bg-white/10 min-w-[24px] min-h-[24px] flex items-center justify-center"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" aria-hidden />
          </button>
        </span>
      ))}
    </div>
  );
}
