import type { Message, PaginatedListResponse } from "@/lib/types";

export interface MessagesListParams {
  status?: string;
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

class MessagesAPIService {
  private baseUrl = "/api/messages";

  async list(params?: MessagesListParams): Promise<PaginatedListResponse<Message>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.q) searchParams.set("q", params.q);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    if (!response.ok) return parseError(response, "Failed to fetch messages");
    return response.json();
  }

  async getById(id: string): Promise<Message | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      return parseError(response, "Failed to fetch message");
    }
    return response.json();
  }

  async create(payload: Record<string, unknown>): Promise<Message> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to create message");
    return response.json();
  }

  async update(id: string, payload: Record<string, unknown>): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update message");
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete message");
  }
}

export const messagesService = new MessagesAPIService();
