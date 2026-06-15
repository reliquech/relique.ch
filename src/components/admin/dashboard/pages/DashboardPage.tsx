"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import StatsGrid from "@/components/admin/dashboard/components/StatsGrid";
import { Download, Activity } from "lucide-react";
import type { AuditLogRow, DashboardSeriesItem, DashboardSummary, DashboardFunnelSummary, LeadSourcePerformance, DealAgingBucket } from "@/lib/types/admin";
import { dashboardService, type DashboardReport } from "@/features/dashboard/services/dashboardService";
import { auditLogsService } from "@/features/dashboard/services/auditLogsService";
import { FunnelSummaryCard } from "@/components/admin/dashboard/components/FunnelSummaryCard";
import { LeadSourceTable } from "@/components/admin/dashboard/components/LeadSourceTable";
import { DealAgingTable } from "@/components/admin/dashboard/components/DealAgingTable";
import type { DashboardChartPoint } from "@/components/admin/dashboard/components/DashboardRevenueChart";

const DashboardRevenueChart = dynamic(
  () =>
    import("@/components/admin/dashboard/components/DashboardRevenueChart").then((m) => ({
      default: m.DashboardRevenueChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Loading chart…
      </div>
    ),
  }
);

const RANGE_OPTIONS = [7, 30, 90];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState(30);
  const [compare, setCompare] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [series, setSeries] = useState<DashboardSeriesItem[]>([]);
  const [funnel, setFunnel] = useState<DashboardFunnelSummary | null>(null);
  const [leadSources, setLeadSources] = useState<LeadSourcePerformance[]>([]);
  const [dealAging, setDealAging] = useState<DealAgingBucket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<Awaited<ReturnType<typeof dashboardService.get>> | null>(null);
  const [savedReports, setSavedReports] = useState<DashboardReport[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    dashboardService.listReports().then(setSavedReports).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, logsData] = await Promise.all([
          dashboardService.get({ range, compare }),
          auditLogsService.list({ page: 1, pageSize: 6 }),
        ]);
        setDashboardData(data);
        setSummary(data.summary);
        setSeries(data.series);
        setFunnel(data.funnel);
        setLeadSources(data.lead_sources ?? []);
        setDealAging(data.deal_aging ?? []);
        setAuditLogs(logsData.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [range, compare]);

  const chartData = useMemo((): DashboardChartPoint[] => {
    if (!series.length) return [];
    return series.map((item) => ({
      name: mounted
        ? new Date(item.date).toLocaleDateString()
        : item.date,
      new_leads: item.new_leads,
      new_deals: item.new_deals,
      new_messages: item.new_messages,
    }));
  }, [series, mounted]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">CRM activity and performance metrics.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white/5 border border-border rounded-lg p-1">
            {RANGE_OPTIONS.map((value) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  range === value ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {value}d
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="rounded" />
            So sánh với kỳ trước
          </label>
          {savedReports.length > 0 && (
            <select
              className="bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs text-white"
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                const r = savedReports.find((x) => x.id === id);
                if (r?.filters && typeof r.filters === "object" && "range" in r.filters) {
                  const rangeVal = (r.filters as { range?: number }).range;
                  if (typeof rangeVal === "number") setRange(rangeVal);
                }
                if (r?.filters && typeof r.filters === "object" && "compare" in r.filters) {
                  setCompare((r.filters as { compare?: boolean }).compare === true);
                }
                e.target.value = "";
              }}
            >
              <option value="">Saved report...</option>
              {savedReports.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
          <button
            className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-white"
            onClick={() => dashboardService.exportCsv({ range })}
            disabled={loading}
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <StatsGrid summary={summary} summaryDelta={dashboardData?.compare?.summary_delta} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-6 text-white">CRM Activity</h3>
          <div className="h-[300px] w-full min-h-[300px] min-w-0">
            {mounted && !loading && <DashboardRevenueChart data={chartData} height={300} />}
            {mounted && loading && (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Loading chart…
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-surface border border-border p-6 rounded-xl overflow-hidden">
            <h3 className="font-bold text-lg mb-4 text-white">Recent Logs</h3>
            <div className="space-y-4">
              {auditLogs.length === 0 && (
                <p className="text-sm text-gray-500">No recent activity.</p>
              )}
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex gap-3 items-start border-l-2 border-primary/20 pl-4 py-1">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {log.action} on {log.entity_type || "record"}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5" suppressHydrationWarning>
                      {mounted
                        ? new Date(log.created_at).toLocaleTimeString()
                        : new Date(log.created_at).toISOString().split("T")[1]?.split(".")[0] || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FunnelSummaryCard data={funnel} />
        <LeadSourceTable items={leadSources} />
        <DealAgingTable items={dealAging} />
      </div>
    </div>
  );
}
