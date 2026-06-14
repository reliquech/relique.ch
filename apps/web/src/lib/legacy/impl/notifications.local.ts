import type { INotificationsService } from "@relique/shared/domain";
import type { Result } from "@relique/shared/domain";
import { ok, err } from "@relique/shared/domain";
import {
  validationError,
  notFoundError,
  unknownError,
  quotaExceededError,
} from "@relique/shared/domain";
import type { Notification } from "@relique/shared/domain";
import { storage } from "@/lib/storage";

const MAX_NOTIFICATIONS = 100;

function pruneNotifications(notifications: Notification[]): Notification[] {
  if (notifications.length <= MAX_NOTIFICATIONS) return notifications;
  return notifications.slice(-MAX_NOTIFICATIONS);
}

export const notificationsServiceLocal: INotificationsService = {
  async push(notification: Omit<Notification, "id" | "read" | "timestamp">): Promise<Result<Notification>> {
    try {
      const notifications = storage.admin.notifications.get();
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        read: false,
        timestamp: Date.now(),
      };
      
      const updated = pruneNotifications([...notifications, newNotification]);
      storage.admin.notifications.set(updated);
      
      return ok(newNotification);
    } catch (error) {
      if (error instanceof Error && error.message.includes("quota")) {
        return err(quotaExceededError("Storage quota exceeded", MAX_NOTIFICATIONS));
      }
      return err(unknownError("Failed to push notification", error));
    }
  },

  async list(): Promise<Result<Notification[]>> {
    try {
      const notifications = storage.admin.notifications.get();
      return ok(notifications);
    } catch (error) {
      return err(unknownError("Failed to list notifications", error));
    }
  },

  async markRead(id: string): Promise<Result<void>> {
    try {
      const notifications = storage.admin.notifications.get();
      const notification = notifications.find((n) => n.id === id);
      
      if (!notification) {
        return err(notFoundError(`Notification not found: ${id}`, "notification"));
      }
      
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      storage.admin.notifications.set(updated);
      
      return ok(undefined);
    } catch (error) {
      return err(unknownError("Failed to mark notification as read", error));
    }
  },

  async markAllRead(): Promise<Result<void>> {
    try {
      const notifications = storage.admin.notifications.get();
      const updated = notifications.map((n) => ({ ...n, read: true }));
      storage.admin.notifications.set(updated);
      
      return ok(undefined);
    } catch (error) {
      return err(unknownError("Failed to mark all notifications as read", error));
    }
  },

  async clear(): Promise<Result<void>> {
    try {
      storage.admin.notifications.set([]);
      return ok(undefined);
    } catch (error) {
      return err(unknownError("Failed to clear notifications", error));
    }
  },
};

