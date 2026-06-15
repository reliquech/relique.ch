"use client";

import { Search, Plus, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  MarketplaceItemsUrlState,
  MarketplaceStatusCounts,
  MarketplaceStatusTab,
} from "@/features/marketplace/types/itemsList";
import type { MarketplaceItemsView } from "@/features/marketplace/hooks/useMarketplaceItemsView";
import { MarketplaceItemsCountSummary } from "./MarketplaceItemsCountSummary";
import { MarketplaceItemsViewToggle } from "./MarketplaceItemsViewToggle";

const TABS: Array<{ id: MarketplaceStatusTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
];

const SORT_OPTIONS: Array<{
  sort: MarketplaceItemsUrlState["sort"];
  order: MarketplaceItemsUrlState["order"];
  label: string;
}> = [
  { sort: "updated_at", order: "desc", label: "Updated (newest)" },
  { sort: "updated_at", order: "asc", label: "Updated (oldest)" },
  { sort: "title", order: "asc", label: "Title (A–Z)" },
  { sort: "title", order: "desc", label: "Title (Z–A)" },
  { sort: "price_usd", order: "desc", label: "Price (high–low)" },
  { sort: "price_usd", order: "asc", label: "Price (low–high)" },
];

interface MarketplaceItemsToolbarProps {
  state: MarketplaceItemsUrlState;
  counts?: MarketplaceStatusCounts;
  searchInput: string;
  filtersOpen: boolean;
  hasActiveFilters: boolean;
  view: MarketplaceItemsView;
  visibleCount: number;
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: MarketplaceStatusTab) => void;
  onViewChange: (view: MarketplaceItemsView) => void;
  onToggleFilters: () => void;
  onSortChange: (sort: MarketplaceItemsUrlState["sort"], order: MarketplaceItemsUrlState["order"]) => void;
  onClearAll: () => void;
}

export function MarketplaceItemsToolbar({
  state,
  counts,
  searchInput,
  filtersOpen,
  hasActiveFilters,
  view,
  visibleCount,
  filteredCount,
  totalCount,
  onSearchChange,
  onTabChange,
  onViewChange,
  onToggleFilters,
  onSortChange,
  onClearAll,
}: MarketplaceItemsToolbarProps) {
  const router = useRouter();
  const activeSort =
    SORT_OPTIONS.find((o) => o.sort === state.sort && o.order === state.order)?.label ??
    "Updated (newest)";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white text-balance">
          Marketplace Items
        </h2>
        <button
          type="button"
          onClick={() => router.push("/admin/marketplace/new")}
          className="bg-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-white min-h-[40px]"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Add Item
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MarketplaceItemsCountSummary
          visible={visibleCount}
          filtered={filteredCount}
          total={totalCount}
          hasFilters={hasActiveFilters || state.statusTab !== "all"}
        />
        <MarketplaceItemsViewToggle view={view} onViewChange={onViewChange} />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:flex-wrap">
        <div className="relative w-full xl:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, athlete, or ID"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-gray-400 min-h-[40px]"
          />
        </div>

        <div
          role="tablist"
          aria-label="Filter by status"
          className="flex flex-wrap gap-1 border-b border-border pb-1 xl:border-0 xl:pb-0"
        >
          {TABS.map((tab) => {
            const count = counts?.[tab.id] ?? 0;
            const active = state.statusTab === tab.id && state.statusMulti.length === 0;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors min-h-[40px] ${
                  active
                    ? "text-white border-primary"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                {tab.label}
                <span className="ml-1 text-xs text-gray-500">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            className="relative bg-white/5 border border-border text-gray-300 px-3 py-2 rounded-lg text-sm hover:text-white flex items-center gap-2 min-h-[40px]"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden />
            Filters
            {hasActiveFilters ? (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" aria-hidden />
            ) : null}
          </button>

          <div className="relative">
            <label htmlFor="items-sort" className="sr-only">
              Sort items
            </label>
            <div className="flex items-center gap-2 bg-white/5 border border-border rounded-lg px-2 min-h-[40px]">
              <ArrowUpDown className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
              <select
                id="items-sort"
                value={`${state.sort}:${state.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split(":") as [
                    MarketplaceItemsUrlState["sort"],
                    MarketplaceItemsUrlState["order"],
                  ];
                  onSortChange(sort, order);
                }}
                className="bg-transparent text-sm text-white py-2 pr-6 focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={`${opt.sort}:${opt.order}`} value={`${opt.sort}:${opt.order}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="sr-only">Current sort: {activeSort}</span>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm text-gray-400 hover:text-white px-2 py-2 min-h-[40px]"
            >
              Clear all
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
