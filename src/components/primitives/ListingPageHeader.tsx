"use client";

import { motion } from "framer-motion";
import { CategoryFilter } from "../filters/CategoryFilter";
import { SortFilter } from "../filters/SortFilter";

interface ListingPageHeaderProps {
  categoryFilter: string;
  sortBy: string;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

/**
 * Listing page header with title and filters
 * Reusable header component for marketplace listing pages
 */
export function ListingPageHeader({
  categoryFilter,
  sortBy,
  onCategoryChange,
  onSortChange,
}: ListingPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-semibold tracking-tight mb-4">
          Consigned <span className="text-primaryBlue">Marketplace</span>
        </h1>
        <p className="text-textSec">
          Exclusive access to certified institutional-grade sports relics.
        </p>
      </motion.div>
      <div className="flex gap-4">
        <CategoryFilter value={categoryFilter} onChange={onCategoryChange} />
        <SortFilter value={sortBy} onChange={onSortChange} />
      </div>
    </div>
  );
}
