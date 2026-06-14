import type { ActivityItem } from "@/admin/crm/types";

export interface ActivityListParams {
  entity_type: string;
  entity_id: string;
  limit?: number;
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

class ActivityAPIService {
  private baseUrl = "/api/activity";

  async list(params: ActivityListParams): Promise<{ items: ActivityItem[] }> {
    const searchParams = new URLSearchParams();
    searchParams.set("entity_type", params.entity_type);
    searchParams.set("entity_id", params.entity_id);
    if (params.limit != null) searchParams.set("limit", String(params.limit));

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    if (!response.ok) return parseError(response, "Failed to fetch activity");
    return response.json();
  }

  async addNote(entity_type: string, entity_id: string, body: string): Promise<{ id: string; created_at: string }> {
    const response = await fetch(`${this.baseUrl}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity_type, entity_id, body }),
    });
    if (!response.ok) return parseError(response, "Failed to add note");
    return response.json();
  }
}

export const activityService = new ActivityAPIService();
