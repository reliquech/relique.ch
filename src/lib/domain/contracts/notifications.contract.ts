import type { Result } from "./result";
import type { ServiceError } from "./errors";

/**
 * Notifications Service Contract (Portal-only)
 */

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  timestamp: number;
  metadata?: unknown;
}

export interface INotificationsService {
  /**
   * Push a new notification
   */
  push(notification: Omit<Notification, "id" | "read" | "timestamp">): Promise<Result<Notification, ServiceError>>;

  /**
   * List all notifications
   */
  list(): Promise<Result<Notification[], ServiceError>>;

  /**
   * Mark notification as read
   */
  markRead(id: string): Promise<Result<void, ServiceError>>;

  /**
   * Mark all notifications as read
   */
  markAllRead(): Promise<Result<void, ServiceError>>;

  /**
   * Clear all notifications
   */
  clear(): Promise<Result<void, ServiceError>>;
}

