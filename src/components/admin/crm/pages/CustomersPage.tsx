"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ResponsiveDataTable } from "@/components/shared/ResponsiveDataTable";
import type { Customer } from "@/lib/types/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { customersService } from "@/features/crm/services/customersService";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useProfile } from "@/features/users/hooks/useProfile";
import { CrmViewBar } from "@/components/admin/crm/CrmViewBar";
import { crmSearchesService } from "@/features/crm/services/crmSearchesService";
import { useCustomersColumns } from "./useCustomersColumns";
import { CustomersPageFilters } from "./CustomersPageFilters";
import { CustomersFormDialog } from "./CustomersFormDialog";
import type { CustomerFormData } from "@/components/admin/crm/components/CustomerForm";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role, userId } = useProfile();
  const canEdit = role === "admin" || role === "editor";
  const canBulkDelete = role === "admin";
  const [ownerFilter, setOwnerFilter] = useState("");

  useEffect(() => {
    if (canEdit && searchParams.get("create") === "1") setFormOpen(true);
  }, [searchParams, canEdit]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, ownerFilter]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      crmSearchesService.add("customers", debouncedQuery.trim()).catch(() => {});
    }
  }, [debouncedQuery]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customersService.list({
        page,
        pageSize,
        q: debouncedQuery || undefined,
        owner_id: ownerFilter === "me" && userId ? userId : undefined,
      });
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
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

  const handleFormSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await customersService.update(editingId, data);
        toast.success("Customer updated");
      } else {
        await customersService.create(data);
        toast.success("Customer created");
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
      await customersService.delete(deleteConfirmId);
      toast.success("Customer deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
    setDeleteConfirmId(null);
  };

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteIds.length) return;
    try {
      await Promise.all(bulkDeleteIds.map((id) => customersService.delete(id)));
      toast.success("Customers deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete customers");
    } finally {
      setBulkDeleteIds([]);
    }
  };

  const handleBulkStatusChange = async (status: "active" | "inactive") => {
    if (!selectedIds.length) return;
    try {
      const res = await customersService.bulkUpdate(selectedIds, { status });
      toast.success(`Updated ${(res as { updated?: number }).updated ?? selectedIds.length} customer(s)`);
      setSelectedIds([]);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update customers");
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedIds.length || !userId) return;
    try {
      const res = await customersService.bulkUpdate(selectedIds, { owner_id: userId });
      toast.success(`Assigned ${(res as { updated?: number }).updated ?? selectedIds.length} customer(s) to you`);
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
  const columns = useCustomersColumns({
    items,
    selectedIds,
    allSelected,
    someSelected,
    userId,
    onToggleAll: (checked) => setSelectedIds(checked ? items.map((item) => item.id) : []),
    onToggleOne: toggleSelect,
  });

  const defaultValues = editingId ? items.find((c) => c.id === editingId) : undefined;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Customers"
          children={
            <CustomersPageFilters
              searchQuery={searchQuery}
              ownerFilter={ownerFilter}
              selectedCount={selectedIds.length}
              canEdit={canEdit}
              canBulkDelete={canBulkDelete}
              userId={userId}
              onSearchChange={setSearchQuery}
              onOwnerChange={setOwnerFilter}
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
          entityType="customers"
          getState={() => ({ query: searchQuery, filters: {}, pageSize })}
          applyState={(state) => setSearchQuery(String(state.query ?? ""))}
          onSearchSelect={setSearchQuery}
          reloadSignal={debouncedQuery}
        />
        {error ? (
          <ErrorState message={error} onRetry={fetchList} />
        ) : loading ? (
          <AdminLoadingState />
        ) : items.length === 0 ? (
          <EmptyPlaceholderCard
            ctaLabel="Create Customer"
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
      <CustomersFormDialog
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
    </>
  );
}
