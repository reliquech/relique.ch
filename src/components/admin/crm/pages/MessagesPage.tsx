"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ResponsiveDataTable } from "@/components/shared/ResponsiveDataTable";
import { Search } from "lucide-react";
import type { Message } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { MessageDetail } from "@/components/admin/crm/components/MessageDetail";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { messagesService } from "@/features/crm/services/messagesService";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useProfile } from "@/features/users/hooks/useProfile";
import { CrmViewBar } from "@/components/admin/crm/CrmViewBar";
import { crmSearchesService } from "@/features/crm/services/crmSearchesService";

export default function MessagesPage() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { role } = useProfile();
  const canEdit = role === "admin" || role === "editor";

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      crmSearchesService.add("messages", debouncedQuery.trim()).catch(() => {});
    }
  }, [debouncedQuery]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await messagesService.list({
        page,
        pageSize,
        q: debouncedQuery || undefined,
        status: statusFilter || undefined,
      });
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
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

  const handleView = (id: string) => {
    const msg = items.find((m) => m.id === id);
    if (msg) {
      setViewingMessage(msg);
      setDetailOpen(true);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await messagesService.update(id, { status });
      toast.success("Status updated");
      fetchList();
      if (viewingMessage?.id === id) {
        setViewingMessage((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await messagesService.delete(deleteConfirmId);
      toast.success("Message deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete message");
    }
    setDeleteConfirmId(null);
  };

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteIds.length) return;
    try {
      await Promise.all(bulkDeleteIds.map((id) => messagesService.delete(id)));
      toast.success("Messages deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete messages");
    } finally {
      setBulkDeleteIds([]);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => messagesService.update(id, { status })));
      toast.success("Messages updated");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update messages");
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
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected, selectedIds]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const columns = useMemo(() => {
    const headerCheckbox = (
      <input
        ref={selectAllRef}
        type="checkbox"
        checked={allSelected}
        onChange={(e) => handleToggleAll(e.target.checked)}
        className="h-4 w-4"
        aria-label="Select all messages"
      />
    );
    return [
      {
        header: headerCheckbox,
        accessor: "select",
        render: (r: Message) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(r.id)}
            onChange={(e) => toggleSelect(r.id, e.target.checked)}
            className="h-4 w-4"
            aria-label={`Select message ${r.name}`}
          />
        ),
      },
      { header: "Name", accessor: "name", render: (r: Message) => <span className="font-semibold text-white">{r.name}</span> },
      { header: "Email", accessor: "email", render: (r: Message) => <span className="text-gray-300">{r.email}</span> },
      { header: "Subject", accessor: "subject", render: (r: Message) => <span className="text-gray-300">{r.subject ?? "—"}</span> },
      { header: "Status", accessor: "status", render: (r: Message) => getStatusPill(r.status) },
      { header: "Created", accessor: "created_at", render: (r: Message) => <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
    ];
  }, [allSelected, selectedIds, items]);

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Contact Inquiries"
          children={
            <>
              {selectedIds.length > 0 && canEdit ? (
                <>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkStatusChange(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Set status
                    </option>
                    <option value="new">New</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setBulkDeleteIds(selectedIds)}
                    className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs font-bold"
                  >
                    Delete selected ({selectedIds.length})
                  </button>
                </>
              ) : null}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64 text-white placeholder:text-gray-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">All status</option>
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </>
          }
        />
        <CrmViewBar
          entityType="messages"
          getState={() => ({
            query: searchQuery,
            filters: { status: statusFilter },
            pageSize,
          })}
          applyState={(state) => {
            setSearchQuery(String(state.query ?? ""));
            const nextStatus = (state.filters as Record<string, unknown> | undefined)?.status;
            setStatusFilter(nextStatus ? String(nextStatus) : "");
          }}
          onSearchSelect={(query) => setSearchQuery(query)}
          reloadSignal={debouncedQuery}
        />
        {error ? (
          <ErrorState message={error} onRetry={fetchList} />
        ) : loading ? (
          <AdminLoadingState />
        ) : items.length === 0 ? (
          <EmptyPlaceholderCard ctaLabel="No messages" />
        ) : (
          <>
            <ResponsiveDataTable
              columns={columns as unknown as Array<{ header: string | React.ReactNode; accessor: string; render?: (row: Record<string, unknown>) => React.ReactNode }>}
              data={items as unknown as Record<string, unknown>[]}
              onView={handleView}
              onDelete={canEdit ? setDeleteConfirmId : undefined}
              mobileTitleAccessor="subject"
              mobileSubtitleAccessor="name"
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
      <MessageDetail
        message={viewingMessage}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={canEdit ? handleStatusChange : undefined}
        readOnly={!canEdit}
      />
      <DeleteConfirmModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleConfirmDelete} />
      <DeleteConfirmModal isOpen={bulkDeleteIds.length > 0} onClose={() => setBulkDeleteIds([])} onConfirm={handleConfirmBulkDelete} />
    </>
  );
}
