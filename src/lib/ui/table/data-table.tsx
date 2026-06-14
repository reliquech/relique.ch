"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "../cn";
import { ErrorState } from "../states/error-state";
import { Skeleton } from "../states/skeletons";

export type DataTableDensity = "comfortable" | "compact";

export type DataTableProps<TData> = {
  data: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  error?: { title?: string; description?: string } | null;
  globalSearch?: boolean;
  globalSearchPlaceholder?: string;
  pageSize?: number;
  density?: DataTableDensity;
  className?: string;
};

export function DataTable<TData>({
  data,
  columns,
  loading,
  error,
  globalSearch = true,
  globalSearchPlaceholder = "Search…",
  pageSize = 10,
  density = "comfortable",
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  if (error) {
    return <ErrorState title={error.title} description={error.description} className={className} />;
  }

  const pad = density === "compact" ? "py-2" : "py-3";

  return (
    <div className={cn("space-y-3", className)}>
      {globalSearch ? (
        <input
          className={cn(
            "h-10 w-full max-w-sm rounded-none border border-input bg-background px-3 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          )}
          placeholder={globalSearchPlaceholder}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          aria-label="Search table"
        />
      ) : null}

      <div className="border border-border rounded-none overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-3 text-left font-medium text-muted-foreground",
                        pad,
                        canSort && "cursor-pointer select-none hover:text-foreground"
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      scope="col"
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted ? <span className="text-foreground">{sorted === "asc" ? "↑" : "↓"}</span> : null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  {table.getAllLeafColumns().map((c) => (
                    <td key={c.id} className={cn("px-3", pad)}>
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-muted-foreground" colSpan={table.getAllLeafColumns().length}>
                  No results.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-muted/10">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn("px-3 text-foreground", pad)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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


