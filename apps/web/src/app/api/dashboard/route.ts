import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { logServerError } from "@/lib/observability/serverErrorLog";

const ALLOWED_RANGES = new Set([7, 30, 90]);

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const searchParams = request.nextUrl.searchParams;
    const rangeParam = searchParams.get("range");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let startDate: Date;
    let endDate: Date;

    const fromDate = parseDateParam(fromParam);
    const toDate = parseDateParam(toParam);

    if (fromDate && toDate) {
      startDate = fromDate;
      endDate = toDate;
    } else {
      const range = rangeParam ? parseInt(rangeParam, 10) : 30;
      const days = ALLOWED_RANGES.has(range) ? range : 30;
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - (days - 1));
    }

    const start = toDateString(startDate);
    const end = toDateString(endDate);
    const compare = searchParams.get("compare") === "previous";

    const supabase = createServiceRoleClient();

    const callRpc = async (rpc: string, s: string, e: string) => {
      const { data, error } = await supabase.rpc(rpc as never, { start_date: s, end_date: e } as never);
      if (error) throw error;
      return data;
    };

    const [summaryData, seriesData, funnelData, leadSourceData, dealAgingData, stageVelocityData, funnelBySourceData] =
      await Promise.all([
        callRpc("crm_dashboard_summary", start, end).then((d) => d?.[0] ?? null),
        callRpc("crm_activity_series", start, end),
        callRpc("crm_funnel_summary", start, end).then((d) => d?.[0] ?? null),
        callRpc("crm_lead_source_performance", start, end),
        callRpc("crm_deal_aging", start, end),
        callRpc("crm_stage_velocity", start, end),
        callRpc("crm_funnel_by_source", start, end),
      ]);

    const payload: Record<string, unknown> = {
      summary: summaryData,
      series: seriesData ?? [],
      funnel: funnelData,
      lead_sources: leadSourceData ?? [],
      deal_aging: dealAgingData ?? [],
      stage_velocity: stageVelocityData ?? [],
      funnel_by_source: funnelBySourceData ?? [],
      range: { start, end },
    };

    if (compare) {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
      const prevEnd = new Date(startDate);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - days + 1);
      const prevStartStr = toDateString(prevStart);
      const prevEndStr = toDateString(prevEnd);
      const [prevSummary, prevFunnel] = await Promise.all([
        callRpc("crm_dashboard_summary", prevStartStr, prevEndStr).then((d) => d?.[0] ?? null),
        callRpc("crm_funnel_summary", prevStartStr, prevEndStr).then((d) => d?.[0] ?? null),
      ]);
      type SummaryRow = Record<string, unknown>;
      const s = summaryData as SummaryRow | null;
      const p = prevSummary as SummaryRow | null;
      const f = funnelData as SummaryRow | null;
      const pf = prevFunnel as SummaryRow | null;
      const summaryDelta = s && p ? {
        new_customers: (Number(s.new_customers) - Number(p.new_customers)),
        new_leads: (Number(s.new_leads) - Number(p.new_leads)),
        new_messages: (Number(s.new_messages) - Number(p.new_messages)),
        open_deals: (Number(s.open_deals) - Number(p.open_deals)),
        won_deals: (Number(s.won_deals) - Number(p.won_deals)),
        lost_deals: (Number(s.lost_deals) - Number(p.lost_deals)),
        pipeline_value: (Number(s.pipeline_value) - Number(p.pipeline_value)),
        pipeline_open_value: (Number(s.pipeline_open_value) - Number(p.pipeline_open_value)),
      } : null;
      const funnelDelta = f && pf ? {
        leads_created: (Number(f.leads_created) - Number(pf.leads_created)),
        deals_created: (Number(f.deals_created) - Number(pf.deals_created)),
        deals_won: (Number(f.deals_won) - Number(pf.deals_won)),
      } : null;
      payload.compare = {
        range: { start: prevStartStr, end: prevEndStr },
        summary_delta: summaryDelta,
        funnel_delta: funnelDelta,
      };
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    await logServerError({
      path: request.nextUrl.pathname,
      method: request.method,
      status_code: 500,
      message: error instanceof Error ? error.message : "Internal server error",
      details: { stack: error instanceof Error ? error.stack : undefined },
    }).catch(() => {});
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
