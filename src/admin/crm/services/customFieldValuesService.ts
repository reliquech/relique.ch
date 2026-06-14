import type { CustomFieldValue } from "@/lib/types/admin";
import type { CustomFieldEntityType } from "./customFieldsService";

export interface CustomFieldValuesListParams {
  entity_type: CustomFieldEntityType;
  entity_id: string;
}

export interface CustomFieldValuesUpsertInput {
  entity_type: CustomFieldEntityType;
  entity_id: string;
  values: Record<string, unknown>;
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

class CustomFieldValuesAPIService {
  private baseUrl = "/api/custom-field-values";

  async list(params: CustomFieldValuesListParams): Promise<{ items: CustomFieldValue[] }> {
    const searchParams = new URLSearchParams();
    searchParams.set("entity_type", params.entity_type);
    searchParams.set("entity_id", params.entity_id);

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    if (!response.ok) return parseError(response, "Failed to fetch custom field values");
    return response.json();
  }

  async upsert(payload: CustomFieldValuesUpsertInput): Promise<{ items: CustomFieldValue[] }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to save custom field values");
    return response.json();
  }
}

export const customFieldValuesService = new CustomFieldValuesAPIService();
