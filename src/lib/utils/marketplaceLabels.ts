/** Human-readable labels for marketplace enum / option values on public surfaces. */

export function humanizeToken(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatOptionLabel(
  option?: { id: string; custom?: string | null } | null
): string | undefined {
  if (!option) return undefined;
  const custom = option.custom?.trim();
  if (custom) return custom;
  if (!option.id || option.id === "unknown") return undefined;
  return humanizeToken(option.id);
}

export function formatSizeLabel(
  size?: { id: string; region: string; custom?: string | null } | null
): string | undefined {
  if (!size) return undefined;
  const custom = size.custom?.trim();
  if (custom) return custom;
  if (!size.id || size.id === "unknown") return undefined;
  const region = size.region?.trim();
  return region ? `${size.id} (${region})` : size.id;
}

const EMPTY_UUID = "00000000-0000-0000-0000-000000000000";

export function isMeaningfulDetailValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "unknown" || trimmed === EMPTY_UUID) return false;
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
