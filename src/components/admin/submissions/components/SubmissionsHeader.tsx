"use client";

import { Button } from "@/components/ui/button";
import { Download, X, Filter } from "lucide-react";
import { TablePersonalization } from "./TablePersonalization";
import type { ColumnDef } from "@tanstack/react-table";
import type { SubmissionRow } from "./SubmissionsTable";

type SubmissionsHeaderProps = {
  columns: ColumnDef<SubmissionRow>[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
  onExport?: () => void;
  onClearFilters?: () => void;
  hasFilters?: boolean;
};

export function SubmissionsHeader({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  onExport,
  onClearFilters,
  hasFilters = false,
}: SubmissionsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
        <TablePersonalization
          columns={columns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      </div>
      <div className="flex items-center gap-2">
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}

