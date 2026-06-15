const MAX_ERROR_LENGTH = 240;

const HTML_PREFIX = /^\s*<(!doctype|html\b)/i;
const CLOUDFLARE_TUNNEL = /cloudflare tunnel error/i;
const CLOUDFLARE_ERROR_CODE = /error[^0-9]*(\d{4})/i;
const TITLE_TAG = /<title[^>]*>([^<]+)<\/title>/i;

/**
 * Normalize upstream error text so API/client responses never embed full HTML pages.
 */
export function sanitizeErrorMessage(raw: string, maxLength = MAX_ERROR_LENGTH): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Unknown error";

  if (HTML_PREFIX.test(trimmed) || CLOUDFLARE_TUNNEL.test(trimmed)) {
    const titleMatch = TITLE_TAG.exec(trimmed);
    const title = titleMatch?.[1]?.trim();
    const codeMatch = CLOUDFLARE_ERROR_CODE.exec(trimmed);
    const code = codeMatch?.[1];
    const hostMatch =
      /\|\s*([a-z0-9.-]+\.[a-z]{2,})\s*\|/i.exec(title ?? trimmed) ??
      /host \(([a-z0-9.-]+\.[a-z]{2,})\)/i.exec(trimmed);

    if (CLOUDFLARE_TUNNEL.test(title ?? trimmed) || code === "1033") {
      const host = hostMatch?.[1]?.trim();
      const parts = ["Supabase unreachable: Cloudflare Tunnel error"];
      if (code) parts.push(code);
      if (host) parts.push(`(${host})`);
      return (
        `${parts.join(" ")}. ` +
        "Ensure cloudflared is running or set NEXT_PUBLIC_SUPABASE_URL to your project's https://<ref>.supabase.co URL."
      );
    }

    return (
      "Supabase returned an HTML error page instead of JSON. " +
      "Check NEXT_PUBLIC_SUPABASE_URL and that your Supabase instance is reachable."
    );
  }

  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

/**
 * Parse a failed fetch Response into a concise Error (JSON, text, or status fallback).
 */
export async function parseFetchError(
  response: Response,
  prefix: string
): Promise<never> {
  const contentType = response.headers.get("content-type") ?? "";
  let message = response.statusText || `HTTP ${response.status}`;

  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as { error?: string; details?: string };
      if (data.error) {
        message = data.error;
        if (data.details) {
          message = `${message}: ${sanitizeErrorMessage(data.details)}`;
        }
      }
    } catch {
      // fall through to statusText
    }
  } else {
    try {
      const text = await response.text();
      if (text) message = sanitizeErrorMessage(text);
    } catch {
      // keep statusText
    }
  }

  throw new Error(`${prefix}: ${sanitizeErrorMessage(message)}`);
}
