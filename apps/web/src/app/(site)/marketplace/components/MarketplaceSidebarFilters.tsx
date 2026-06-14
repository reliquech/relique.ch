"use client";

import { useState } from "react";
import { CATEGORY_OPTIONS } from "@/lib/utils/marketplace";

interface MarketplaceSidebarFiltersProps {
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
}

export function MarketplaceSidebarFilters({
  categoryFilter,
  onCategoryChange,
}: MarketplaceSidebarFiltersProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col h-full bg-cardDark md:bg-transparent overflow-y-auto no-scrollbar">
      <div className="p-6 md:p-0 space-y-2">
        <div className="border-b border-white/5 py-4">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 hover:text-white transition-colors"
          >
            Category
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded && (
            <div className="space-y-2 mt-4">
              {CATEGORY_OPTIONS.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryFilter === cat}
                    onChange={() => onCategoryChange(cat)}
                    className="w-4 h-4 rounded-none bg-bgDark border-white/10 text-primaryBlue focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">
                    {cat.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onCategoryChange("ALL")}
          className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-accentBlue hover:text-highlightIce transition-colors pt-4 text-left"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
