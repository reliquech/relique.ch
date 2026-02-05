"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type VisibilityState,
  type Updater,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerifyHistoryEntry } from "@relique/shared/domain";
import type { ConsignDraft, ConsignSubmission } from "@/lib/schemas/consign";
import { storage } from "@/lib/storage";
import type { SubmissionRow } from "./SubmissionsTable";

type SubmissionsTableWithColumnsProps = {
  data: SubmissionRow[];
  columns: ColumnDef<SubmissionRow>[];
  onView: (row: SubmissionRow) => void;
  onDuplicate?: (row: SubmissionRow) => void;
  onDelete?: (row: SubmissionRow) => void;
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
};

export function SubmissionsTableWithColumns({
  data,
  columns,
  onView,
  onDuplicate,
  onDelete,
  columnVisibility,
  onColumnVisibilityChange,
}: SubmissionsTableWithColumnsProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const handleColumnVisibilityChange = (updaterOrValue: Updater<VisibilityState>) => {
    const newValue = typeof updaterOrValue === "function" ? updaterOrValue(columnVisibility) : updaterOrValue;
    onColumnVisibilityChange(newValue);
  };

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility, globalFilter },
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-3">
      <input
        className={cn(
          "h-10 w-full max-w-sm rounded-none border border-input bg-background px-3 text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        )}
        placeholder="Search submissions..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        aria-label="Search table"
      />

      <div className="border border-border rounded-none overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  if (!header.column.getIsVisible()) return null;
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-3 text-left font-medium text-muted-foreground py-3",
                        canSort && "cursor-pointer select-none hover:text-foreground"
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      scope="col"
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder 
                          ? null 
                          : typeof header.column.columnDef.header === "function"
                          ? header.column.columnDef.header(header.getContext())
                          : header.column.columnDef.header}
                        {sorted ? <span className="text-foreground">{sorted === "asc" ? "↑" : "↓"}</span> : null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-muted-foreground" colSpan={columns.length}>
                  No results.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-muted/10">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3 text-foreground">
                      {cell.column.columnDef.cell ? (
                        typeof cell.column.columnDef.cell === "function" ? (
                          cell.column.columnDef.cell(cell.getContext())
                        ) : (
                          cell.column.columnDef.cell
                        )
                      ) : (
                        String(cell.getValue() ?? "")
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 px-3 border border-border bg-background rounded-none text-sm disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <button
            type="button"
            className="h-9 px-3 border border-border bg-background rounded-none text-sm disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

