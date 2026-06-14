import type { z } from "zod";

export interface Session {
  userEmail: string;
  userName: string;
  loginMethod: "email" | "magic-link" | "social";
  createdAt: string;
}

export interface MockSession {
  displayName: string;
  createdAt: number;
}

export interface VerifyHistoryEntry {
  productId: string;
  result: "qualified" | "inconclusive" | "disqualified";
  timestamp: number;
}

const STORAGE_KEYS = {
  SESSION: "relique.v1.session",
  SESSION_MOCK: "relique.v1.session.mock",
  THEME: "relique.v1.theme",
  MARKETPLACE_LISTINGS: "relique.v1.marketplace.listings",
  MARKETPLACE_FAVORITES: "relique.v1.marketplace.favorites",
  VERIFY_HISTORY: "relique.v1.verify.history",
  CONSIGN_DRAFTS: "relique.v1.consign.drafts",
  CONSIGN_SUBMISSIONS: "relique.v1.consign.submissions",
  CONTENT_POSTS: "relique.v1.content.posts",
  CONTENT_EVENTS: "relique.v1.content.events",
  ADMIN_VIEWS_COLUMNS: "relique.v1.admin.views.submissions.columns",
  ADMIN_VIEWS_SAVED: "relique.v1.admin.views.submissions.saved",
  ADMIN_RECENT_SEARCHES: "relique.v1.admin.recentSearches.submissions",
  ADMIN_SAVED_FILTERS: "relique.v1.admin.savedFilters.submissions",
  ADMIN_NOTIFICATIONS: "relique.v1.admin.notifications",
  ADMIN_ALERT_RULES: "relique.v1.admin.alertRules",
  ADMIN_ACTIVITY_LOG: "relique.v1.admin.activityLog",
} as const;

// Legacy keys for migration
const LEGACY_KEYS = {
  SESSION: "relique_session",
  THEME: "relique_theme",
  MARKETPLACE_LISTINGS: "relique_marketplace_listings",
  MARKETPLACE_FAVORITES: "relique_favorites",
  VERIFY_HISTORY: "relique_verifyHistory",
  CONSIGN_DRAFTS: "relique_uploadsDraft",
  CONSIGN_SUBMISSIONS: "relique_consign_submissions",
  CONTENT_POSTS: "relique_posts",
  CONTENT_EVENTS: "relique_events",
} as const;

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch {
    // Invalid JSON, return default
  }
  return defaultValue;
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error);
  }
}

function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

function getItemWithSchema<T>(
  key: string,
  schema: z.ZodSchema<T>,
  defaultValue: T
): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      const result = schema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
      console.warn(`Invalid data format for key "${key}", using default`);
    }
  } catch {
    // Invalid JSON or parse error
  }
  return defaultValue;
}

function setItemWithSchema<T>(key: string, value: T, schema: z.ZodSchema<T>): void {
  const result = schema.safeParse(value);
  if (!result.success) {
    console.error(`Invalid data format for key "${key}":`, result.error);
    return;
  }
  setItem(key, result.data);
}

function migrateKey(legacyKey: string, newKey: string): void {
  if (typeof window === "undefined") return;
  try {
    const legacyData = localStorage.getItem(legacyKey);
    if (legacyData) {
      const newData = localStorage.getItem(newKey);
      if (!newData) {
        // Only migrate if new key doesn't exist
        localStorage.setItem(newKey, legacyData);
      }
      // Remove legacy key after migration
      localStorage.removeItem(legacyKey);
    }
  } catch {
    // Ignore migration errors
  }
}

export function migrateStorageKeys(): void {
  if (typeof window === "undefined") return;
  migrateKey(LEGACY_KEYS.SESSION, STORAGE_KEYS.SESSION);
  migrateKey(LEGACY_KEYS.THEME, STORAGE_KEYS.THEME);
  migrateKey(LEGACY_KEYS.MARKETPLACE_LISTINGS, STORAGE_KEYS.MARKETPLACE_LISTINGS);
  migrateKey(LEGACY_KEYS.MARKETPLACE_FAVORITES, STORAGE_KEYS.MARKETPLACE_FAVORITES);
  migrateKey(LEGACY_KEYS.VERIFY_HISTORY, STORAGE_KEYS.VERIFY_HISTORY);
  migrateKey(LEGACY_KEYS.CONSIGN_DRAFTS, STORAGE_KEYS.CONSIGN_DRAFTS);
  migrateKey(LEGACY_KEYS.CONSIGN_SUBMISSIONS, STORAGE_KEYS.CONSIGN_SUBMISSIONS);
  migrateKey(LEGACY_KEYS.CONTENT_POSTS, STORAGE_KEYS.CONTENT_POSTS);
  migrateKey(LEGACY_KEYS.CONTENT_EVENTS, STORAGE_KEYS.CONTENT_EVENTS);
}

