import type { NotificationPreferences } from "@/lib/types/admin";

export interface NotificationPreferencesUpdateInput {
  in_app_enabled?: boolean;
  email_enabled?: boolean;
  type_preferences?: Record<string, boolean> | null;
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

class NotificationPreferencesService {
  private baseUrl = "/api/notification-preferences";

  async get(): Promise<NotificationPreferences> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) return parseError(response, "Failed to fetch notification preferences");
    return response.json();
  }

  async update(payload: NotificationPreferencesUpdateInput): Promise<NotificationPreferences> {
    const response = await fetch(this.baseUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return parseError(response, "Failed to update notification preferences");
    return response.json();
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
