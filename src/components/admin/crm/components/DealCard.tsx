"use client";

import React from "react";
import type { Deal } from "@/lib/types/admin";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`p-3 rounded-lg border border-border bg-surface hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors text-left ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div className="font-semibold text-white truncate">{deal.title}</div>
      <div className="text-sm text-gray-400 mt-1">
        {deal.value != null ? `${deal.currency ?? "USD"} ${Number(deal.value).toLocaleString()}` : "—"}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {deal.probability != null ? `${deal.probability}%` : "—"}
        {deal.expected_close_date && ` · ${new Date(deal.expected_close_date).toLocaleDateString()}`}
      </div>
    </div>
  );
}
