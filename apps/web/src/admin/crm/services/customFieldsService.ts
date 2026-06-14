import type { CustomField } from "@/lib/types/admin";

export type CustomFieldEntityType = "customer" | "lead" | "deal" | "message";

export interface CustomFieldCreateInput {
  entity_type: CustomFieldEntityType;
  name: string;
  key: string;
  field_type: CustomField["field_type"];
  options?: string[] | null;
  required?: boolean;
  position?: number;
  group?: string | null;
  visibility_rules?: Record<string, unknown> | null;
}

export interface CustomFieldUpdateInput {
  name?: string;
  key?: string;
  field_type?: CustomField["field_type"];
  options?: string[] | null;
  required?: boolean;
  position?: number;
  group?: string | null;
  visibility_rules?: Record<string, unknown> | null;
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

class CustomFieldsAPIService {
  private baseUrl = "/api/custom-fields";

  async list(entityType?: CustomFieldEntityType): Promise<CustomField[]> {
    const searchParams = new URLSearchParams();
    if (entityType) searchParams.set("entity_type", entityType);

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch custom fields");
    return response.json();
  }

  async create(payload: CustomFieldCreateInput): Promise<CustomField> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create custom field");
    return response.json();
  }

  async update(id: string, payload: CustomFieldUpdateInput): Promise<CustomField> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update custom field");
    return response.json();
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete custom field");
  }

  async exportTemplate(entityType?: CustomFieldEntityType, format: "json" | "csv" = "json") {
    const params = new URLSearchParams();
    if (entityType) params.set("entity_type", entityType);
    params.set("format", format);
    const res = await fetch(`${this.baseUrl}/export?${params}`);
    if (!res.ok) return parseError(res, "Failed to export");
    return format === "json" ? res.json() : res.text();
  }

  async importTemplate(payload: {
    mode: "merge" | "overwrite";
    entity_type?: CustomFieldEntityType;
    fields: Array<CustomFieldCreateInput & { position?: number }>;
  }) {
    const res = await fetch(`${this.baseUrl}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return parseError(res, "Failed to import");
    return res.json();
  }
}

export const customFieldsService = new CustomFieldsAPIService();
