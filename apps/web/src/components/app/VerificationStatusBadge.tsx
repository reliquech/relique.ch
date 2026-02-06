"use client";

/** Verification status badge (relique-marketplace style). Maps qualified/inconclusive/disqualified to colors. */
const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  qualified: { text: "#22C55E", bg: "rgba(34, 197, 94, 0.1)" },
  inconclusive: { text: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
  disqualified: { text: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
};

interface VerificationStatusBadgeProps {
  status?: string | null;
}

export function VerificationStatusBadge({ status }: VerificationStatusBadgeProps) {
  const key = (status ?? "inconclusive").toLowerCase();
  const colors = STATUS_COLORS[key] ?? STATUS_COLORS.inconclusive;
  const label = status ? status.toUpperCase() : "INCONCLUSIVE";

  return (
    <span
      className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.3em] inline-block border border-white/10"
      style={{ color: colors.text, backgroundColor: colors.bg }}
    >
      {label}
    </span>
  );
}
