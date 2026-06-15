"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ResponsiveDataTable } from "@/components/shared/ResponsiveDataTable";
import { Search, Plus } from "lucide-react";
import type { Deal } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { DealForm, type DealFormData } from "@/components/admin/crm/components/DealForm";
import { DealDetail } from "@/components/admin/crm/components/DealDetail";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { dealsService } from "@/features/crm/services/dealsService";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useProfile } from "@/features/users/hooks/useProfile";
import { CrmViewBar } from "@/components/admin/crm/CrmViewBar";
import { crmSearchesService } from "@/features/crm/services/crmSearchesService";

export default function DealsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [ownerFilter, setOwnerFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailDealId, setDetailDealId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role, userId } = useProfile();
  const canEdit = role === "admin" || role === "editor";
  const canBulkDelete = role === "admin";

  useEffect(() => {
    if (canEdit && searchParams.get("create") === "1") setFormOpen(true);
  }, [searchParams, canEdit]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, ownerFilter]);

  useEffect(() => {
    if (debouncedQuery.trim()) crmSearchesService.add("deals", debouncedQuery.trim()).catch(() => {});
  }, [debouncedQuery]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dealsService.list({
        page,
        pageSize,
        q: debouncedQuery || undefined,
        owner_id: ownerFilter === "me" && userId ? userId : undefined,
      });
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, ownerFilter, userId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setSelectedIds([]);
  }, [items]);

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: DealFormData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await dealsService.update(editingId, data);
        toast.success("Deal updated");
      } else {
        await dealsService.create(data);
        toast.success("Deal created");
      }
      setFormOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await dealsService.delete(deleteConfirmId);
      toast.success("Deal deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
    setDeleteConfirmId(null);
  };

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteIds.length) return;
    try {
      await Promise.all(bulkDeleteIds.map((id) => dealsService.delete(id)));
      toast.success("Deals deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete deals");
    } finally {
      setBulkDeleteIds([]);
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedIds.length || !userId) return;
    try {
      const res = await dealsService.bulkUpdate(selectedIds, { owner_id: userId });
      toast.success(`Assigned ${(res as { updated?: number }).updated ?? selectedIds.length} deal(s) to you`);
      setSelectedIds([]);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign");
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id)));
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected, selectedIds]);

  const handleToggleAll = (checked: boolean) => setSelectedIds(checked ? items.map((item) => item.id) : []);

  const columns = useMemo(() => {
    const headerCheckbox = (
      <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={(e) => handleToggleAll(e.target.checked)} className="h-4 w-4" aria-label="Select all deals" />
    );
    return [
      {
        header: headerCheckbox,
        accessor: "select",
        render: (r: Deal) => (
          <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e) => toggleSelect(r.id, e.target.checked)} className="h-4 w-4" aria-label={`Select deal ${r.title}`} />
        ),
      },
      { header: "Title", accessor: "title", render: (r: Deal) => <span className="font-semibold text-white">{r.title}</span> },
      { header: "Owner", accessor: "owner_id", render: (r: Deal) => <span className="text-gray-400">{r.owner_id === userId ? "You" : "—"}</span> },
      { header: "Value", accessor: "value", render: (r: Deal) => <span className="font-mono text-gray-300">{r.value != null ? `${r.currency ?? "USD"} ${Number(r.value).toLocaleString()}` : "—"}</span> },
      { header: "Status", accessor: "status", render: (r: Deal) => getStatusPill(r.status) },
      { header: "Probability", accessor: "probability", render: (r: Deal) => <span className="text-gray-300">{r.probability ?? 0}%</span> },
      { header: "Created", accessor: "created_at", render: (r: Deal) => <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
    ];
  }, [allSelected, selectedIds, items, userId]);

  const defaultValues = editingId ? items.find((d) => d.id === editingId) : undefined;
  const detailDeal = detailDealId ? items.find((d) => d.id === detailDealId) ?? null : null;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Deals"
          children={
            <>
              {selectedIds.length > 0 && canEdit ? (
                <>
                  <button type="button" onClick={handleAssignToMe} disabled={!userId} className="bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                    Assign to me ({selectedIds.length})
                  </button>
                  {canBulkDelete ? (
                    <button type="button" onClick={() => setBulkDeleteIds(selectedIds)} className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs font-bold">
                      Delete selected ({selectedIds.length})
                    </button>
                  ) : null}
                </>
              ) : null}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64 text-white placeholder:text-gray-500" />
              </div>
              <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white">
                <option value="">All owners</option>
                <option value="me">Me</option>
              </select>
              {canEdit ? (
                <button type="button" onClick={handleCreate} className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20">
                  <Plus className="w-4 h-4" /> Create Deal
                </button>
              ) : null}
            </>
          }
        />
        <CrmViewBar
          entityType="deals"
          getState={() => ({ query: searchQuery, filters: { owner: ownerFilter }, pageSize })}
          applyState={(state) => {
            setSearchQuery(String(state.query ?? ""));
            const nextOwner = (state.filters as Record<string, unknown> | undefined)?.owner;
            setOwnerFilter(nextOwner ? String(nextOwner) : "");
          }}
          onSearchSelect={(query) => setSearchQuery(query)}
          reloadSignal={debouncedQuery}
        />
        {error ? <ErrorState message={error} onRetry={fetchList} /> : null}
        {loading ? (
          <AdminLoadingState />
        ) : items.length === 0 ? (
          <EmptyPlaceholderCard ctaLabel="Create Deal" onCtaClick={canEdit ? handleCreate : undefined} />
        ) : (
          <>
            <ResponsiveDataTable
              columns={columns as unknown as Array<{ header: string | React.ReactNode; accessor: string; render?: (row: Record<string, unknown>) => React.ReactNode }>}
              data={items as unknown as Record<string, unknown>[]}
              onView={(id) => {
                setDetailDealId(id);
                setDetailOpen(true);
              }}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? setDeleteConfirmId : undefined}
              mobileTitleAccessor="title"
              mobileSubtitleAccessor="value"
            />
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded bg-white/5 disabled:opacity-50 text-sm">Previous</button>
                <span className="px-3 py-1 text-sm text-gray-400">Page {page} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded bg-white/5 disabled:opacity-50 text-sm">Next</button>
              </div>
            )}
          </>
        )}
      </div>
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingId ? "Edit Deal" : "Create Deal"}>
        <DealForm
          defaultValues={defaultValues ? { title: defaultValues.title, customer_id: defaultValues.customer_id ?? undefined, lead_id: defaultValues.lead_id ?? undefined, value: defaultValues.value ?? undefined, currency: defaultValues.currency, probability: defaultValues.probability ?? 0, expected_close_date: defaultValues.expected_close_date ?? undefined, status: defaultValues.status as "open" | "won" | "lost", notes: defaultValues.notes ?? undefined } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </FormDialog>
      <DeleteConfirmModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleConfirmDelete} />
      <DeleteConfirmModal isOpen={bulkDeleteIds.length > 0} onClose={() => setBulkDeleteIds([])} onConfirm={handleConfirmBulkDelete} />
      <DealDetail deal={detailDeal} open={detailOpen} onOpenChange={setDetailOpen} onSave={fetchList} readOnly={!canEdit} />
    </>
  );
}
