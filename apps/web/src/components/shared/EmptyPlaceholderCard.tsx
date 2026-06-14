"use client";

import React from "react";
import { Plus } from "lucide-react";

interface EmptyPlaceholderCardProps {
  ctaLabel: string;
  onCtaClick?: () => void;
}

/**
 * Shared empty state for admin placeholder pages. CTA can open form when onCtaClick provided.
 */
export function EmptyPlaceholderCard({ ctaLabel, onCtaClick }: EmptyPlaceholderCardProps) {
  return (
    <div className="border border-border bg-surface rounded-2xl p-12 text-center">
      <p className="text-muted-foreground mb-2">No data yet</p>
      <p className="text-sm text-gray-500 mb-6">Connect data source when ready.</p>
      <button
        type="button"
        onClick={onCtaClick}
        className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 shadow-lg shadow-accent/20 transition-transform hover:scale-105"
      >
        <Plus className="w-4 h-4" />
        {ctaLabel}
      </button>
    </div>
  );
}
