"use client";

import { ImageIcon, Star } from "lucide-react";
import { RemoteImage } from "@/components/shared/RemoteImage";
import type { MarketplaceItem } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import { MarketplaceItemRowMenu } from "./MarketplaceItemRowMenu";

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

interface MarketplaceItemsGridCardProps {
  item: MarketplaceItem;
  selected: boolean;
  canEdit: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onOpen: (id: string) => void;
  onRowAction: RowActionHandlers;
}

export function MarketplaceItemsGridCard({
  item,
  selected,
  canEdit,
  onToggle,
  onOpen,
  onRowAction,
}: MarketplaceItemsGridCardProps) {
  const isHttp = item.cover_image_url?.startsWith("http");

  return (
    <article
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(item.id);
      }}
      className={`group cursor-pointer overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        selected ? "bg-primary/10 ring-1 ring-primary/30" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-white/5">
        {isHttp && item.cover_image_url ? (
          <RemoteImage
            src={item.cover_image_url}
            alt=""
            width={480}
            height={360}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-600" aria-hidden>
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <div className="absolute left-3 top-3" onClick={(event) => event.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onToggle(item.id, event.target.checked)}
            className="h-4 w-4"
            aria-label={`Select ${item.title}`}
          />
        </div>
        {item.is_featured ? (
          <div className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-accent">
            <Star className="h-4 w-4 fill-accent" aria-label="Featured" />
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-bold text-white" title={item.title}>
              {item.title}
            </h3>
            <p className="mt-1 truncate text-sm text-gray-400" title={item.athlete}>
              {item.athlete}
            </p>
          </div>
          {canEdit ? (
            <div onClick={(event) => event.stopPropagation()}>
              <MarketplaceItemRowMenu
                item={item}
                canPreview={Boolean(item.slug)}
                canMutate={canEdit}
                onEdit={() => onRowAction.onEdit(item)}
                onPreview={() => onRowAction.onPreview(item)}
                onDuplicate={() => onRowAction.onDuplicate(item)}
                onPublish={() => onRowAction.onPublish(item)}
                onUnpublish={() => onRowAction.onUnpublish(item)}
                onArchive={() => onRowAction.onArchive(item)}
                onRestore={() => onRowAction.onRestore(item)}
                onDelete={() => onRowAction.onDelete(item)}
              />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          {getStatusPill(item.status)}
          <span className="font-mono text-sm font-bold text-gray-300">
            ${item.price_usd.toLocaleString()}
          </span>
        </div>

        <p className="text-xs text-gray-500" suppressHydrationWarning>
          Updated {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "—"}
        </p>
      </div>
    </article>
  );
}
