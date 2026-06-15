"use client";

import { useState, useEffect } from "react";
import { CATEGORY_OPTIONS } from "@/lib/utils/marketplace";

interface MarketplaceSidebarFiltersProps {
  categoryFilter: string;
  priceMin?: number;
  priceMax?: number;
  onCategoryChange: (value: string) => void;
  onPriceChange: (min?: number, max?: number) => void;
  onReset: () => void;
}

export function MarketplaceSidebarFilters({
  categoryFilter,
  priceMin,
  priceMax,
  onCategoryChange,
  onPriceChange,
  onReset,
}: MarketplaceSidebarFiltersProps) {
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);

  const [localMin, setLocalMin] = useState(priceMin !== undefined ? String(priceMin) : "");
  const [localMax, setLocalMax] = useState(priceMax !== undefined ? String(priceMax) : "");

  // Keep local input state in sync with URL changes
  useEffect(() => {
    setLocalMin(priceMin !== undefined ? String(priceMin) : "");
  }, [priceMin]);

  useEffect(() => {
    setLocalMax(priceMax !== undefined ? String(priceMax) : "");
  }, [priceMax]);

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = localMin.trim() !== "" ? Number(localMin) : undefined;
    const maxVal = localMax.trim() !== "" ? Number(localMax) : undefined;
    onPriceChange(minVal, maxVal);
  };

  const handleClearPrice = () => {
    setLocalMin("");
    setLocalMax("");
    onPriceChange(undefined, undefined);
  };

  const handleGlobalReset = () => {
    setLocalMin("");
    setLocalMax("");
    onReset();
  };

  return (
    <div className="flex flex-col h-full bg-cardDark md:bg-transparent overflow-y-auto no-scrollbar pb-6">
      <div className="p-6 md:p-0 space-y-6">
        {/* Category Accordion */}
        <div className="border-b border-white/5 pb-6">
          <button
            type="button"
            onClick={() => setCategoryExpanded((e) => !e)}
            className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 hover:text-white transition-colors"
          >
            Category
            <svg
              className={`w-4 h-4 transition-transform ${categoryExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {categoryExpanded && (
            <div className="space-y-2 mt-4">
              {CATEGORY_OPTIONS.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryFilter === cat}
                    onChange={() => onCategoryChange(cat)}
                    className="w-4 h-4 rounded-none bg-bgDark border-white/10 text-primaryBlue focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">
                    {cat.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Accordion */}
        <div className="border-b border-white/5 pb-6">
          <button
            type="button"
            onClick={() => setPriceExpanded((e) => !e)}
            className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 hover:text-white transition-colors"
          >
            Price Range (USD)
            <svg
              className={`w-4 h-4 transition-transform ${priceExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {priceExpanded && (
            <form onSubmit={handleApplyPrice} className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-primaryBlue placeholder:text-white/20"
                />
                <span className="text-white/40 text-xs font-bold">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-primaryBlue placeholder:text-white/20"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-grow bg-primaryBlue hover:bg-opacity-90 transition-all text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-sm"
                >
                  Apply
                </button>
                {(localMin !== "" || localMax !== "") && (
                  <button
                    type="button"
                    onClick={handleClearPrice}
                    className="px-3 border border-white/10 hover:bg-white/5 transition-all text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Reset All */}
        <button
          type="button"
          onClick={handleGlobalReset}
          className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-accentBlue hover:text-highlightIce transition-colors pt-2 text-left"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}
