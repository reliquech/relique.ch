import { sanitizeErrorMessage } from "@/lib/api/errorMessage";

/**
 * Format a Supabase/PostgREST error for JSON API responses.
 * Upstream HTML (e.g. Cloudflare tunnel pages) is collapsed to a short actionable message.
 */
export function formatSupabaseError(error: { message: string }): string {
  return sanitizeErrorMessage(error.message);
}
