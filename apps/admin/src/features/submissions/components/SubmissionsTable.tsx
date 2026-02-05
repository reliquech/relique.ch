"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { VerifyHistoryEntry } from "@relique/shared/domain";
import type { ConsignDraft, ConsignSubmission } from "@/lib/schemas/consign";
import { storage } from "@/lib/storage";
import { SubmissionsTableWithColumns } from "./SubmissionsTableWithColumns";
import { useSubmissionsColumns } from "./useSubmissionsColumns";

export type SubmissionRow = {
  id: string;
  type: "verify" | "consign";
  reference: string;
  itemName: string;
  status: string;
  dateUpdated: number;
  data: VerifyHistoryEntry | ConsignDraft | ConsignSubmission;
};

type SubmissionsTableProps = {
  data: SubmissionRow[];
  onView: (row: SubmissionRow) => void;
  onDuplicate?: (row: SubmissionRow) => void;
  onDelete?: (row: SubmissionRow) => void;
  columns?: ColumnDef<SubmissionRow>[];
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
};

export function SubmissionsTable({
  data,
  onView,
  onDuplicate,
  onDelete,
  columns: externalColumns,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange: externalOnColumnVisibilityChange,
}: SubmissionsTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = storage.admin.views.columns.get();
    setColumnVisibility(saved);
  }, []);

  const defaultColumns = useSubmissionsColumns(onView, onDuplicate, onDelete);
  const columns = externalColumns || defaultColumns;

  const currentColumnVisibility = externalColumnVisibility ?? columnVisibility;
  const handleColumnVisibilityChange = externalOnColumnVisibilityChange ?? ((visibility: Record<string, boolean>) => {
    setColumnVisibility(visibility);
    storage.admin.views.columns.set(visibility);
  });

  return (
    <SubmissionsTableWithColumns
      data={data}
      columns={columns}
      onView={onView}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      columnVisibility={currentColumnVisibility}
      onColumnVisibilityChange={handleColumnVisibilityChange}
    />
  );
}

