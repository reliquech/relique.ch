import type { Attachment } from "@/lib/types";

export interface AttachmentsListParams {
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

class AttachmentsAPIService {
  private baseUrl = "/api/attachments";

  async list(params?: AttachmentsListParams): Promise<{ items: Attachment[] }> {
    const searchParams = new URLSearchParams();
    if (params?.entity_type) searchParams.set("entity_type", params.entity_type);
    if (params?.entity_id) searchParams.set("entity_id", params.entity_id);

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch attachments");
    return response.json();
  }

  async getById(id: string): Promise<Attachment | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      return parseError(response, "Failed to fetch attachment");
    }
    return response.json();
  }

  async create(payload: Record<string, unknown>): Promise<Attachment> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create attachment");
    return response.json();
  }

  /** Get a reserved path and attachment id for upload (client then uploads to path). */
  async getUploadUrl(payload: {
    entity_type: string;
    entity_id: string;
    file_name: string;
    content_type?: string | null;
    size_bytes?: number | null;
  }): Promise<{ attachment_id: string; file_path: string }> {
    const response = await fetch(`${this.baseUrl}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to get upload URL");
    return response.json();
  }

  async update(id: string, payload: Record<string, unknown>): Promise<Attachment> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update attachment");
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete attachment");
  }
}

export const attachmentsService = new AttachmentsAPIService();
