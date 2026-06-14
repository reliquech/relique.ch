/**
 * Service implementations (adapters) for portal app
 * These implement contracts from @relique/shared/domain using localStorage
 */

export { verifyServiceLocal as verifyService } from "./verify.local";
export { consignServiceLocal as consignService } from "./consign.local";
export { marketplaceServiceLocal as marketplaceService } from "./marketplace.local";
export { activityServiceLocal as activityService } from "./activity.local";
export { notificationsServiceLocal as notificationsService } from "./notifications.local";