export const storage = {
  session: {
    get: (): Session | null => {
      return getItem<Session | null>(STORAGE_KEYS.SESSION, null);
    },
    set: (session: Session): void => {
      setItem(STORAGE_KEYS.SESSION, session);
    },
    remove: (): void => {
      removeItem(STORAGE_KEYS.SESSION);
    },
  },
  theme: {
    get: (): "light" | "dark" => {
      const theme = getItem<string>(STORAGE_KEYS.THEME, "light");
      return theme === "dark" ? "dark" : "light";
    },
    set: (theme: "light" | "dark"): void => {
      setItem(STORAGE_KEYS.THEME, theme);
    },
  },
  marketplace: {
    listings: {
      get: <T = unknown>(): T[] => {
        return getItem<T[]>(STORAGE_KEYS.MARKETPLACE_LISTINGS, []);
      },
      set: <T>(listings: T[]): void => {
        setItem(STORAGE_KEYS.MARKETPLACE_LISTINGS, listings);
      },
    },
    favorites: {
      get: (): string[] => {
        return getItem<string[]>(STORAGE_KEYS.MARKETPLACE_FAVORITES, []);
      },
      set: (favorites: string[]): void => {
        setItem(STORAGE_KEYS.MARKETPLACE_FAVORITES, favorites);
      },
      add: (id: string): void => {
        const favorites = storage.marketplace.favorites.get();
        if (!favorites.includes(id)) {
          storage.marketplace.favorites.set([...favorites, id]);
        }
      },
      remove: (id: string): void => {
        const favorites = storage.marketplace.favorites.get();
        storage.marketplace.favorites.set(favorites.filter((f) => f !== id));
      },
      toggle: (id: string): void => {
        const favorites = storage.marketplace.favorites.get();
        if (favorites.includes(id)) {
          storage.marketplace.favorites.remove(id);
        } else {
          storage.marketplace.favorites.add(id);
        }
      },
    },
  },
  verifyHistory: {
    get: (): VerifyHistoryEntry[] => {
      return getItem<VerifyHistoryEntry[]>(STORAGE_KEYS.VERIFY_HISTORY, []);
    },
    set: (history: VerifyHistoryEntry[]): void => {
      setItem(STORAGE_KEYS.VERIFY_HISTORY, history);
    },
    add: (entry: VerifyHistoryEntry): void => {
      const history = storage.verifyHistory.get();
      const exists = history.some((h) => h.productId === entry.productId);
      if (exists) {
        const updated = history.map((h) =>
          h.productId === entry.productId ? entry : h
        );
        storage.verifyHistory.set(updated);
      } else {
        storage.verifyHistory.set([...history, entry]);
      }
    },
    clear: (): void => {
      removeItem(STORAGE_KEYS.VERIFY_HISTORY);
    },
  },
  consign: {
    drafts: {
      get: <T = unknown>(): T | null => {
        return getItem<T | null>(STORAGE_KEYS.CONSIGN_DRAFTS, null);
      },
      set: <T>(draft: T | null): void => {
        setItem(STORAGE_KEYS.CONSIGN_DRAFTS, draft);
      },
    },
    submissions: {
      get: <T = unknown>(): T[] => {
        return getItem<T[]>(STORAGE_KEYS.CONSIGN_SUBMISSIONS, []);
      },
      set: <T>(submissions: T[]): void => {
        setItem(STORAGE_KEYS.CONSIGN_SUBMISSIONS, submissions);
      },
    },
  },
  content: {
    posts: {
      get: <T = unknown>(): T[] => {
        return getItem<T[]>(STORAGE_KEYS.CONTENT_POSTS, []);
      },
      set: <T>(posts: T[]): void => {
        setItem(STORAGE_KEYS.CONTENT_POSTS, posts);
      },
    },
    events: {
      get: <T = unknown>(): T[] => {
        return getItem<T[]>(STORAGE_KEYS.CONTENT_EVENTS, []);
      },
      set: <T>(events: T[]): void => {
        setItem(STORAGE_KEYS.CONTENT_EVENTS, events);
      },
    },
  },
  sessionMock: {
    get: (): MockSession | null => {
      return getItem<MockSession | null>(STORAGE_KEYS.SESSION_MOCK, null);
    },
    set: (session: MockSession): void => {
      setItem(STORAGE_KEYS.SESSION_MOCK, session);
    },
    remove: (): void => {
      removeItem(STORAGE_KEYS.SESSION_MOCK);
    },
  },
  admin: {
    views: {
      columns: {
        get: (): Record<string, boolean> => {
          return getItem<Record<string, boolean>>(STORAGE_KEYS.ADMIN_VIEWS_COLUMNS, {});
        },
        set: (columns: Record<string, boolean>): void => {
          setItem(STORAGE_KEYS.ADMIN_VIEWS_COLUMNS, columns);
        },
      },
      saved: {
        get: (): Array<{ id: string; name: string; filters?: unknown; sort?: unknown; columnVisibility?: Record<string, boolean>; pageSize?: number; createdAt: number }> => {
          return getItem(STORAGE_KEYS.ADMIN_VIEWS_SAVED, []);
        },
        set: (views: Array<{ id: string; name: string; filters?: unknown; sort?: unknown; columnVisibility?: Record<string, boolean>; pageSize?: number; createdAt: number }>): void => {
          setItem(STORAGE_KEYS.ADMIN_VIEWS_SAVED, views);
        },
      },
    },
    recentSearches: {
      get: (): string[] => {
        return getItem<string[]>(STORAGE_KEYS.ADMIN_RECENT_SEARCHES, []);
      },
      set: (searches: string[]): void => {
        setItem(STORAGE_KEYS.ADMIN_RECENT_SEARCHES, searches);
      },
    },
    savedFilters: {
      get: (): Array<{ id: string; name: string; query?: string; filters?: unknown; createdAt: number }> => {
        return getItem(STORAGE_KEYS.ADMIN_SAVED_FILTERS, []);
      },
      set: (filters: Array<{ id: string; name: string; query?: string; filters?: unknown; createdAt: number }>): void => {
        setItem(STORAGE_KEYS.ADMIN_SAVED_FILTERS, filters);
      },
    },
    notifications: {
      get: (): Array<{ id: string; type: string; message: string; read: boolean; timestamp: number }> => {
        return getItem(STORAGE_KEYS.ADMIN_NOTIFICATIONS, []);
      },
      set: (notifications: Array<{ id: string; type: string; message: string; read: boolean; timestamp: number }>): void => {
        setItem(STORAGE_KEYS.ADMIN_NOTIFICATIONS, notifications);
      },
    },
    alertRules: {
      get: (): Array<{ id: string; name: string; condition: unknown; action: unknown; enabled: boolean }> => {
        return getItem(STORAGE_KEYS.ADMIN_ALERT_RULES, []);
      },
      set: (rules: Array<{ id: string; name: string; condition: unknown; action: unknown; enabled: boolean }>): void => {
        setItem(STORAGE_KEYS.ADMIN_ALERT_RULES, rules);
      },
    },
    activityLog: {
      get: (): Array<{ id: string; type: string; message: string; timestamp: number; metadata?: unknown }> => {
        return getItem(STORAGE_KEYS.ADMIN_ACTIVITY_LOG, []);
      },
      set: (log: Array<{ id: string; type: string; message: string; timestamp: number; metadata?: unknown }>): void => {
        setItem(STORAGE_KEYS.ADMIN_ACTIVITY_LOG, log);
      },
    },
  },
  // Helper with schema validation
  withSchema: {
    get: <T>(key: string, schema: z.ZodSchema<T>, defaultValue: T): T => {
      return getItemWithSchema(key, schema, defaultValue);
    },
    set: <T>(key: string, value: T, schema: z.ZodSchema<T>): void => {
      setItemWithSchema(key, value, schema);
    },
  },
  // Clear all storage (for reset/demo)
  clearAll: (): void => {
    if (typeof window === "undefined") return;
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};

// Auto-migrate on import (only in browser)
if (typeof window !== "undefined") {
  migrateStorageKeys();
}
