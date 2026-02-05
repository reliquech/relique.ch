import type { AuditLogRow, PaginatedListResponse } from "@/lib/types";

export interface AuditLogsListParams {
  page?: number;
  pageSize?: number;
  entity_type?: string;
  entity_id?: string;
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

class AuditLogsAPIService {
  private baseUrl = "/api/audit-logs";

  async list(params?: AuditLogsListParams): Promise<PaginatedListResponse<AuditLogRow>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params?.entity_type) searchParams.set("entity_type", params.entity_type);
    if (params?.entity_id) searchParams.set("entity_id", params.entity_id);

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch audit logs");
    return response.json();
  }
}

export const auditLogsService = new AuditLogsAPIService();
