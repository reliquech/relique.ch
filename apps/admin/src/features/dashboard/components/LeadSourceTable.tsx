import React from "react";
import type { LeadSourcePerformance } from "@/lib/types";

interface LeadSourceTableProps {
  items: LeadSourcePerformance[];
}

export function LeadSourceTable({ items }: LeadSourceTableProps) {
  return (
    <div className="bg-surface border border-border p-6 rounded-xl">
      <h3 className="font-bold text-lg text-white">Lead Sources</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 mt-3">No lead sources yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.slice(0, 6).map((row) => (
            <div key={row.source} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-white font-medium">{row.source}</p>
                <p className="text-[10px] text-gray-500">Converted {row.converted_count}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{row.lead_count}</p>
                <p className="text-[10px] text-gray-500">Leads</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
