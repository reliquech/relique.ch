/**
 * Verify utility functions
 * Reusable helpers for verify components
 */

/**
 * Format date for display
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Get formatted status label
 */
export function getStatusLabel(status?: string): string {
  if (!status) return "QUALIFIED";
  return status.toUpperCase();
}

/**
 * Get status color classes
 */
export function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case "qualified":
      return "bg-green-400/10 text-green-400";
    case "inconclusive":
      return "bg-amber-400/10 text-amber-400";
    case "disqualified":
      return "bg-red-400/10 text-red-400";
    default:
      return "bg-green-400/10 text-green-400";
  }
}

/**
 * Status definition type
 */
export interface StatusDefinition {
  icon: string;
  color: string;
  title: string;
  description: string;
}

/**
 * Status definitions data
 */
export const STATUS_DEFINITIONS: StatusDefinition[] = [
  {
    icon: "✓",
    color: "text-green-400",
    title: "QUALIFIED",
    description: "A status of \"Qualified\" indicates very strong alignment between the present autograph and available references.",
  },
  {
    icon: "✗",
    color: "text-red-400",
    title: "DISQUALIFIED",
    description: "A status of \"Disqualified\" indicates significant inconsistencies compared to known references.",
  },
  {
    icon: "◈",
    color: "text-amber-400",
    title: "INCONCLUSIVE",
    description: "A status of \"Inconclusive\" indicates data is insufficient to reach a reliable conclusion.",
  },
];
