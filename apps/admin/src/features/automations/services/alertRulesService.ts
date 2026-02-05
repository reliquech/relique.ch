import type { AlertRule } from "@/lib/types";

export interface AlertRuleCreateInput {
  name: string;
  condition_type:
    | "lead_stale"
    | "lead_status"
    | "lead_score_min"
    | "lead_score_max"
    | "lead_source"
    | "deal_stale"
    | "deal_status"
    | "deal_value_min"
    | "deal_value_max"
    | "message_unread"
    | "message_status"
    | "message_source";
  condition_params?: Record<string, unknown> | null;
  entity_type?: "lead" | "deal" | "message" | null;
  conditions?: Array<{ type: string; params?: Record<string, unknown> | null }> | null;
  action_type?: "create_notification" | "create_task";
  action_params?: Record<string, unknown> | null;
  enabled?: boolean;
  cooldown_hours?: number | null;
}

export interface AlertRuleUpdateInput {
  name?: string;
  condition_type?:
    | "lead_stale"
    | "lead_status"
    | "lead_score_min"
    | "lead_score_max"
    | "lead_source"
    | "deal_stale"
    | "deal_status"
    | "deal_value_min"
    | "deal_value_max"
    | "message_unread"
    | "message_status"
    | "message_source";
  condition_params?: Record<string, unknown> | null;
  entity_type?: "lead" | "deal" | "message" | null;
  conditions?: Array<{ type: string; params?: Record<string, unknown> | null }> | null;
  action_type?: "create_notification" | "create_task";
  action_params?: Record<string, unknown> | null;
  enabled?: boolean;
  cooldown_hours?: number | null;
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

class AlertRulesAPIService {
  private baseUrl = "/api/alert-rules";

  async list(): Promise<AlertRule[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) return parseError(response, "Failed to fetch alert rules");
    return response.json();
  }

  async create(payload: AlertRuleCreateInput): Promise<AlertRule> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create alert rule");
    return response.json();
  }

  async update(id: string, payload: AlertRuleUpdateInput): Promise<AlertRule> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update alert rule");
    return response.json();
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete alert rule");
  }

  async preview(id: string): Promise<{ count: number }> {
    const response = await fetch(`${this.baseUrl}/preview?id=${id}`);
    if (!response.ok) return parseError(response, "Failed to preview alert rule");
    return response.json();
  }

  async run(options?: { dry_run?: boolean }): Promise<{ triggered: number; notifications: number; tasks?: number; dry_run?: boolean }> {
    const response = await fetch(`${this.baseUrl}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options?.dry_run ? { dry_run: true } : {}),
    });
    if (!response.ok) return parseError(response, "Failed to run alert rules");
    return response.json();
  }
}

export const alertRulesService = new AlertRulesAPIService();
