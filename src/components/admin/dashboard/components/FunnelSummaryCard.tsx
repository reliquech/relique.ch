import React from "react";
import type { DashboardFunnelSummary } from "@/lib/types/admin";

interface FunnelSummaryCardProps {
  data: DashboardFunnelSummary | null;
}

export function FunnelSummaryCard({ data }: FunnelSummaryCardProps) {
  if (!data) {
    return (
      <div className="bg-surface border border-border p-6 rounded-xl">
        <h3 className="font-bold text-lg text-white">Funnel</h3>
        <p className="text-sm text-gray-500 mt-2">No data available.</p>
      </div>
    );
  }

  const max = Math.max(data.leads_created, data.deals_created, data.deals_won, 1);
  const rows = [
    { label: "Leads", value: data.leads_created, color: "bg-primary" },
    { label: "Deals", value: data.deals_created, color: "bg-emerald-500" },
    { label: "Won", value: data.deals_won, color: "bg-amber-400" },
  ];

  return (
    <div className="bg-surface border border-border p-6 rounded-xl">
      <h3 className="font-bold text-lg text-white">Funnel</h3>
      <div className="space-y-4 mt-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{row.label}</span>
              <span className="text-white font-semibold">{row.value}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full ${row.color}`}
                style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
