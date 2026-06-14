"use client";

import * as React from "react";
import { cn } from "../cn";
import { Surface } from "../primitives/surface";

export type VerifyStatus = "qualified" | "inconclusive" | "disqualified";

export type TrustPanelProps = {
  status?: VerifyStatus;
  disclaimer?: React.ReactNode;
  className?: string;
};

const statusCopy: Record<VerifyStatus, { title: string; body: string }> = {
  qualified: {
    title: "Qualified",
    body: "Signals are consistent with authenticity. Confidence is high, but probabilistic.",
  },
  inconclusive: {
    title: "Inconclusive",
    body: "Signals are mixed. Further review or additional evidence may be required.",
  },
  disqualified: {
    title: "Disqualified",
    body: "Signals conflict with authenticity. Confidence is low for authenticity.",
  },
};

export function TrustPanel({ status, disclaimer, className }: TrustPanelProps) {
  return (
    <Surface className={cn("p-6", className)} tone="muted">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-h4">Trust & Verification</h3>
          {status ? (
            <span
              className={cn(
                "inline-flex items-center border px-2 py-1 text-xs font-medium rounded-none",
                status === "qualified"
                  ? "border-accent text-accent"
                  : status === "inconclusive"
                    ? "border-border text-foreground"
                    : "border-destructive text-destructive"
              )}
            >
              {statusCopy[status].title}
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {(["qualified", "inconclusive", "disqualified"] as const).map((s) => (
            <div
              key={s}
              className={cn(
                "border rounded-none p-4 bg-background",
                status === s ? "border-accent" : "border-border"
              )}
            >
              <div className="font-semibold">{statusCopy[s].title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{statusCopy[s].body}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 text-sm text-muted-foreground">
          {disclaimer ?? (
            <p>
              Relique results are probabilistic. Always review provenance, COA, and seller history.
            </p>
          )}
        </div>
      </div>
    </Surface>
  );
}


