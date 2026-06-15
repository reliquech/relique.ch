import type { Customer, PaginatedListResponse } from "@/lib/types/admin";

export interface CustomersListParams {
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

class CustomersAPIService {
  private baseUrl = "/api/customers";

  async list(params?: CustomersListParams): Promise<PaginatedListResponse<Customer>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.owner_id) searchParams.set("owner_id", params.owner_id);
    if (params?.q) searchParams.set("q", params.q);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    if (!response.ok) return parseError(response, "Failed to fetch customers");
    return response.json();
  }

  async getById(id: string): Promise<Customer | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      return parseError(response, "Failed to fetch customer");
    }
    return response.json();
  }

  async create(payload: Record<string, unknown>): Promise<Customer> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create customer");
    return response.json();
  }

  async update(id: string, payload: Record<string, unknown>): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update customer");
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete customer");
  }

  async bulkUpdate(ids: string[], patch: { status?: string; owner_id?: string | null }) {
    const response = await fetch(`${this.baseUrl}/bulk-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, patch }),
    });
    if (!response.ok) return parseError(response, "Bulk update failed");
    return response.json();
  }
}

export const customersService = new CustomersAPIService();
