"use client";

import type { MarketplaceItem } from "@/lib/types/admin";
import { MarketplaceItemsGridCard } from "./MarketplaceItemsGridCard";

type RowActionHandlers = {
  onEdit: (item: MarketplaceItem) => void;
  onPreview: (item: MarketplaceItem) => void;
  onDuplicate: (item: MarketplaceItem) => void;
  onPublish: (item: MarketplaceItem) => void;
  onUnpublish: (item: MarketplaceItem) => void;
  onArchive: (item: MarketplaceItem) => void;
  onRestore: (item: MarketplaceItem) => void;
  onDelete: (item: MarketplaceItem) => void;
};

interface MarketplaceItemsGridProps {
  items: MarketplaceItem[];
  selectedIds: string[];
  canEdit: boolean;
  onToggleOne: (id: string, checked: boolean) => void;
  onRowClick: (id: string) => void;
  onRowAction: RowActionHandlers;
}

export function MarketplaceItemsGrid({
  items,
  selectedIds,
  canEdit,
  onToggleOne,
  onRowClick,
  onRowAction,
}: MarketplaceItemsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => (
        <MarketplaceItemsGridCard
          key={item.id}
          item={item}
          selected={selectedIds.includes(item.id)}
          canEdit={canEdit}
          onToggle={onToggleOne}
          onOpen={onRowClick}
          onRowAction={onRowAction}
        />
      ))}
    </div>
  );
}
