"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useProfile } from "@/features/users/hooks/useProfile";
import { marketplaceAPIService } from "@/features/marketplace/services/marketplaceService";
import { useMarketplaceItemsUrl } from "@/features/marketplace/hooks/useMarketplaceItemsUrl";
import { useMarketplaceItemsQuery } from "@/features/marketplace/hooks/useMarketplaceItemsQuery";
import { useMarketplaceItemsView } from "@/features/marketplace/hooks/useMarketplaceItemsView";
import { useOnlineStatus } from "@/features/marketplace/hooks/useOnlineStatus";
import type { MarketplaceItem } from "@/lib/types/admin";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { MarketplaceItemsToolbar } from "@/components/admin/marketplace/items/MarketplaceItemsToolbar";
import { MarketplaceItemsFilters } from "@/components/admin/marketplace/items/MarketplaceItemsFilters";
import { MarketplaceItemsFilterChips } from "@/components/admin/marketplace/items/MarketplaceItemsFilterChips";
import { MarketplaceItemsBulkBar } from "@/components/admin/marketplace/items/MarketplaceItemsBulkBar";
import { MarketplaceItemsTable } from "@/components/admin/marketplace/items/MarketplaceItemsTable";
import { MarketplaceItemsGrid } from "@/components/admin/marketplace/items/MarketplaceItemsGrid";
import { MarketplaceItemsTableSkeleton } from "@/components/admin/marketplace/items/MarketplaceItemsTableSkeleton";
import { MarketplaceItemsPagination } from "@/components/admin/marketplace/items/MarketplaceItemsPagination";
import { MarketplaceTypedDeleteDialog } from "@/components/admin/marketplace/items/MarketplaceTypedDeleteDialog";
import type { MarketplaceItemsSort, MarketplaceStatusTab } from "@/features/marketplace/types/itemsList";

type ConfirmKind = "delete" | "archive" | "bulk-delete" | "bulk-archive" | null;

