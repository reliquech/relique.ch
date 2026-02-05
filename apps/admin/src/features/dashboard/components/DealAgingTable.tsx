import React from "react";
import type { DealAgingBucket } from "@/lib/types";

interface DealAgingTableProps {
  items: DealAgingBucket[];
}

export function DealAgingTable({ items }: DealAgingTableProps) {
  return (
    <div className="bg-surface border border-border p-6 rounded-xl">
      <h3 className="font-bold text-lg text-white">Deal Aging</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 mt-3">No open deals in range.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((row) => (
            <div key={row.bucket} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-white font-medium">{row.bucket}</p>
                <p className="text-[10px] text-gray-500">{row.deal_count} deal(s)</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${Number(row.total_value || 0).toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">Total value</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
