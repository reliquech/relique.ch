import type { DashboardSummary, DashboardSeriesItem, DashboardFunnelSummary, LeadSourcePerformance, DealAgingBucket } from "@/lib/types/admin";

export interface DashboardRange {
  start: string;
  end: string;
}

export interface DashboardResponse {
  summary: DashboardSummary | null;
  series: DashboardSeriesItem[];
  funnel: DashboardFunnelSummary | null;
  lead_sources: LeadSourcePerformance[];
  deal_aging: DealAgingBucket[];
  stage_velocity?: unknown[];
  funnel_by_source?: unknown[];
  range: DashboardRange;
  compare?: {
    range: DashboardRange;
    summary_delta?: Record<string, number>;
    funnel_delta?: Record<string, number>;
  };
}

export interface DashboardParams {
  range?: number;
  from?: string;
  to?: string;
  compare?: boolean;
}

async function parseError(response: Response, prefix: string): Promise<never> {
  let message = response.statusText;
  try {
    const data = await response.json();
    if (data.error) message = data.error;
  } catch {
    // ignore
  }
  throw new Error(`${prefix}: ${message}`);
}

class DashboardAPIService {
  private baseUrl = "/api/dashboard";

  async get(params?: DashboardParams): Promise<DashboardResponse> {
    const searchParams = new URLSearchParams();
    if (params?.range) searchParams.set("range", String(params.range));
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);
    if (params?.compare) searchParams.set("compare", "previous");

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch dashboard data");
    return response.json();
  }

  async listReports(): Promise<DashboardReport[]> {
    const res = await fetch(`${this.baseUrl}/reports`);
    if (!res.ok) return parseError(res, "Failed to fetch reports");
    return res.json();
  }

  async createReport(payload: { name: string; filters: Record<string, unknown>; chart_options?: Record<string, unknown>; is_default?: boolean }) {
    const res = await fetch(`${this.baseUrl}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return parseError(res, "Failed to create report");
    return res.json();
  }

  async updateReport(id: string, payload: { name?: string; filters?: Record<string, unknown>; chart_options?: Record<string, unknown>; is_default?: boolean }) {
    const res = await fetch(`${this.baseUrl}/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return parseError(res, "Failed to update report");
    return res.json();
  }

  async deleteReport(id: string) {
    const res = await fetch(`${this.baseUrl}/reports/${id}`, { method: "DELETE" });
    if (!res.ok) return parseError(res, "Failed to delete report");
  }

  async exportCsv(params?: DashboardParams): Promise<void> {
    const data = await this.get(params);
    const lines: string[] = [];

    lines.push("section,key,value");
    if (data.summary) {
      lines.push(`summary,new_customers,${data.summary.new_customers}`);
      lines.push(`summary,new_leads,${data.summary.new_leads}`);
      lines.push(`summary,new_messages,${data.summary.new_messages}`);
      lines.push(`summary,open_deals,${data.summary.open_deals}`);
      lines.push(`summary,won_deals,${data.summary.won_deals}`);
      lines.push(`summary,lost_deals,${data.summary.lost_deals}`);
      lines.push(`summary,pipeline_value,${data.summary.pipeline_value}`);
      lines.push(`summary,pipeline_open_value,${data.summary.pipeline_open_value}`);
    }

    lines.push("series,date,new_leads,new_deals,new_messages");
    data.series.forEach((item) => {
      lines.push(`series,${item.date},${item.new_leads},${item.new_deals},${item.new_messages}`);
    });

    if (data.funnel) {
      lines.push("funnel,leads_created,deals_created,deals_won");
      lines.push(`funnel,${data.funnel.leads_created},${data.funnel.deals_created},${data.funnel.deals_won}`);
    }

    if (data.lead_sources.length) {
      lines.push("lead_sources,source,lead_count,converted_count");
      data.lead_sources.forEach((row) => {
        lines.push(`lead_sources,${row.source},${row.lead_count},${row.converted_count}`);
      });
    }

    if (data.deal_aging.length) {
      lines.push("deal_aging,bucket,deal_count,total_value");
      data.deal_aging.forEach((row) => {
        lines.push(`deal_aging,${row.bucket},${row.deal_count},${row.total_value}`);
      });
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crm-dashboard-${data.range.start}-to-${data.range.end}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

export interface DashboardReport {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  chart_options: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const dashboardService = new DashboardAPIService();