export default function ItemsPage() {
  const router = useRouter();
  const { role } = useProfile();
  const canEdit = role === "admin" || role === "editor";
  const online = useOnlineStatus();

  const { state, setState, clearFilters } = useMarketplaceItemsUrl();
  const { data, loading, refreshing, isStale, error, refetch, invalidateCache } =
    useMarketplaceItemsQuery(state);
  const { view, setView, mounted: viewMounted } = useMarketplaceItemsView();
  const activeView = viewMounted ? view : "table";

  const [searchInput, setSearchInput] = useState(state.q);
  const debouncedQ = useDebounce(searchInput, 300);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const prevQueryKey = useRef("");

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const queryKey = JSON.stringify({
    q: state.q,
    statusTab: state.statusTab,
    statusMulti: state.statusMulti,
    featured: state.featured,
    athlete: state.athlete,
    priceMin: state.priceMin,
    priceMax: state.priceMax,
    sort: state.sort,
    order: state.order,
    page: state.page,
    pageSize: state.pageSize,
  });

  useEffect(() => {
    setSearchInput(state.q);
  }, [state.q]);

  useEffect(() => {
    if (debouncedQ !== state.q) {
      setState({ q: debouncedQ }, { resetPage: true });
    }
  }, [debouncedQ, setState, state.q]);

  useEffect(() => {
    if (prevQueryKey.current && prevQueryKey.current !== queryKey && selectedIds.length > 0) {
      setSelectedIds([]);
      toast.info("Selection cleared because filters changed");
    }
    prevQueryKey.current = queryKey;
  }, [queryKey, selectedIds.length]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );
  const pendingItems = useMemo(
    () => items.filter((item) => pendingIds.includes(item.id)).map((item) => ({ id: item.id, title: item.title })),
    [items, pendingIds]
  );

  const hasActiveFilters =
    state.q.trim() !== "" ||
    state.statusMulti.length > 0 ||
    state.featured !== "all" ||
    state.athlete.trim() !== "" ||
    state.priceMin.trim() !== "" ||
    state.priceMax.trim() !== "";

  const handleSort = useCallback(
    (column: MarketplaceItemsSort) => {
      if (state.sort === column) {
        setState({ order: state.order === "asc" ? "desc" : "asc" }, { resetPage: true });
      } else {
        setState({ sort: column, order: column === "title" ? "asc" : "desc" }, { resetPage: true });
      }
    },
    [setState, state.order, state.sort]
  );

  const runBulk = async (action: "publish" | "archive" | "restore" | "delete", ids: string[]) => {
    if (!canEdit) {
      toast.error("You do not have permission to modify marketplace items");
      return;
    }
    if (!online) {
      toast.error("You are offline. Reconnect before changing marketplace items.");
      return;
    }
    try {
      const res = await marketplaceAPIService.bulk(ids, action);
      if (res.failed.length > 0) {
        toast.error(`Updated ${res.updated} of ${res.total} items. ${res.failed.length} failed`, {
          description: res.failed.map((f) => f.id).join(", "),
        });
      } else {
        toast.success(`Updated ${res.updated} item(s)`);
      }
      setSelectedIds([]);
      invalidateCache();
      void refetch({ force: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleConfirm = async () => {
    if (!confirmKind || pendingIds.length === 0) return;
    if (confirmKind === "delete" || confirmKind === "bulk-delete") {
      setIsDeleting(true);
      try {
        await runBulk("delete", pendingIds);
      } finally {
        setIsDeleting(false);
      }
    } else if (confirmKind === "archive" || confirmKind === "bulk-archive") {
      await runBulk("archive", pendingIds);
    }
    setConfirmKind(null);
    setPendingIds([]);
  };

  const rowActions = {
    onEdit: (item: MarketplaceItem) => router.push(`/admin/items/${item.id}/edit`),
    onPreview: (item: MarketplaceItem) => {
      if (item.slug) window.open(`/marketplace/${item.slug}`, "_blank", "noopener,noreferrer");
    },
    onDuplicate: async (item: MarketplaceItem) => {
      if (!canEdit || !online) return;
      try {
        await marketplaceAPIService.duplicate(item.id);
        toast.success("Item duplicated as draft");
        invalidateCache();
        void refetch({ force: true });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Duplicate failed");
      }
    },
    onPublish: async (item: MarketplaceItem) => {
      if (!canEdit || !online) return;
      try {
        await marketplaceAPIService.updateStatus(item.id, "published" as MarketplaceItem["status"]);
        toast.success("Item published");
        invalidateCache();
        void refetch({ force: true });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Publish failed");
      }
    },
    onUnpublish: async (item: MarketplaceItem) => {
      if (!canEdit || !online) return;
      try {
        await marketplaceAPIService.updateStatus(item.id, "draft" as MarketplaceItem["status"]);
        toast.success("Item unpublished");
        invalidateCache();
        void refetch({ force: true });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unpublish failed");
      }
    },
    onArchive: (item: MarketplaceItem) => {
      if (!canEdit || !online) return;
      setPendingIds([item.id]);
      setConfirmKind("archive");
    },
    onRestore: async (item: MarketplaceItem) => {
      if (!canEdit || !online) return;
      try {
        await marketplaceAPIService.updateStatus(item.id, "draft" as MarketplaceItem["status"]);
        toast.success("Item restored to draft");
        invalidateCache();
        void refetch({ force: true });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Restore failed");
      }
    },
    onDelete: (item: MarketplaceItem) => {
      if (!canEdit || !online) return;
      setPendingIds([item.id]);
      setConfirmKind("delete");
    },
  };

  const isFilteredEmpty = !loading && items.length === 0 && (hasActiveFilters || state.statusTab !== "all");
  const isGlobalEmpty = !loading && items.length === 0 && !hasActiveFilters && state.statusTab === "all" && !state.q;
  const visibleCount = items.length;
  const filteredCount = data?.total ?? 0;
  const totalCount = data?.counts?.all ?? data?.total ?? 0;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 motion-reduce:animate-none">
        <MarketplaceItemsToolbar
          state={state}
          counts={data?.counts}
          searchInput={searchInput}
          filtersOpen={filtersOpen}
          hasActiveFilters={hasActiveFilters}
          view={activeView}
          visibleCount={visibleCount}
          filteredCount={filteredCount}
          totalCount={totalCount}
          onSearchChange={setSearchInput}
          onTabChange={(tab: MarketplaceStatusTab) =>
            setState({ statusTab: tab, statusMulti: [], page: 1 })
          }
          onViewChange={setView}
          onToggleFilters={() => setFiltersOpen((v) => !v)}
          onSortChange={(sort, order) => setState({ sort, order }, { resetPage: true })}
          onClearAll={clearFilters}
          refreshing={refreshing}
        />

        <MarketplaceItemsFilters
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          state={state}
          onApply={(patch) => setState(patch, { resetPage: true })}
        />

        <MarketplaceItemsFilterChips state={state} onPatch={(patch) => setState(patch, { resetPage: true })} />

        {!online ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            You are offline. Listing edits and bulk actions are disabled until your connection returns.
          </div>
        ) : null}

        {canEdit && online ? (
          <MarketplaceItemsBulkBar
            selectedItems={selectedItems}
            onPublish={() => runBulk("publish", selectedIds)}
            onArchive={() => {
              setPendingIds(selectedIds);
              setConfirmKind("bulk-archive");
            }}
            onRestore={() => runBulk("restore", selectedIds)}
            onDelete={() => {
              setPendingIds(selectedIds);
              setConfirmKind("bulk-delete");
            }}
          />
        ) : null}

        {error ? (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Couldn&apos;t load items</p>
              <p className="text-sm opacity-90">Check your connection and try again.</p>
            </div>
            <button
              type="button"
              onClick={() => void refetch({ force: true })}
              className="bg-white/5 border border-border px-4 py-2 rounded-lg text-sm text-white min-h-[40px]"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <MarketplaceItemsTableSkeleton density={state.density} />
        ) : isGlobalEmpty ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <h3 className="text-lg font-bold text-white">No marketplace items yet</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
              Create your first listing to appear on the public marketplace.
            </p>
            <button
              type="button"
              onClick={() => router.push("/admin/items/new")}
              className="mt-6 bg-primary px-4 py-2 rounded-lg text-sm font-bold text-white min-h-[40px]"
            >
              Add Item
            </button>
          </div>
        ) : isFilteredEmpty ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <h3 className="text-lg font-bold text-white">No items match your filters</h3>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting search or filters, or clear all to reset.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 text-sm text-gray-300 underline hover:text-white min-h-[40px]"
            >
              Clear all
            </button>
          </div>
        ) : (
          <>
            {activeView === "grid" ? (
              <MarketplaceItemsGrid
                items={items}
                selectedIds={selectedIds}
                canEdit={canEdit && online}
                onToggleOne={(id, checked) =>
                  setSelectedIds((prev) =>
                    checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
                  )
                }
                onRowClick={(id) => router.push(`/admin/items/${id}/edit`)}
                onRowAction={rowActions}
              />
            ) : (
              <MarketplaceItemsTable
                items={items}
                density={state.density}
                sort={state.sort}
                order={state.order}
                selectedIds={selectedIds}
                canEdit={canEdit && online}
                onSort={handleSort}
                onToggleAll={(checked) => setSelectedIds(checked ? items.map((i) => i.id) : [])}
                onToggleOne={(id, checked) =>
                  setSelectedIds((prev) =>
                    checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
                  )
                }
                onRowClick={(id) => router.push(`/admin/items/${id}/edit`)}
                onRowAction={rowActions}
              />
            )}
            <MarketplaceItemsPagination
              page={state.page}
              totalPages={data?.totalPages ?? 1}
              pageSize={state.pageSize}
              onPageChange={(page) => setState({ page })}
              onPageSizeChange={(pageSize) => setState({ pageSize, page: 1 })}
            />
          </>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={confirmKind === "archive" || confirmKind === "bulk-archive"}
        onClose={() => {
          setConfirmKind(null);
          setPendingIds([]);
        }}
        onConfirm={handleConfirm}
      />

      <MarketplaceTypedDeleteDialog
        open={confirmKind === "delete" || confirmKind === "bulk-delete"}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmKind(null);
            setPendingIds([]);
          }
        }}
        items={pendingItems}
        isDeleting={isDeleting}
        onConfirm={handleConfirm}
      />
    </>
  );
}
