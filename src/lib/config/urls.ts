/**
 * Shared URL configuration for deep links between web and admin apps
 */

export const WEB_BASE_URL = "http://localhost:3000";

export const ADMIN_BASE_URL = "http://localhost:3001";

/**
 * Get full web URL for a path
 */
export function getWebUrl(path: string = ""): string {
  const base = WEB_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Get full admin URL for a path
 */
export function getAdminUrl(path: string = ""): string {
  const base = ADMIN_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use getAdminUrl instead
 */
export const getPortalUrl = getAdminUrl;

/**
 * Create deep link from admin to web
 */
export function createDeepLink(
  type: "verify" | "consign" | "marketplace",
  params: Record<string, string | number | undefined>
): string {
  switch (type) {
    case "verify": {
      const code = params.code || params.productId;
      if (!code) throw new Error("verify deep link requires code or productId");
      return getWebUrl(`/verify?code=${encodeURIComponent(String(code))}`);
    }
    case "consign": {
      const draftId = params.draftId;
      if (draftId) {
        return getWebUrl(`/consign?draftId=${encodeURIComponent(String(draftId))}`);
      }
      return getWebUrl("/consign");
    }
    case "marketplace": {
      const slug = params.slug;
      if (!slug) throw new Error("marketplace deep link requires slug");
      return getWebUrl(`/marketplace/${encodeURIComponent(String(slug))}`);
    }
    default:
      throw new Error(`Unknown deep link type: ${type}`);
  }
}

