"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ResponsiveDataTable } from "@/components/shared/ResponsiveDataTable";
import { Search, Plus, List, LayoutGrid } from "lucide-react";
import type { CustomField, Deal } from "@/lib/types";
import { getStatusPill } from "@/lib/utils/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { DealForm, type DealFormData } from "@/features/crm/components/DealForm";
import { DealDetail } from "@/features/crm/components/DealDetail";
import { DealsBoard } from "@/features/crm/components/DealsBoard";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { dealsService } from "@/features/crm/services/dealsService";
import { customFieldsService } from "@/features/crm/services/customFieldsService";
import { customFieldValuesService } from "@/features/crm/services/customFieldValuesService";
import { pipelineStagesService } from "@/features/crm/services/pipelineStagesService";
import type { PipelineStage } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useProfile } from "@/features/users/hooks/useProfile";
import { CrmViewBar } from "@/components/shared/CrmViewBar";
import { crmSearchesService } from "@/features/crm/services/crmSearchesService";

type ViewMode = "list" | "kanban";

export default function DealsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [stageFilter, setStageFilter] = useState<string>("");
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
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [kanbanItems, setKanbanItems] = useState<Deal[]>([]);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role, userId } = useProfile();
  const canEdit = role === "admin" || role === "editor";
  const [ownerFilter, setOwnerFilter] = useState<string>("");
  const canBulkDelete = role === "admin";
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const kanbanStages = useMemo<PipelineStage[]>(() => {
    const unassigned: PipelineStage = {
      id: "unassigned",
      name: "Unassigned",
      position: 0,
      color: null,
      is_default: false,
      created_at: "",
      updated_at: "",
    };
    return [unassigned, ...stages];
  }, [stages]);

  useEffect(() => {
    pipelineStagesService.list({ sort: "position" }).then((res) => setStages(res.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (canEdit && searchParams.get("create") === "1") setFormOpen(true);
  }, [searchParams, canEdit]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, stageFilter, ownerFilter]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      crmSearchesService.add("deals", debouncedQuery.trim()).catch(() => {});
    }
  }, [debouncedQuery]);

  const fetchKanban = useCallback(async () => {
    setKanbanLoading(true);
    try {
      const res = await dealsService.list({
        pageSize: 200,
        q: debouncedQuery || undefined,
        pipeline_stage_id: stageFilter || undefined,
        owner_id: ownerFilter === "me" && userId ? userId : undefined,
      });
      setKanbanItems(res.items ?? []);
    } catch {
      setKanbanItems([]);
    } finally {
      setKanbanLoading(false);
    }
  }, [debouncedQuery, stageFilter, ownerFilter, userId]);

  useEffect(() => {
    if (viewMode === "kanban") fetchKanban();
  }, [viewMode, fetchKanban]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dealsService.list({
        page,
        pageSize,
        q: debouncedQuery || undefined,
        pipeline_stage_id: stageFilter || undefined,
        owner_id: ownerFilter === "me" && userId ? userId : undefined,
      });
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, stageFilter, ownerFilter, userId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setSelectedIds([]);
  }, [items, viewMode]);

  useEffect(() => {
    let mounted = true;
    customFieldsService
      .list("deal")
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
      .list({ entity_type: "deal", entity_id: editingId })
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

  const handleFormSubmit = async (data: DealFormData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        const { custom_fields, ...payload } = data;
        await dealsService.update(editingId, payload);
        if (custom_fields) {
          await customFieldValuesService.upsert({
            entity_type: "deal",
            entity_id: editingId,
            values: custom_fields as Record<string, unknown>,
          });
        }
        toast.success("Deal updated");
      } else {
        const { custom_fields, ...payload } = data;
        const created = await dealsService.create(payload);
        if (custom_fields) {
          await customFieldValuesService.upsert({
            entity_type: "deal",
            entity_id: created.id,
            values: custom_fields as Record<string, unknown>,
          });
        }
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
      if (viewMode === "kanban") fetchKanban();
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
      if (viewMode === "kanban") fetchKanban();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete deals");
    } finally {
      setBulkDeleteIds([]);
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

  const handleDealMove = async (dealId: string, stageId: string) => {
    if (!canEdit) return;
    try {
      const nextStageId = stageId === "unassigned" ? null : stageId;
      await dealsService.update(dealId, { pipeline_stage_id: nextStageId });
      toast.success("Deal moved");
      fetchList();
      if (viewMode === "kanban") fetchKanban();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move");
    }
  };

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    const stageList = viewMode === "kanban" ? kanbanStages : stages;
    for (const s of stageList) map[s.id] = [];
    const list = viewMode === "kanban" ? kanbanItems : items;
    for (const d of list) {
      const sid = viewMode === "kanban" ? (d.pipeline_stage_id ?? "unassigned") : (d.pipeline_stage_id ?? "");
      if (!map[sid]) map[sid] = [];
      map[sid].push(d);
    }
    return map;
  }, [stages, kanbanStages, viewMode, kanbanItems, items]);

  const columns = useMemo(() => {
    const headerCheckbox = (
      <input
        ref={selectAllRef}
        type="checkbox"
        checked={allSelected}
        onChange={(e) => handleToggleAll(e.target.checked)}
        className="h-4 w-4"
        aria-label="Select all deals"
      />
    );
    return [
      {
        header: headerCheckbox,
        accessor: "select",
        render: (r: Deal) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(r.id)}
            onChange={(e) => toggleSelect(r.id, e.target.checked)}
            className="h-4 w-4"
            aria-label={`Select deal ${r.title}`}
          />
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

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Deals"
          children={
            <>
              {viewMode === "list" && selectedIds.length > 0 && canEdit ? (
                <>
                  {userId ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await dealsService.bulkUpdate(selectedIds, { owner_id: userId });
                          toast.success(`Assigned ${(res as { updated?: number }).updated ?? selectedIds.length} deal(s) to you`);
                          setSelectedIds([]);
                          fetchList();
                          fetchKanban();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to assign");
                        }
                      }}
                      className="bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-bold"
                    >
                      Assign to me ({selectedIds.length})
                    </button>
                  ) : null}
                  {canBulkDelete ? (
                    <button
                      type="button"
                      onClick={() => setBulkDeleteIds(selectedIds)}
                      className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs font-bold"
                    >
                      Delete selected ({selectedIds.length})
                    </button>
                  ) : null}
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
              {viewMode === "list" && (
                <>
                  <select
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="">All owners</option>
                    <option value="me">Me</option>
                  </select>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="">All stages</option>
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </>
              )}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button type="button" onClick={() => setViewMode("list")} className={`px-3 py-2 text-sm ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-surface text-gray-400 hover:text-white"}`} title="List view"><List className="w-4 h-4" /></button>
                <button type="button" onClick={() => setViewMode("kanban")} className={`px-3 py-2 text-sm ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : "bg-surface text-gray-400 hover:text-white"}`} title="Kanban view"><LayoutGrid className="w-4 h-4" /></button>
              </div>
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Plus className="w-4 h-4" /> Create Deal
                </button>
              ) : null}
            </>
          }
        />
        <CrmViewBar
          entityType="deals"
          getState={() => ({
            query: searchQuery,
            filters: { stage: stageFilter, view: viewMode },
            pageSize,
          })}
          applyState={(state) => {
            setSearchQuery(String(state.query ?? ""));
            const nextStage = (state.filters as Record<string, unknown> | undefined)?.stage;
            setStageFilter(nextStage ? String(nextStage) : "");
            const nextView = (state.filters as Record<string, unknown> | undefined)?.view;
            if (nextView === "list" || nextView === "kanban") {
              setViewMode(nextView);
            }
          }}
          onSearchSelect={(query) => setSearchQuery(query)}
          reloadSignal={debouncedQuery}
        />
        {error ? <ErrorState message={error} onRetry={fetchList} /> : null}
        {viewMode === "kanban" ? (
          kanbanLoading ? (
            <LoadingState />
          ) : (
            <DealsBoard stages={kanbanStages} dealsByStage={dealsByStage} onDealMove={handleDealMove} onDealClick={(d) => { setDetailDealId(d.id); setDetailOpen(true); }} readOnly={!canEdit} />
          )
        ) : loading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyPlaceholderCard ctaLabel="Create Deal" onCtaClick={canEdit ? handleCreate : undefined} />
        ) : (
          <>
            <ResponsiveDataTable columns={columns as unknown as Array<{ header: string | React.ReactNode; accessor: string; render?: (row: Record<string, unknown>) => React.ReactNode }>} data={items as unknown as Record<string, unknown>[]} onView={(id) => { setDetailDealId(id); setDetailOpen(true); }} onEdit={canEdit ? handleEdit : undefined} onDelete={canEdit ? setDeleteConfirmId : undefined} mobileTitleAccessor="title" mobileSubtitleAccessor="value" />
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
          defaultValues={defaultValues ? { title: defaultValues.title, customer_id: defaultValues.customer_id ?? undefined, lead_id: defaultValues.lead_id ?? undefined, pipeline_stage_id: defaultValues.pipeline_stage_id ?? undefined, value: defaultValues.value ?? undefined, currency: defaultValues.currency, probability: defaultValues.probability ?? 0, expected_close_date: defaultValues.expected_close_date ?? undefined, status: defaultValues.status as "open" | "won" | "lost", notes: defaultValues.notes ?? undefined } : undefined}
          stages={stages}
          customFields={customFields}
          customFieldValues={customFieldValues}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </FormDialog>
      <DeleteConfirmModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleConfirmDelete} />
      <DeleteConfirmModal isOpen={bulkDeleteIds.length > 0} onClose={() => setBulkDeleteIds([])} onConfirm={handleConfirmBulkDelete} />
      <DealDetail deal={detailDealId ? (items.find((d) => d.id === detailDealId) ?? kanbanItems.find((d) => d.id === detailDealId) ?? null) : null} open={detailOpen} onOpenChange={setDetailOpen} stages={stages} onSave={() => { fetchList(); if (viewMode === "kanban") fetchKanban(); }} readOnly={!canEdit} />
    </>
  );
}
