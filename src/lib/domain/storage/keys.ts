/**
 * Storage keys for domain data
 * All keys follow the pattern: relique.v1.{domain}.{resource}
 */

export const STORAGE_KEYS = {
  // Verify domain
  VERIFY_HISTORY: "relique.v1.verify.history",
  VERIFY_LAST_RESULT: "relique.v1.verify.lastResult",
  VERIFY_MAPPING: "relique.v1.verify.mapping",
  VERIFY_PINNED: "relique.v1.verify.pinned",
  
  // Marketplace domain
  MARKETPLACE_LISTINGS: "relique.v1.marketplace.listings",
  MARKETPLACE_FAVORITES: "relique.v1.marketplace.favorites",
  MARKETPLACE_SAVED_SEARCHES: "relique.v1.marketplace.savedSearches",
  
  // Consign domain
  CONSIGN_DRAFTS: "relique.v1.consign.drafts",
  CONSIGN_LAST_DRAFT_ID: "relique.v1.consign.lastDraftId",
  CONSIGN_SUBMISSIONS: "relique.v1.consign.submissions",
  
  // Content domain
  CONTENT_POSTS: "relique.v1.content.posts",
  CONTENT_EVENTS: "relique.v1.content.events",
  CONTENT_BOOKMARKS: "relique.v1.content.bookmarks",
  
  // Portal-only (shared keys for sync)
  PORTAL_VIEWS_SUBMISSIONS: "relique.v1.portal.views.submissions",
  PORTAL_SAVED_FILTERS_SUBMISSIONS: "relique.v1.portal.savedFilters.submissions",
  PORTAL_NOTIFICATIONS: "relique.v1.portal.notifications",
  PORTAL_ACTIVITY_LOG: "relique.v1.portal.activityLog",
} as const;

/**
 * Storage size limits (to prevent quota issues)
 */
export const STORAGE_LIMITS = {
  VERIFY_HISTORY: 100, // Max 100 verify history entries
  ACTIVITY_LOG: 200, // Max 200 activity log entries
  CONSIGN_DRAFTS: 10, // Max 10 drafts (LRU prune)
  SAVED_SEARCHES: 20, // Max 20 saved searches
} as const;

