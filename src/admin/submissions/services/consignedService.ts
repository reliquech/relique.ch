import type { PaginatedListResponse } from "@/lib/types/admin";

export interface ConsignedItemRow {
  id: string;
  item_description: string;
  status: string;
  updated_at: string;
  created_at: string;
  contact_name?: string;
  contact_email?: string;
  [key: string]: unknown;
}

export interface ConsignedListParams {
  status?: string;
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

class ConsignedAPIService {
  private baseUrl = "/api/consigned";

  async list(
    params?: ConsignedListParams
  ): Promise<PaginatedListResponse<ConsignedItemRow>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const url =
      searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch consigned items");
    return response.json();
  }
}

export const consignedService = new ConsignedAPIService();
