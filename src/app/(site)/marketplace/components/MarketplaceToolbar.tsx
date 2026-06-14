"use client";

import { SORT_OPTIONS } from "@/lib/utils/marketplace";

const SORT_OPTIONS_WITH_NEWEST = [
  { value: "newest", label: "NEWLY LISTED" },
  ...SORT_OPTIONS,
];

interface MarketplaceToolbarProps {
  search: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function MarketplaceToolbar({
  search,
  sortBy,
  onSearchChange,
  onSortChange,
}: MarketplaceToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 bg-cardDark border border-white/5 p-6 shadow-xl">
      <div className="flex-grow relative">
        <input
          type="text"
          placeholder="Search the archive (Player, Club, or Competition)..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 px-6 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primaryBlue transition-all pr-12 text-white placeholder:text-white/40"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden xl:block text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
          Sort By
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-white/5 border border-white/10 px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] focus:outline-none focus:border-primaryBlue transition-colors cursor-pointer min-w-[200px] text-white"
        >
          {SORT_OPTIONS_WITH_NEWEST.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
