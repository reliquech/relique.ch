import type { Lead, PaginatedListResponse } from "@/lib/types/admin";

export interface LeadsListParams {
  status?: string;
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

class LeadsAPIService {
  private baseUrl = "/api/leads";

  async list(params?: LeadsListParams): Promise<PaginatedListResponse<Lead>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.owner_id) searchParams.set("owner_id", params.owner_id);
    if (params?.q) searchParams.set("q", params.q);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    if (!response.ok) return parseError(response, "Failed to fetch leads");
    return response.json();
  }

  async getById(id: string): Promise<Lead | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      return parseError(response, "Failed to fetch lead");
    }
    return response.json();
  }

  async create(payload: Record<string, unknown>): Promise<Lead> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create lead");
    return response.json();
  }

  async update(id: string, payload: Record<string, unknown>): Promise<Lead> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update lead");
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete lead");
  }

  async bulkUpdate(ids: string[], patch: { status?: string; owner_id?: string | null; source?: string | null }) {
    const response = await fetch(`${this.baseUrl}/bulk-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, patch }),
    });
    if (!response.ok) return parseError(response, "Bulk update failed");
    return response.json();
  }
}

export const leadsService = new LeadsAPIService();
