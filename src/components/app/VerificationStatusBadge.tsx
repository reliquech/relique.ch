"use client";

const DEFAULT_COLORS = { text: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" } as const;

/** Verification status badge (relique-marketplace style). Maps auth.status values to colors. */
const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  verified: { text: "#22C55E", bg: "rgba(34, 197, 94, 0.1)" },
  pending: { text: DEFAULT_COLORS.text, bg: DEFAULT_COLORS.bg },
  rejected: { text: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  none: { text: DEFAULT_COLORS.text, bg: DEFAULT_COLORS.bg },
};

interface VerificationStatusBadgeProps {
  status?: string | null;
}

export function VerificationStatusBadge({ status }: VerificationStatusBadgeProps) {
  const key = (status ?? "none").toLowerCase();
  const colors: { text: string; bg: string } = STATUS_COLORS[key] ?? DEFAULT_COLORS;
  const label = status ? status.toUpperCase() : "NONE";

  return (
    <span
      className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.3em] inline-block border border-white/10"
      style={{ color: colors.text, backgroundColor: colors.bg }}
    >
      {label}
    </span>
  );
}
