"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ResponsiveDataTable } from "@/components/shared/ResponsiveDataTable";
import { Search, Plus } from "lucide-react";
import type { CustomField, Lead } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { LeadForm, type LeadFormData } from "@/admin/crm/components/LeadForm";
import { LeadConvertDialog } from "@/admin/crm/components/LeadConvertDialog";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";
import { ActivityFeed } from "@/admin/crm/components/ActivityFeed";
import { AttachmentsPanel } from "@/admin/crm/components/AttachmentsPanel";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { TaskForm, type TaskFormData } from "@/admin/tasks/components/TaskForm";
import { tasksService } from "@/admin/tasks/services/tasksService";
import { leadsService } from "@/admin/crm/services/leadsService";
import { customFieldsService } from "@/admin/crm/services/customFieldsService";
import { customFieldValuesService } from "@/admin/crm/services/customFieldValuesService";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useProfile } from "@/admin/users/hooks/useProfile";
import { CrmViewBar } from "@/components/shared/CrmViewBar";
import { crmSearchesService } from "@/admin/crm/services/crmSearchesService";
import { EmailDialog } from "@/components/shared/EmailDialog";

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>("");
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
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<Lead | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [taskSubmitting, setTaskSubmitting] = useState(false);

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

  useEffect(() => {
    let mounted = true;
    customFieldsService
      .list("lead")
      .then((data) => {
        if (mounted) setCustomFields(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!editingId) {
      setCustomFieldValues({});
      return;
    }
    let mounted = true;
    customFieldValuesService
      .list({ entity_type: "lead", entity_id: editingId })
      .then((res) => {
        if (!mounted) return;
        const map: Record<string, unknown> = {};
        res.items.forEach((item) => {
          map[item.field_id] = item.value_json;
        });
        setCustomFieldValues(map);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [editingId]);

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleEmail = (row: Lead) => {
    if (!row.email) {
      toast.error("Lead has no email");
      return;
    }
    setEmailTarget(row);
    setEmailOpen(true);
  };

  const handleFormSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    const { custom_fields, ...payload } = data;
    try {
      if (editingId) {
        await leadsService.update(editingId, payload);
        if (custom_fields) {
          await customFieldValuesService.upsert({
            entity_type: "lead",
            entity_id: editingId,
            values: custom_fields as Record<string, unknown>,
          });
        }
        toast.success("Lead updated");
      } else {
        const created = await leadsService.create(payload);
        if (custom_fields) {
          await customFieldValuesService.upsert({
            entity_type: "lead",
            entity_id: created.id,
            values: custom_fields as Record<string, unknown>,
          });
        }
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

  const handleOpenConvert = (row: Lead) => {
    setConvertLead(row);
    setConvertDialogOpen(true);
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
        aria-label="Select all leads"
      />
    );
    return [
      {
        header: headerCheckbox,
        accessor: "select",
        render: (r: Lead) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(r.id)}
            onChange={(e) => toggleSelect(r.id, e.target.checked)}
            className="h-4 w-4"
            aria-label={`Select lead ${r.full_name}`}
          />
        ),
      },
      { header: "Name", accessor: "full_name", render: (r: Lead) => <span className="font-semibold text-white">{r.full_name}</span> },
      { header: "Email", accessor: "email", render: (r: Lead) => <span className="text-gray-300">{r.email ?? "—"}</span> },
      { header: "Company", accessor: "company", render: (r: Lead) => <span className="text-gray-300">{r.company ?? "—"}</span> },
      { header: "Status", accessor: "status", render: (r: Lead) => getStatusPill(r.status) },
      { header: "Score", accessor: "score", render: (r: Lead) => <span className="text-gray-300">{r.score ?? 0}</span> },
      { header: "Created", accessor: "created_at", render: (r: Lead) => <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
    ];
  }, [allSelected, selectedIds, items]);

  const defaultValues = editingId ? items.find((l) => l.id === editingId) : undefined;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Leads"
          children={
            <>
              {selectedIds.length > 0 && canEdit ? (
                <>
                  <button
                    type="button"
                    onClick={handleAssignToMe}
                    disabled={!userId}
                    className="bg-white/5 border border-border text-gray-300 px-3 py-2 rounded-lg text-xs hover:text-white"
                  >
                    Assign to me
                  </button>
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
                    <option value="" disabled>Set status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="unqualified">Unqualified</option>
                  </select>
                  {canBulkDelete && (
                    <button
                      type="button"
                      onClick={() => setBulkDeleteIds(selectedIds)}
                      className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs font-bold"
                    >
                      Delete selected ({selectedIds.length})
                    </button>
                  )}
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
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
              </select>
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Plus className="w-4 h-4" /> Create Lead
                </button>
              ) : null}
            </>
          }
        />
        <CrmViewBar
          entityType="leads"
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
          <EmptyPlaceholderCard ctaLabel="Create Lead" onCtaClick={canEdit ? handleCreate : undefined} />
        ) : (
          <>
            <ResponsiveDataTable
              columns={columns as unknown as Array<{ header: string | React.ReactNode; accessor: string; render?: (row: Record<string, unknown>) => React.ReactNode }>}
              data={items as unknown as Record<string, unknown>[]}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? setDeleteConfirmId : undefined}
              onConvert={canEdit ? (row) => handleOpenConvert(row as unknown as Lead) : undefined}
              isConvertDisabled={(row) => Boolean((row as unknown as Lead).converted_customer_id)}
              onEmail={canEdit ? (row) => handleEmail(row as unknown as Lead) : undefined}
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
      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingId ? "Edit Lead" : "Create Lead"}>
        <div className="space-y-6">
          <LeadForm
            defaultValues={defaultValues ? { full_name: defaultValues.full_name, email: defaultValues.email ?? undefined, phone: defaultValues.phone ?? undefined, company: defaultValues.company ?? undefined, source: defaultValues.source ?? undefined, status: defaultValues.status as "new" | "contacted" | "qualified" | "unqualified", score: defaultValues.score ?? 0 } : undefined}
            customFields={customFields}
            customFieldValues={customFieldValues}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
            isSubmitting={isSubmitting}
          />
          {editingId ? (
            <>
              <AttachmentsPanel entityType="lead" entityId={editingId} readOnly={!canEdit} />
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-white mb-3">Activity</h3>
                <ActivityFeed
                  entityType="lead"
                  entityId={editingId}
                  readOnly={!canEdit}
                  onAddTaskClick={canEdit ? () => setTaskDialogOpen(true) : undefined}
                  refreshTrigger={activityRefresh}
                />
              </div>
            </>
          ) : null}
        </div>
      </FormDialog>
      <FormDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} title="Add task">
        <TaskForm
          defaultValues={editingId ? { entity_type: "lead", entity_id: editingId, status: "open", priority: "medium" } : undefined}
          onSubmit={async (data: TaskFormData) => {
            if (!editingId) return;
            setTaskSubmitting(true);
            try {
              await tasksService.create({
                title: data.title,
                description: data.description ?? undefined,
                status: data.status ?? "open",
                priority: data.priority ?? "medium",
                due_at: data.due_at ?? undefined,
                entity_type: "lead",
                entity_id: editingId,
              });
              toast.success("Task created");
              setTaskDialogOpen(false);
              setActivityRefresh((c) => c + 1);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to create task");
            } finally {
              setTaskSubmitting(false);
            }
          }}
          onCancel={() => setTaskDialogOpen(false)}
          isSubmitting={taskSubmitting}
        />
      </FormDialog>
      <DeleteConfirmModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleConfirmDelete} />
      <DeleteConfirmModal isOpen={bulkDeleteIds.length > 0} onClose={() => setBulkDeleteIds([])} onConfirm={handleConfirmBulkDelete} />
      <LeadConvertDialog lead={convertLead} open={convertDialogOpen} onOpenChange={setConvertDialogOpen} onSuccess={fetchList} />
      <EmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        entityType="lead"
        entityId={emailTarget?.id ?? null}
        defaultTo={emailTarget?.email ?? undefined}
        defaultSubject={emailTarget ? `Hello ${emailTarget.full_name}` : undefined}
      />
    </>
  );
}
