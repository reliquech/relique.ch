"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import DataTable from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { TaskForm, type TaskFormData } from "@/features/tasks/components/TaskForm";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { tasksService } from "@/features/tasks/services/tasksService";
import type { Task } from "@/lib/types";
import { getStatusPill } from "@/lib/utils/admin";
import { useProfile } from "@/features/users/hooks/useProfile";
import { toast } from "sonner";

export default function TasksPage() {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"open" | "done" | "all">("open");
  const [dueFilter, setDueFilter] = useState<"" | "overdue" | "today" | "upcoming">("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"due_at" | "created_at" | "priority">("due_at");
  const { role } = useProfile();
  const canEdit = role === "admin" || role === "editor";
  const searchParams = useSearchParams();
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, dueFilter]);

  useEffect(() => {
    if (canEdit && searchParams.get("create") === "1") {
      setFormOpen(true);
    }
  }, [canEdit, searchParams]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksService.list({
        status: statusFilter === "all" ? undefined : statusFilter,
        due: dueFilter || undefined,
        page,
        pageSize,
      });
      setItems(res.items);
      setTotalPages(res.totalPages);
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dueFilter, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      let dueAt: string | null = null;
      if (data.due_at) {
        const [year, month, day] = data.due_at.split("-").map(Number);
        if (year && month && day) {
          dueAt = new Date(year, month - 1, day).toISOString();
        }
      }
      const payload = {
        ...data,
        due_at: dueAt,
        entity_type: data.entity_type || null,
        entity_id: data.entity_id || null,
      };
      if (editingId) {
        await tasksService.update(editingId, payload);
        toast.success("Task updated");
      } else {
        await tasksService.create(payload);
        toast.success("Task created");
      }
      setFormOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDone = async (task: Task) => {
    if (task.status === "done") return;
    try {
      await tasksService.update(task.id, { status: "done" });
      toast.success("Task completed");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await tasksService.remove(deleteConfirmId);
      toast.success("Task deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    }
    setDeleteConfirmId(null);
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, id]));
      return prev.filter((item) => item !== id);
    });
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

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

  const handleBulkDone = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => tasksService.update(id, { status: "done" })));
      toast.success("Tasks marked as done");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update tasks");
    }
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    setBulkDeleteIds(selectedIds);
  };

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteIds.length) return;
    try {
      await Promise.all(bulkDeleteIds.map((id) => tasksService.remove(id)));
      toast.success("Tasks deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete tasks");
    } finally {
      setBulkDeleteIds([]);
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
        aria-label="Select all tasks"
      />
    );

    return [
      {
        header: headerCheckbox,
        accessor: "select",
        render: (r: Task) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(r.id)}
            onChange={(e) => toggleSelect(r.id, e.target.checked)}
            className="h-4 w-4"
            aria-label={`Select task ${r.title}`}
          />
        ),
      },
      {
        header: "Title",
        accessor: "title",
        render: (r: Task) => <span className="font-semibold text-white">{r.title}</span>,
      },
      {
        header: "Status",
        accessor: "status",
        render: (r: Task) => getStatusPill(r.status),
      },
      {
        header: "Priority",
        accessor: "priority",
        render: (r: Task) => {
          const color =
            r.priority === "high"
              ? "bg-destructive/15 text-destructive"
              : r.priority === "medium"
                ? "bg-warning/15 text-warning"
                : "bg-success/15 text-success";
          return (
            <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${color}`}>
              {r.priority}
            </span>
          );
        },
      },
      {
        header: "Related",
        accessor: "entity_id",
        render: (r: Task) => {
          if (!r.entity_type || !r.entity_id) return <span className="text-gray-500">—</span>;
          const typeLabel = r.entity_type.charAt(0).toUpperCase() + r.entity_type.slice(1);
          const shortId = r.entity_id.slice(0, 8);
          const href = `/admin/${r.entity_type === "message" ? "messages" : `${r.entity_type}s`}`;
          return (
            <Link href={href} className="text-primary text-xs hover:underline">
              {typeLabel} · {shortId}
            </Link>
          );
        },
      },
      {
        header: "Due",
        accessor: "due_at",
        render: (r: Task) => {
          const dueDate = r.due_at ? new Date(r.due_at) : null;
          const isOverdue =
            r.status === "open" &&
            dueDate &&
            dueDate.getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime();
          return (
            <div className="flex flex-col gap-1">
              <span className={`text-sm ${isOverdue ? "text-destructive" : "text-gray-400"}`}>
                {dueDate ? dueDate.toLocaleDateString() : "—"}
              </span>
              {isOverdue && (
                <span className="text-[10px] uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-full w-fit">
                  Overdue
                </span>
              )}
            </div>
          );
        },
      },
    ];
  }, [allSelected, items, selectedIds]);

  const getRowClassName = (task: Task) => {
    if (task.status !== "open" || !task.due_at) return "";
    const dueDate = new Date(task.due_at);
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const isOverdue = dueDate.getTime() < startOfToday.getTime();
    return isOverdue ? "bg-destructive/5 hover:bg-destructive/10" : "";
  };

  const sortedItems = useMemo(() => {
    if (sortBy === "priority") {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return [...items].sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    }
    if (sortBy === "created_at") {
      return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...items].sort((a, b) => {
      if (!a.due_at && !b.due_at) return 0;
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });
  }, [items, sortBy]);

  const stats = useMemo(() => {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);
    let overdue = 0;
    let today = 0;
    let upcoming = 0;

    items.forEach((task) => {
      if (!task.due_at || task.status === "done") return;
      const due = new Date(task.due_at);
      if (due < startOfDay) overdue += 1;
      else if (due >= startOfDay && due < endOfDay) today += 1;
      else if (due >= endOfDay) upcoming += 1;
    });

    return { overdue, today, upcoming };
  }, [items]);

  const defaultValues = editingId ? items.find((t) => t.id === editingId) : undefined;
  const formDefaults = defaultValues
    ? {
        title: defaultValues.title,
        description: defaultValues.description ?? undefined,
        status: defaultValues.status,
        priority: defaultValues.priority,
        due_at: defaultValues.due_at ? new Date(defaultValues.due_at).toISOString().split("T")[0] : undefined,
        entity_type: defaultValues.entity_type ?? undefined,
        entity_id: defaultValues.entity_id ?? undefined,
      }
    : undefined;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Tasks"
          children={
            <>
              {selectedIds.length > 0 ? (
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
                  <button
                    type="button"
                    onClick={handleBulkDone}
                    className="bg-success/10 text-success px-3 py-2 rounded-lg text-xs font-bold"
                  >
                    Mark done
                  </button>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs font-bold"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              ) : null}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "open" | "done" | "all")}
                className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="open">Open</option>
                <option value="done">Done</option>
                <option value="all">All</option>
              </select>
              <select
                value={dueFilter}
                onChange={(e) => setDueFilter(e.target.value as "" | "overdue" | "today" | "upcoming")}
                className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">All due dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due today</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "due_at" | "created_at" | "priority")}
                className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="due_at">Sort by due date</option>
                <option value="created_at">Sort by created</option>
                <option value="priority">Sort by priority</option>
              </select>
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Plus className="w-4 h-4" /> Create Task
                </button>
              ) : null}
            </>
          }
        />

        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <span className="bg-white/5 border border-border px-3 py-1 rounded-full">
            Overdue: <strong className="text-destructive">{stats.overdue}</strong>
          </span>
          <span className="bg-white/5 border border-border px-3 py-1 rounded-full">
            Today: <strong className="text-white">{stats.today}</strong>
          </span>
          <span className="bg-white/5 border border-border px-3 py-1 rounded-full">
            Upcoming: <strong className="text-white">{stats.upcoming}</strong>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500">This page only</span>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchList} />
        ) : loading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyPlaceholderCard ctaLabel="Create Task" onCtaClick={canEdit ? handleCreate : undefined} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={sortedItems}
              getRowClassName={getRowClassName}
              onComplete={handleMarkDone}
              isCompleteDisabled={(row: Task) => row.status === "done"}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? setDeleteConfirmId : undefined}
            />
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded bg-white/5 disabled:opacity-50 text-sm"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-400">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded bg-white/5 disabled:opacity-50 text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingId ? "Edit Task" : "Create Task"}>
        <TaskForm
          defaultValues={formDefaults}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </FormDialog>

      <DeleteConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
      />
      <DeleteConfirmModal
        isOpen={bulkDeleteIds.length > 0}
        onClose={() => setBulkDeleteIds([])}
        onConfirm={handleConfirmBulkDelete}
      />
    </>
  );
}
