"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { MarketplaceItemsDensity } from "@/features/marketplace/types/itemsList";

interface MarketplaceItemsTableSkeletonProps {
  density?: MarketplaceItemsDensity;
  rows?: number;
}

export function MarketplaceItemsTableSkeleton({
  density = "comfortable",
  rows = 8,
}: MarketplaceItemsTableSkeletonProps) {
  const rowPy = density === "compact" ? "py-2" : "py-3";

  return (
    <div className="w-full overflow-x-auto bg-surface border border-border rounded-xl shadow-sm">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-border">
          <tr>
            {Array.from({ length: 9 }).map((_, i) => (
              <th key={i} className="px-4 py-4">
                <Skeleton className="h-3 w-16 bg-white/5 motion-reduce:animate-none" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row}>
              {Array.from({ length: 9 }).map((_, col) => (
                <td key={col} className={`px-4 ${rowPy}`}>
                  <Skeleton className="h-4 w-full max-w-[120px] bg-white/5 motion-reduce:animate-none" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
