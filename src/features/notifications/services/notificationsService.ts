import type { Notification, PaginatedListResponse } from "@/lib/types/admin";

export interface NotificationsListParams {
  unread?: boolean;
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

class NotificationsAPIService {
  private baseUrl = "/api/notifications";

  async list(params?: NotificationsListParams): Promise<PaginatedListResponse<Notification>> {
    const searchParams = new URLSearchParams();
    if (params?.unread !== undefined) searchParams.set("unread", String(params.unread));
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams.toString()}` : this.baseUrl;
    const response = await fetch(url);
    if (!response.ok) return parseError(response, "Failed to fetch notifications");
    return response.json();
  }

  async markRead(id: string): Promise<Notification> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "PATCH" });
    if (!response.ok) return parseError(response, "Failed to mark notification as read");
    return response.json();
  }

  async markAllRead(): Promise<{ updated: number }> {
    const response = await fetch(this.baseUrl, { method: "PATCH" });
    if (!response.ok) return parseError(response, "Failed to mark notifications as read");
    return response.json();
  }

  async remove(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) return parseError(response, "Failed to delete notification");
  }
}

export const notificationsService = new NotificationsAPIService();
