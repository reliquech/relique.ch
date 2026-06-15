"use client";

import type { MarketplaceItem } from "@/lib/types/admin";

interface MarketplaceItemsBulkBarProps {
  selectedItems: MarketplaceItem[];
  onPublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

function selectionLifecycleState(items: MarketplaceItem[]) {
  const statuses = new Set(items.map((i) => i.status));
  if (statuses.size !== 1) return "mixed" as const;
  return items[0]?.status ?? "mixed";
}

export function MarketplaceItemsBulkBar({
  selectedItems,
  onPublish,
  onArchive,
  onRestore,
  onDelete,
}: MarketplaceItemsBulkBarProps) {
  const count = selectedItems.length;
  if (count === 0) return null;

  const lifecycle = selectionLifecycleState(selectedItems);
  const mixed = lifecycle === "mixed";

  return (
    <div
      className="sticky top-0 z-20 bg-surface border border-border rounded-lg px-4 py-3 shadow-lg flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 duration-200 motion-reduce:animate-none"
      aria-live="polite"
    >
      <span className="text-sm font-semibold text-white">{count} selected</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={mixed || lifecycle !== "draft"}
          title={mixed ? "Select items with the same status" : undefined}
          onClick={onPublish}
          className="bg-white/5 border border-border text-gray-300 px-3 py-2 rounded-lg text-xs hover:text-white disabled:opacity-40 min-h-[32px]"
        >
          Publish
        </button>
        <button
          type="button"
          disabled={mixed || lifecycle !== "published"}
          title={mixed ? "Select items with the same status" : undefined}
          onClick={onArchive}
          className="bg-white/5 border border-border text-gray-300 px-3 py-2 rounded-lg text-xs hover:text-white disabled:opacity-40 min-h-[32px]"
        >
          Archive
        </button>
        <button
          type="button"
          disabled={mixed || lifecycle !== "archived"}
          title={mixed ? "Select items with the same status" : undefined}
          onClick={onRestore}
          className="bg-white/5 border border-border text-gray-300 px-3 py-2 rounded-lg text-xs hover:text-white disabled:opacity-40 min-h-[32px]"
        >
          Restore to draft
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs font-bold min-h-[32px]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
