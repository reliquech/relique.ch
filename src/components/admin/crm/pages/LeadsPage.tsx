"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ResponsiveDataTable } from "@/components/shared/ResponsiveDataTable";
import type { Lead } from "@/lib/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeadConvertDialog } from "@/components/admin/crm/components/LeadConvertDialog";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { leadsService } from "@/features/crm/services/leadsService";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useProfile } from "@/features/users/hooks/useProfile";
import { CrmViewBar } from "@/components/admin/crm/CrmViewBar";
import { crmSearchesService } from "@/features/crm/services/crmSearchesService";
import { useLeadsColumns } from "./useLeadsColumns";
import { LeadsPageFilters } from "./LeadsPageFilters";
import { LeadsFormDialog } from "./LeadsFormDialog";
import type { LeadFormData } from "@/components/admin/crm/components/LeadForm";

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role, userId } = useProfile();
  const canEdit = role === "admin" || role === "editor";
  const canBulkDelete = role === "admin";

  useEffect(() => {
    if (canEdit && searchParams.get("create") === "1") setFormOpen(true);
  }, [searchParams, canEdit]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      crmSearchesService.add("leads", debouncedQuery.trim()).catch(() => {});
    }
  }, [debouncedQuery]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadsService.list({
        page,
        pageSize,
        q: debouncedQuery || undefined,
        status: statusFilter || undefined,
      });
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setSelectedIds([]);
  }, [items]);

  const handleFormSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await leadsService.update(editingId, data);
        toast.success("Lead updated");
      } else {
        await leadsService.create(data);
        toast.success("Lead created");
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
      await leadsService.delete(deleteConfirmId);
      toast.success("Lead deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
    setDeleteConfirmId(null);
  };

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteIds.length) return;
    try {
      await Promise.all(bulkDeleteIds.map((id) => leadsService.delete(id)));
      toast.success("Leads deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete leads");
    } finally {
      setBulkDeleteIds([]);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (!selectedIds.length) return;
    try {
      const res = await leadsService.bulkUpdate(selectedIds, { status });
      toast.success(`Updated ${(res as { updated?: number }).updated ?? selectedIds.length} lead(s)`);
      setSelectedIds([]);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update leads");
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedIds.length || !userId) return;
    try {
      const res = await leadsService.bulkUpdate(selectedIds, { owner_id: userId });
      toast.success(`Assigned ${(res as { updated?: number }).updated ?? selectedIds.length} lead(s) to you`);
      setSelectedIds([]);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign");
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, id]));
      return prev.filter((item) => item !== id);
    });
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;
  const columns = useLeadsColumns({
    items,
    selectedIds,
    allSelected,
    someSelected,
    onToggleAll: (checked) => setSelectedIds(checked ? items.map((item) => item.id) : []),
    onToggleOne: toggleSelect,
  });

  const defaultValues = editingId ? items.find((l) => l.id === editingId) : undefined;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Leads"
          children={
            <LeadsPageFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              selectedCount={selectedIds.length}
              canEdit={canEdit}
              canBulkDelete={canBulkDelete}
              userId={userId}
              onSearchChange={setSearchQuery}
              onStatusChange={setStatusFilter}
              onCreate={() => {
                setEditingId(null);
                setFormOpen(true);
              }}
              onAssignToMe={handleAssignToMe}
              onBulkStatusChange={handleBulkStatusChange}
              onBulkDelete={() => setBulkDeleteIds(selectedIds)}
            />
          }
        />
        <CrmViewBar
          entityType="leads"
          getState={() => ({ query: searchQuery, filters: { status: statusFilter }, pageSize })}
          applyState={(state) => {
            setSearchQuery(String(state.query ?? ""));
            const nextStatus = (state.filters as Record<string, unknown> | undefined)?.status;
            setStatusFilter(nextStatus ? String(nextStatus) : "");
          }}
          onSearchSelect={setSearchQuery}
          reloadSignal={debouncedQuery}
        />
        {error ? (
          <ErrorState message={error} onRetry={fetchList} />
        ) : loading ? (
          <AdminLoadingState />
        ) : items.length === 0 ? (
          <EmptyPlaceholderCard
            ctaLabel="Create Lead"
            onCtaClick={
              canEdit
                ? () => {
                    setEditingId(null);
                    setFormOpen(true);
                  }
                : undefined
            }
          />
        ) : (
          <>
            <ResponsiveDataTable
              columns={
                columns as unknown as Array<{
                  header: string | React.ReactNode;
                  accessor: string;
                  render?: (row: Record<string, unknown>) => React.ReactNode;
                }>
              }
              data={items as unknown as Record<string, unknown>[]}
              onEdit={canEdit ? (id) => { setEditingId(id); setFormOpen(true); } : undefined}
              onDelete={canEdit ? setDeleteConfirmId : undefined}
              onConvert={canEdit ? (row) => { setConvertLead(row as unknown as Lead); setConvertDialogOpen(true); } : undefined}
              isConvertDisabled={(row) => Boolean((row as unknown as Lead).converted_customer_id)}
              mobileTitleAccessor="full_name"
              mobileSubtitleAccessor="email"
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
      <LeadsFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingId={editingId}
        defaultValues={defaultValues}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onCancel={() => setFormOpen(false)}
      />
      <DeleteConfirmModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleConfirmDelete} />
      <DeleteConfirmModal isOpen={bulkDeleteIds.length > 0} onClose={() => setBulkDeleteIds([])} onConfirm={handleConfirmBulkDelete} />
      <LeadConvertDialog lead={convertLead} open={convertDialogOpen} onOpenChange={setConvertDialogOpen} onSuccess={fetchList} />
    </>
  );
}
