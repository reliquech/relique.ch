"use client";

import type { MarketplaceItemsUrlState } from "@/features/marketplace/types/itemsList";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

interface MarketplaceItemsFilterFieldsProps {
  draft: Pick<
    MarketplaceItemsUrlState,
    "statusMulti" | "featured" | "athlete" | "priceMin" | "priceMax"
  >;
  onChange: (patch: Partial<MarketplaceItemsUrlState>) => void;
}

export function MarketplaceItemsFilterFields({ draft, onChange }: MarketplaceItemsFilterFieldsProps) {
  const toggleStatus = (value: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...draft.statusMulti, value]))
      : draft.statusMulti.filter((s) => s !== value);
    onChange({ statusMulti: next, statusTab: "all" });
  };

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Status
        </legend>
        <div className="flex flex-wrap gap-3">
          {STATUS_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer min-h-[24px]">
              <input
                type="checkbox"
                checked={draft.statusMulti.includes(opt.value)}
                onChange={(e) => toggleStatus(opt.value, e.target.checked)}
                className="h-4 w-4"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="filter-featured" className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-2">
          Featured
        </label>
        <select
          id="filter-featured"
          value={draft.featured}
          onChange={(e) =>
            onChange({
              featured: e.target.value as MarketplaceItemsUrlState["featured"],
              statusTab: "all",
            })
          }
          className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white min-h-[40px]"
        >
          <option value="all">All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div>
        <label htmlFor="filter-athlete" className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-2">
          Athlete
        </label>
        <input
          id="filter-athlete"
          type="text"
          value={draft.athlete}
          onChange={(e) => onChange({ athlete: e.target.value, statusTab: "all" })}
          placeholder="Search athlete name"
          className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-400 min-h-[40px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="filter-price-min" className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-2">
            Min price (USD)
          </label>
          <input
            id="filter-price-min"
            type="number"
            min={0}
            value={draft.priceMin}
            onChange={(e) => onChange({ priceMin: e.target.value, statusTab: "all" })}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white min-h-[40px]"
          />
        </div>
        <div>
          <label htmlFor="filter-price-max" className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-2">
            Max price (USD)
          </label>
          <input
            id="filter-price-max"
            type="number"
            min={0}
            value={draft.priceMax}
            onChange={(e) => onChange({ priceMax: e.target.value, statusTab: "all" })}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white min-h-[40px]"
          />
        </div>
      </div>
    </div>
  );
}
