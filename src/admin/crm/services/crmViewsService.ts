export type CrmEntityType = "customers" | "leads" | "deals" | "messages";

export interface CrmSavedView {
  id: string;
  user_id: string;
  entity_type: CrmEntityType;
  name: string;
  state: Record<string, unknown>;
  is_default?: boolean;
  shared?: boolean;
  created_at: string;
}

export interface CrmSavedViewInput {
  entity_type: CrmEntityType;
  name: string;
  state: Record<string, unknown>;
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

class CrmViewsAPIService {
  private baseUrl = "/api/crm-views";

  async list(entity?: CrmEntityType): Promise<CrmSavedView[]> {
    const url = entity ? `${this.baseUrl}?entity=${entity}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch saved views");
    return response.json();
  }

  async create(payload: CrmSavedViewInput): Promise<CrmSavedView> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to save view");
    return response.json();
  }

  async update(id: string, payload: Partial<Omit<CrmSavedViewInput, "entity_type">> & { is_default?: boolean; shared?: boolean }): Promise<CrmSavedView> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update view");
    return response.json();
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete view");
  }
}

export const crmViewsService = new CrmViewsAPIService();
