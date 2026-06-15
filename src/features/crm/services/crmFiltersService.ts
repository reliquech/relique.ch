import type { CrmEntityType } from "./crmViewsService";

export interface CrmSavedFilter {
  id: string;
  user_id: string;
  entity_type: CrmEntityType;
  name: string;
  query: string | null;
  filters: Record<string, unknown> | null;
  created_at: string;
}

export interface CrmSavedFilterInput {
  entity_type: CrmEntityType;
  name: string;
  query?: string | null;
  filters?: Record<string, unknown> | null;
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

class CrmFiltersAPIService {
  private baseUrl = "/api/crm-filters";

  async list(entity?: CrmEntityType): Promise<CrmSavedFilter[]> {
    const url = entity ? `${this.baseUrl}?entity=${entity}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch saved filters");
    return response.json();
  }

  async create(payload: CrmSavedFilterInput): Promise<CrmSavedFilter> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to save filter");
    return response.json();
  }

  async update(id: string, payload: Partial<CrmSavedFilterInput>): Promise<CrmSavedFilter> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update filter");
    return response.json();
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete filter");
  }
}

export const crmFiltersService = new CrmFiltersAPIService();
