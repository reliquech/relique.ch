import type { Deal, PaginatedListResponse } from "@/lib/types";

export interface DealsListParams {
  status?: string;
  pipeline_stage_id?: string;
  customer_id?: string;
  lead_id?: string;
  owner_id?: string;
  q?: string;
  page?: number;
  pageSize?: number;
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

class DealsAPIService {
  private baseUrl = "/api/deals";

  async list(params?: DealsListParams): Promise<PaginatedListResponse<Deal>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.pipeline_stage_id) searchParams.set("pipeline_stage_id", params.pipeline_stage_id);
    if (params?.customer_id) searchParams.set("customer_id", params.customer_id);
    if (params?.lead_id) searchParams.set("lead_id", params.lead_id);
    if (params?.owner_id) searchParams.set("owner_id", params.owner_id);
    if (params?.q) searchParams.set("q", params.q);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    if (!response.ok) return parseError(response, "Failed to fetch deals");
    return response.json();
  }

  async getById(id: string): Promise<Deal | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      return parseError(response, "Failed to fetch deal");
    }
    return response.json();
  }

  async create(payload: Record<string, unknown>): Promise<Deal> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create deal");
    return response.json();
  }

  async update(id: string, payload: Record<string, unknown>): Promise<Deal> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update deal");
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete deal");
  }

  async bulkUpdate(
    ids: string[],
    patch: { status?: string; pipeline_stage_id?: string | null; closed_at?: string | null; owner_id?: string | null }
  ) {
    const response = await fetch(`${this.baseUrl}/bulk-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, patch }),
    });
    if (!response.ok) return parseError(response, "Bulk update failed");
    return response.json();
  }
}

export const dealsService = new DealsAPIService();
