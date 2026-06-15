"use client";

import { CheckCircle2, CloudOff, Loader2, Save, Send, XCircle } from "lucide-react";
import type { AutosaveState } from "@/features/marketplace/hooks/useMarketplaceAutosave";

interface MarketplaceEditorStatusRailProps {
  autosaveState: AutosaveState;
  lastSavedAt?: Date | null;
  online: boolean;
  isUploading: boolean;
  isSubmitting: boolean;
  canPublish: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onCancel: () => void;
}

function labelFor(state: AutosaveState, online: boolean) {
  if (!online || state === "offline") return { label: "Offline", icon: CloudOff };
  if (state === "saving") return { label: "Saving", icon: Loader2 };
  if (state === "failed") return { label: "Save failed", icon: XCircle };
  if (state === "saved") return { label: "Saved", icon: CheckCircle2 };
  if (state === "dirty") return { label: "Unsaved", icon: Save };
  return { label: "Saved", icon: CheckCircle2 };
}

export function MarketplaceEditorStatusRail({
  autosaveState,
  lastSavedAt,
  online,
  isUploading,
  isSubmitting,
  canPublish,
  onSaveDraft,
  onPublish,
  onCancel,
}: MarketplaceEditorStatusRailProps) {
  const status = labelFor(autosaveState, online);
  const StatusIcon = status.icon;
  const disabled = !online || isUploading || isSubmitting;

  return (
    <aside className="sticky bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur lg:top-24 lg:bottom-auto lg:rounded-lg lg:border">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <StatusIcon className={`h-4 w-4 ${autosaveState === "saving" ? "animate-spin" : ""}`} />
          <span>{status.label}</span>
        </div>
        {lastSavedAt ? (
          <p className="text-xs text-gray-500" suppressHydrationWarning>
            Last saved {lastSavedAt.toLocaleTimeString()}
          </p>
        ) : null}
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={disabled}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Draft
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={disabled || !canPublish}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Publish
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] rounded-lg px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </aside>
  );
}

