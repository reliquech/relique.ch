import type { Result } from "./result";
import type { ServiceError } from "./errors";

/**
 * Activity Service Contract (Portal-only)
 */

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  metadata?: unknown;
}

export interface IActivityService {
  /**
   * Track an activity event
   */
  track(event: Omit<ActivityEvent, "id" | "timestamp">): Promise<Result<void, ServiceError>>;

  /**
   * List activity events
   */
  list(): Promise<Result<ActivityEvent[], ServiceError>>;

  /**
   * Clear activity log
   */
  clear(): Promise<Result<void, ServiceError>>;
}

