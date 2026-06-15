"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export type DashboardChartPoint = {
  name: string;
  new_leads: number;
  new_deals: number;
  new_messages: number;
};

interface DashboardRevenueChartProps {
  data: DashboardChartPoint[];
  height?: number;
}

export function DashboardRevenueChart({ data, height = 300 }: DashboardRevenueChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center text-sm text-gray-500"
        style={{ height }}
      >
        No activity in this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} minWidth={0}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0055FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0055FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", borderRadius: "8px" }}
          itemStyle={{ color: "#E5E7EB" }}
        />
        <Area type="monotone" dataKey="new_leads" stroke="#0055FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" />
        <Area type="monotone" dataKey="new_deals" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorDeals)" />
        <Area type="monotone" dataKey="new_messages" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
