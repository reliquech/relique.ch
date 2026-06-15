"use client";

import { useEffect, useRef } from "react";
import { Star, ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import { RemoteImage } from "@/components/shared/RemoteImage";
import type { MarketplaceItem } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import type {
  MarketplaceItemsDensity,
  MarketplaceItemsOrder,
  MarketplaceItemsSort,
} from "@/features/marketplace/types/itemsList";
import { MarketplaceItemRowMenu } from "./MarketplaceItemRowMenu";

function SortHeader({
  label,
  column,
  sort,
  order,
  onSort,
}: {
  label: string;
  column: MarketplaceItemsSort;
  sort: MarketplaceItemsSort;
  order: MarketplaceItemsOrder;
  onSort: (column: MarketplaceItemsSort) => void;
}) {
  const active = sort === column;
  const ariaSort = active ? (order === "asc" ? "ascending" : "descending") : "none";

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-white min-h-[24px]"
      aria-sort={ariaSort}
    >
      {label}
      {active ? (
        order === "asc" ? (
          <ChevronUp className="w-3 h-3" aria-hidden />
        ) : (
          <ChevronDown className="w-3 h-3" aria-hidden />
        )
      ) : null}
    </button>
  );
}

function Thumbnail({ url, title }: { url?: string; title: string }) {
  const isHttp = url?.startsWith("http");
  if (isHttp && url) {
    return (
      <RemoteImage
        src={url}
        alt=""
        width={40}
        height={40}
        className="rounded object-cover w-10 h-10"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-gray-600" aria-hidden>
      <ImageIcon className="w-4 h-4" />
      <span className="sr-only">No image for {title}</span>
    </div>
  );
}

interface MarketplaceItemsTableProps {
  items: MarketplaceItem[];
  density: MarketplaceItemsDensity;
  sort: MarketplaceItemsSort;
  order: MarketplaceItemsOrder;
  selectedIds: string[];
  canEdit?: boolean;
  onSort: (column: MarketplaceItemsSort) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: string, checked: boolean) => void;
  onRowClick: (id: string) => void;
  onRowAction: {
    onEdit: (item: MarketplaceItem) => void;
    onPreview: (item: MarketplaceItem) => void;
    onDuplicate: (item: MarketplaceItem) => void;
    onPublish: (item: MarketplaceItem) => void;
    onUnpublish: (item: MarketplaceItem) => void;
    onArchive: (item: MarketplaceItem) => void;
    onRestore: (item: MarketplaceItem) => void;
    onDelete: (item: MarketplaceItem) => void;
  };
}

export function MarketplaceItemsTable({
  items,
  density,
  sort,
  order,
  selectedIds,
  canEdit = true,
  onSort,
  onToggleAll,
  onToggleOne,
  onRowClick,
  onRowAction,
}: MarketplaceItemsTableProps) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;
  const cellPy = density === "compact" ? "py-2" : "py-3";

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected, selectedIds]);

  return (
    <div className="w-full overflow-x-auto bg-surface border border-border rounded-xl shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-surface border-b border-border shadow-[0_1px_0_0_hsl(var(--border))]">
          <tr>
            <th scope="col" className="w-10 px-4 py-4">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleAll(e.target.checked)}
                className="h-4 w-4"
                aria-label="Select all items on this page"
              />
            </th>
            <th scope="col" className="w-12 px-2 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <span className="sr-only">Thumbnail</span>
            </th>
            <th scope="col" className="px-4 py-4">
              <SortHeader label="Title" column="title" sort={sort} order={order} onSort={onSort} />
            </th>
            <th scope="col" className="px-4 py-4 hidden md:table-cell text-xs font-semibold uppercase tracking-wide text-gray-400">
              Athlete
            </th>
            <th scope="col" className="px-4 py-4">Status</th>
            <th scope="col" className="px-4 py-4 w-16">Featured</th>
            <th scope="col" className="px-4 py-4">
              <SortHeader label="Price" column="price_usd" sort={sort} order={order} onSort={onSort} />
            </th>
            <th scope="col" className="px-4 py-4 hidden lg:table-cell">
              <SortHeader label="Updated" column="updated_at" sort={sort} order={order} onSort={onSort} />
            </th>
            <th scope="col" className="w-12 px-2 py-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <tr
                key={item.id}
                tabIndex={0}
                onClick={() => onRowClick(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onRowClick(item.id);
                }}
                className={`cursor-pointer transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                  selected ? "bg-primary/10 ring-1 ring-primary/30" : ""
                }`}
              >
                <td className={`px-4 ${cellPy}`} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => onToggleOne(item.id, e.target.checked)}
                    className="h-4 w-4"
                    aria-label={`Select ${item.title}`}
                  />
                </td>
                <td className={`px-2 ${cellPy}`}>
                  <Thumbnail url={item.cover_image_url} title={item.title} />
                </td>
                <td className={`px-4 ${cellPy} max-w-[240px]`}>
                  <span className="text-sm font-semibold text-white truncate block" title={item.title}>
                    {item.title}
                  </span>
                </td>
                <td className={`px-4 ${cellPy} hidden md:table-cell max-w-[140px]`}>
                  <span className="text-sm text-gray-300 truncate block" title={item.athlete}>
                    {item.athlete}
                  </span>
                </td>
                <td className={`px-4 ${cellPy}`}>{getStatusPill(item.status)}</td>
                <td className={`px-4 ${cellPy}`}>
                  {item.is_featured ? (
                    <Star className="w-4 h-4 fill-accent text-accent" aria-label="Featured" />
                  ) : (
                    <Star className="w-4 h-4 text-gray-700" aria-hidden />
                  )}
                </td>
                <td className={`px-4 ${cellPy}`}>
                  <span className="text-sm font-mono font-bold text-gray-300">
                    ${item.price_usd.toLocaleString()}
                  </span>
                </td>
                <td className={`px-4 ${cellPy} hidden lg:table-cell text-sm text-gray-400`}>
                  {item.updated_at ? (
                    <span suppressHydrationWarning>
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={`px-2 ${cellPy}`} onClick={(e) => e.stopPropagation()}>
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
