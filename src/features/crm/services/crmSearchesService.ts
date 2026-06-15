import type { CrmEntityType } from "./crmViewsService";

export interface CrmRecentSearch {
  id: string;
  user_id: string;
  entity_type: CrmEntityType;
  query: string;
  created_at: string;
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

class CrmSearchesAPIService {
  private baseUrl = "/api/crm-searches";

  async list(entity?: CrmEntityType): Promise<CrmRecentSearch[]> {
    const url = entity ? `${this.baseUrl}?entity=${entity}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch recent searches");
    return response.json();
  }

  async add(entity_type: CrmEntityType, query: string): Promise<CrmRecentSearch> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity_type, query }),
    });
    if (!response.ok) return parseError(response, "Failed to save recent search");
    return response.json();
  }
}

export const crmSearchesService = new CrmSearchesAPIService();
