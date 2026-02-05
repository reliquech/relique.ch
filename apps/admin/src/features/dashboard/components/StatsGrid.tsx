"use client";

import React from "react";
import { TrendingUp, Users, MessageSquare, Briefcase } from "lucide-react";
import type { DashboardSummary } from "@/lib/types";

type StatsGridProps = {
  summary: DashboardSummary | null;
  summaryDelta?: Record<string, number> | null;
};

const StatsGrid: React.FC<StatsGridProps> = ({ summary, summaryDelta }) => {
  const stats = [
    { label: "New Leads", key: "new_leads", value: summary?.new_leads ?? 0, icon: Users, color: "text-primary" },
    { label: "New Customers", key: "new_customers", value: summary?.new_customers ?? 0, icon: TrendingUp, color: "text-accent" },
    { label: "New Messages", key: "new_messages", value: summary?.new_messages ?? 0, icon: MessageSquare, color: "text-warning" },
    { label: "Open Deals", key: "open_deals", value: summary?.open_deals ?? 0, icon: Briefcase, color: "text-success" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const delta = summaryDelta?.[stat.key];
        const current = (summary as unknown as Record<string, number> | undefined)?.[stat.key] ?? 0;
        const prevVal = typeof delta === "number" ? (current as number) - delta : 0;
        const pct = typeof delta === "number" && prevVal !== 0 ? Math.round((delta / prevVal) * 100) : null;
        return (
          <div
            key={stat.label}
            className="bg-surface border border-border p-6 rounded-xl hover:border-primary/50 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-gray-400 text-sm font-medium">{stat.label}</h4>
            <p className="text-3xl font-bold mt-1 group-hover:text-primary transition-colors text-white">
              {stat.value}
            </p>
            {summaryDelta && typeof delta === "number" && (
              <p className="text-xs mt-1 text-gray-500" title="vs previous period">
                {delta >= 0 ? "+" : ""}{delta} {pct != null ? `(${pct >= 0 ? "+" : ""}${pct}%)` : ""}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
