import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";

const conditionEntityMap: Record<string, "lead" | "deal" | "message"> = {
  lead_stale: "lead",
  lead_status: "lead",
  lead_score_min: "lead",
  lead_score_max: "lead",
  lead_source: "lead",
  deal_stale: "deal",
  deal_status: "deal",
  deal_value_min: "deal",
  deal_value_max: "deal",
  message_unread: "message",
  message_status: "message",
  message_source: "message",
};

function ensureNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function countLeads(supabase: ReturnType<typeof createServiceRoleClient>, conditions: any[]) {
  let query = supabase.from("leads").select("id", { count: "exact", head: true });

  for (const cond of conditions) {
    switch (cond.type) {
      case "lead_stale": {
        const days = ensureNumber(cond.params?.days, 7);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        query = query.or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoff.toISOString()}`);
        break;
      }
      case "lead_status": {
        if (cond.params?.status) query = query.eq("status", cond.params.status);
        break;
      }
      case "lead_score_min": {
        const min = ensureNumber(cond.params?.min, 0);
        query = query.gte("score", min);
        break;
      }
      case "lead_score_max": {
        const max = ensureNumber(cond.params?.max, 0);
        query = query.lte("score", max);
        break;
      }
      case "lead_source": {
        if (cond.params?.source) query = query.eq("source", cond.params.source);
        break;
      }
      default:
        break;
    }
  }

  const { count } = await query;
  return count ?? 0;
}

async function countDeals(supabase: ReturnType<typeof createServiceRoleClient>, conditions: any[]) {
  let query = supabase.from("deals").select("id", { count: "exact", head: true });

  for (const cond of conditions) {
    switch (cond.type) {
      case "deal_stale": {
        const days = ensureNumber(cond.params?.days, 14);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        query = query.eq("status", "open").lt("updated_at", cutoff.toISOString());
        break;
      }
      case "deal_status": {
        if (cond.params?.status) query = query.eq("status", cond.params.status);
        break;
      }
      case "deal_value_min": {
        const min = ensureNumber(cond.params?.min, 0);
        query = query.gte("value", min);
        break;
      }
      case "deal_value_max": {
        const max = ensureNumber(cond.params?.max, 0);
        query = query.lte("value", max);
        break;
      }
      default:
        break;
    }
  }

  const { count } = await query;
  return count ?? 0;
}

async function countMessages(supabase: ReturnType<typeof createServiceRoleClient>, conditions: any[]) {
  let query = supabase.from("messages").select("id", { count: "exact", head: true });

  for (const cond of conditions) {
    switch (cond.type) {
      case "message_unread": {
        const hours = ensureNumber(cond.params?.hours, 24);
        const cutoff = new Date();
        cutoff.setTime(cutoff.getTime() - hours * 60 * 60 * 1000);
        query = query.eq("status", "new").lt("created_at", cutoff.toISOString());
        break;
      }
      case "message_status": {
        if (cond.params?.status) query = query.eq("status", cond.params.status);
        break;
      }
      case "message_source": {
        if (cond.params?.source) query = query.eq("source", cond.params.source);
        break;
      }
      default:
        break;
    }
  }

  const { count } = await query;
  return count ?? 0;
}

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const ruleId = request.nextUrl.searchParams.get("id");
    if (!ruleId) {
      return NextResponse.json({ error: "Missing rule id" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: rule, error } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("id", ruleId)
      .eq("user_id", user.id)
      .single();

    if (error || !rule) {
      return NextResponse.json({ error: error?.message || "Rule not found" }, { status: 404 });
    }

    type RuleRow = { conditions?: unknown; condition_type: string; condition_params?: unknown; entity_type?: string | null };
    const r = rule as RuleRow;
    type CondItem = { type: string; params?: Record<string, unknown> };
    const conditions: CondItem[] = Array.isArray(r.conditions) && r.conditions.length
      ? (r.conditions as CondItem[])
      : [{ type: r.condition_type, params: (r.condition_params as Record<string, unknown>) ?? {} }];

    const firstCondType = conditions[0]?.type;
    const entityType = r.entity_type ?? (firstCondType ? conditionEntityMap[firstCondType] : undefined);
    const returnEntities = request.nextUrl.searchParams.get("entities") === "1";
    let count = 0;
    let entityIds: string[] = [];

    if (entityType === "lead") {
      if (returnEntities) {
        let q = supabase.from("leads").select("id");
        for (const cond of conditions) {
          switch (cond.type) {
            case "lead_stale": {
              const days = ensureNumber(cond.params?.days, 7);
              const cutoff = new Date();
              cutoff.setDate(cutoff.getDate() - days);
              q = q.or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoff.toISOString()}`);
              break;
            }
            case "lead_status": if (cond.params?.status) q = q.eq("status", cond.params.status); break;
            case "lead_score_min": q = q.gte("score", ensureNumber(cond.params?.min, 0)); break;
            case "lead_score_max": q = q.lte("score", ensureNumber(cond.params?.max, 0)); break;
            case "lead_source": if (cond.params?.source) q = q.eq("source", cond.params.source); break;
            default: break;
          }
        }
        const { data: rows } = await q;
        entityIds = (rows ?? []).map((r: { id: string }) => r.id);
        count = entityIds.length;
      } else {
        count = await countLeads(supabase, conditions);
      }
    }
    if (entityType === "deal") {
      if (returnEntities) {
        let q = supabase.from("deals").select("id");
        for (const cond of conditions) {
          switch (cond.type) {
            case "deal_stale": {
              const days = ensureNumber(cond.params?.days, 14);
              const cutoff = new Date();
              cutoff.setDate(cutoff.getDate() - days);
              q = q.eq("status", "open").lt("updated_at", cutoff.toISOString());
              break;
            }
            case "deal_status": if (cond.params?.status) q = q.eq("status", cond.params.status); break;
            case "deal_value_min": q = q.gte("value", ensureNumber(cond.params?.min, 0)); break;
            case "deal_value_max": q = q.lte("value", ensureNumber(cond.params?.max, 0)); break;
            default: break;
          }
        }
        const { data: rows } = await q;
        entityIds = (rows ?? []).map((r: { id: string }) => r.id);
        count = entityIds.length;
      } else {
        count = await countDeals(supabase, conditions);
      }
    }
    if (entityType === "message") {
      if (returnEntities) {
        let q = supabase.from("messages").select("id");
        for (const cond of conditions) {
          switch (cond.type) {
            case "message_unread": {
              const hours = ensureNumber(cond.params?.hours, 24);
              const cutoff = new Date();
              cutoff.setTime(cutoff.getTime() - hours * 60 * 60 * 1000);
              q = q.eq("status", "new").lt("created_at", cutoff.toISOString());
              break;
            }
            case "message_status": if (cond.params?.status) q = q.eq("status", cond.params.status); break;
            case "message_source": if (cond.params?.source) q = q.eq("source", cond.params.source); break;
            default: break;
          }
        }
        const { data: rows } = await q;
        entityIds = (rows ?? []).map((r: { id: string }) => r.id);
        count = entityIds.length;
      } else {
        count = await countMessages(supabase, conditions);
      }
    }

    return NextResponse.json(returnEntities ? { count, entity_ids: entityIds } : { count });
  } catch (error) {
    console.error("Error previewing alert rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
