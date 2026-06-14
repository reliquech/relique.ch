import { storage } from "@/lib/storage";
import { verifyService } from "./verifyService";
import { consignService } from "./consignService";
import { marketplaceService } from "./marketplaceService";
import { activityService } from "./activityService";

export type AlertRule = {
  id: string;
  name: string;
  condition: {
    type: "disqualified" | "draft_stale" | "saved_items_count";
    params?: Record<string, unknown>;
  };
  action: {
    type: "create_notification";
    params?: Record<string, unknown>;
  };
  enabled: boolean;
};

const STALE_DAYS = 7;

async function checkRule(rule: AlertRule): Promise<void> {
    switch (rule.condition.type) {
      case "disqualified":
        const history = await verifyService.history.list();
        const disqualified = history.filter((h) => h.result === "disqualified");
        if (disqualified.length > 0) {
          createNotification(
            "verify_flagged",
            `Found ${disqualified.length} disqualified verification(s)`,
            { count: disqualified.length }
          );
        }
        break;

      case "draft_stale":
        const drafts = await consignService.drafts.list();
        const now = Date.now();
        const staleThreshold = now - STALE_DAYS * 24 * 60 * 60 * 1000;
        const staleDrafts = drafts.filter((d) => d.timestamp < staleThreshold);
        if (staleDrafts.length > 0) {
          createNotification(
            "draft_reminder",
            `You have ${staleDrafts.length} draft(s) that haven't been updated in ${STALE_DAYS} days`,
            { count: staleDrafts.length }
          );
        }
        break;

      case "saved_items_count":
        const favorites = await marketplaceService.getFavorites();
        const threshold = (rule.condition.params?.threshold as number) || 10;
        if (favorites.length >= threshold) {
          createNotification(
            "suggestion",
            `You have ${favorites.length} saved items. Consider creating a collection to organize them.`,
            { count: favorites.length }
          );
        }
        break;
    }
}

export const alertService = {
  async checkRules(): Promise<void> {
    const rules = storage.admin.alertRules.get() as AlertRule[];
    const enabledRules = rules.filter((r) => r.enabled);

    for (const rule of enabledRules) {
      await checkRule(rule);
    }
  },

  async checkRule(rule: AlertRule): Promise<void> {
    return checkRule(rule);
  },
};

function createNotification(
  type: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  const notifications = storage.admin.notifications.get();
  const notification = {
    id: `notif-${Date.now()}-${Math.random()}`,
    type,
    message,
    read: false,
    timestamp: Date.now(),
    ...metadata,
  };
  const updated = [...notifications, notification].slice(-100);
  storage.admin.notifications.set(updated);
  activityService.log("export_done" as const, `Notification created: ${message}`, { type, metadata });
}

