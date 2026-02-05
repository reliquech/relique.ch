"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { CustomFieldForm, type CustomFieldFormData } from "@/features/crm/components/CustomFieldForm";
import { customFieldsService } from "@/features/crm/services/customFieldsService";
import type { CustomField } from "@/lib/types";
import { toast } from "sonner";
import { useProfile } from "@/features/users/hooks/useProfile";

export default function CustomFieldsPage() {
  const [items, setItems] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomField | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role } = useProfile();
  const canEdit = role === "admin" || role === "editor";

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customFieldsService.list();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load custom fields");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (field: CustomField) => {
    setEditing(field);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CustomFieldFormData) => {
    setIsSubmitting(true);
    try {
      if (editing) {
        await customFieldsService.update(editing.id, data);
        toast.success("Custom field updated");
      } else {
        await customFieldsService.create(data);
        toast.success("Custom field created");
      }
      setFormOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save custom field");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await customFieldsService.remove(deleteId);
      toast.success("Custom field deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete field");
    } finally {
      setDeleteId(null);
    }
  };

  const handleExport = async () => {
    try {
      const entity = entityTab || undefined;
      const data = await customFieldsService.exportTemplate(entity);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `custom-fields-${entity || "all"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      toast.error("Paste JSON template");
      return;
    }
    setImporting(true);
    try {
      const fields = JSON.parse(importJson) as Array<Record<string, unknown>>;
      await customFieldsService.importTemplate({
        mode: importMode,
        entity_type: entityTab || undefined,
        fields: fields as unknown as Parameters<typeof customFieldsService.importTemplate>[0]["fields"],
      });
      toast.success("Import completed");
      setImportOpen(false);
      setImportJson("");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const [entityTab, setEntityTab] = useState<"customer" | "lead" | "deal" | "message" | "">("");
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "overwrite">("merge");
  const [importing, setImporting] = useState(false);

  const filteredItems = useMemo(() => {
    if (!entityTab) return items;
    return items.filter((i) => i.entity_type === entityTab);
  }, [items, entityTab]);

  const columns = useMemo(() => {
    return [
      { header: "Name", accessor: "name", render: (r: CustomField) => <span className="font-semibold text-white">{r.name}</span> },
      { header: "Key", accessor: "key", render: (r: CustomField) => <span className="text-gray-400 text-xs">{r.key}</span> },
      { header: "Entity", accessor: "entity_type", render: (r: CustomField) => <span className="text-gray-300 capitalize">{r.entity_type}</span> },
      { header: "Group", accessor: "group", render: (r: CustomField) => <span className="text-gray-500 text-xs">{r.group ?? "—"}</span> },
      { header: "Type", accessor: "field_type", render: (r: CustomField) => <span className="text-gray-300">{r.field_type}</span> },
      { header: "Required", accessor: "required", render: (r: CustomField) => <span className="text-gray-400 text-xs">{r.required ? "Yes" : "No"}</span> },
      { header: "Position", accessor: "position", render: (r: CustomField) => <span className="text-gray-500 text-xs">{r.position}</span> },
    ];
  }, []);

  const defaultValues = editing
    ? {
        name: editing.name,
        key: editing.key,
        entity_type: editing.entity_type,
        field_type: editing.field_type,
        required: editing.required,
        options: editing.options ?? undefined,
        position: editing.position,
        group: editing.group ?? undefined,
        visibility_rules: editing.visibility_rules ?? undefined,
      }
    : undefined;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Custom Fields"
          children={
            canEdit ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleExport} className="border border-border text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                  Export
                </button>
                <button type="button" onClick={() => setImportOpen(true)} className="border border-border text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                  Import
                </button>
                <button type="button" onClick={handleCreate} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold">
                  New Field
                </button>
              </div>
            ) : null
          }
        />

        <div className="flex gap-2 border-b border-border pb-2">
          {(["", "customer", "lead", "deal", "message"] as const).map((e) => (
            <button
              key={e || "all"}
              type="button"
              onClick={() => setEntityTab(e)}
              className={`px-3 py-1.5 rounded text-xs font-medium ${entityTab === e ? "bg-primary text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
            >
              {e ? e.charAt(0).toUpperCase() + e.slice(1) : "All"}
            </button>
          ))}
        </div>

        {error && <ErrorState title="Failed to load" message={error} />}

        {loading ? (
          <LoadingState />
        ) : filteredItems.length === 0 ? (
          <EmptyPlaceholderCard ctaLabel="Create Field" onCtaClick={canEdit ? handleCreate : undefined} />
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            onEdit={
              canEdit
                ? (id: string) => {
                    const field = items.find((item) => item.id === id);
                    if (field) handleEdit(field);
                  }
                : undefined
            }
            onDelete={canEdit ? (id: string) => setDeleteId(id) : undefined}
          />
        )}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "Edit Field" : "Create Field"}>
        <CustomFieldForm
          defaultValues={defaultValues}
          disableEntityType={!!editing}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </FormDialog>

      <DeleteConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleConfirmDelete} />

      {canEdit && (
        <FormDialog open={importOpen} onOpenChange={setImportOpen} title="Import template">
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm">Mode</label>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as "merge" | "overwrite")}
                className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
              >
                <option value="merge">Merge (keep existing, add/update by key)</option>
                <option value="overwrite">Overwrite (replace entity)</option>
              </select>
            </div>
            <div>
              <label className="text-gray-300 text-sm">JSON template</label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full h-40 bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1 font-mono"
                placeholder={'[{ "entity_type": "customer", "name": "...", "key": "...", "field_type": "text" }]'}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setImportOpen(false)} className="flex-1 border border-border text-gray-300 py-2 rounded-lg text-sm">
                Cancel
              </button>
              <button type="button" onClick={handleImport} disabled={importing} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </FormDialog>
      )}
    </>
  );
}
