"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { PipelineStageForm, type PipelineStageFormData } from "@/features/crm/components/PipelineStageForm";
import { PipelineStagesList } from "@/features/crm/components/PipelineStagesList";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { pipelineStagesService } from "@/features/crm/services/pipelineStagesService";
import type { PipelineStage } from "@/lib/types";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useProfile } from "@/features/users/hooks/useProfile";

export default function PipelineStagesPage() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role } = useProfile();
  const isAdmin = role === "admin";

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pipelineStagesService.list({ sort: "position" });
      setStages(res.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stages");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleFormSubmit = async (data: PipelineStageFormData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await pipelineStagesService.update(editingId, data);
        toast.success("Stage updated");
      } else {
        await pipelineStagesService.create(data);
        toast.success("Stage created");
      }
      setFormOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReorder = async (updates: { id: string; position: number }[]) => {
    const reordered = [...stages];
    for (const u of updates) {
      const idx = reordered.findIndex((s) => s.id === u.id);
      if (idx >= 0) reordered[idx] = { ...reordered[idx], position: u.position } as PipelineStage;
    }
    reordered.sort((a, b) => a.position - b.position);
    setStages(reordered);
    try {
      await Promise.all(updates.map((u) => pipelineStagesService.update(u.id, { position: u.position })));
      toast.success("Order updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder");
      fetchList();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await pipelineStagesService.delete(deleteConfirmId);
      toast.success("Stage deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
    setDeleteConfirmId(null);
  };

  const defaultValues = editingId ? stages.find((s) => s.id === editingId) : undefined;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Pipeline Stages"
          children={
            isAdmin ? (
              <button
                type="button"
                onClick={handleCreate}
                className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                <Plus className="w-4 h-4" /> Add stage
              </button>
            ) : null
          }
        />
        {error ? (
          <ErrorState message={error} onRetry={fetchList} />
        ) : loading ? (
          <LoadingState />
        ) : stages.length === 0 ? (
          <EmptyPlaceholderCard ctaLabel="Add stage" onCtaClick={isAdmin ? handleCreate : undefined} />
        ) : (
          <PipelineStagesList stages={stages} onReorder={handleReorder} onEdit={handleEdit} onDelete={setDeleteConfirmId} readOnly={!isAdmin} />
        )}
      </div>
      {isAdmin ? (
        <>
          <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingId ? "Edit stage" : "Add stage"}>
            <PipelineStageForm
              defaultValues={defaultValues ? { name: defaultValues.name, position: defaultValues.position, color: defaultValues.color ?? undefined, is_default: defaultValues.is_default } : undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => setFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          </FormDialog>
          <DeleteConfirmModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleConfirmDelete} />
        </>
      ) : null}
    </>
  );
}
