"use client";

import { PAGE_SIZE_OPTIONS } from "@/features/marketplace/types/itemsList";

interface MarketplaceItemsPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function MarketplaceItemsPagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: MarketplaceItemsPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-gray-300 disabled:opacity-40 min-h-[40px]"
        >
          Previous
        </button>
        <span className="px-3 py-2 text-sm text-gray-400">
          Page {page} of {safeTotalPages}
        </span>
        <button
          type="button"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-gray-300 disabled:opacity-40 min-h-[40px]"
        >
          Next
        </button>
      </div>

      <div className="flex items-center justify-end gap-2">
        <label htmlFor="page-size" className="text-sm text-gray-400">
          Rows
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white min-h-[40px]"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
