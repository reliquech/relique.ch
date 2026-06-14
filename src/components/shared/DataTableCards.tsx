"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface Column {
  header: string | React.ReactNode;
  accessor: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableCardsProps {
  columns: Column[];
  data: Record<string, unknown>[];
  titleColumn?: string;
  subtitleColumn?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
}

export function DataTableCards({
  columns,
  data,
  titleColumn,
  subtitleColumn,
  onRowClick,
}: DataTableCardsProps) {
  const titleAcc = titleColumn ?? columns[0]?.accessor ?? "id";
  const subtitleAcc = subtitleColumn ?? columns[1]?.accessor;

  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 italic rounded-xl border border-border bg-surface">
        No records found.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:hidden">
      {data.map((row) => {
        const titleCol = columns.find((c) => c.accessor === titleAcc);
        const subtitleCol = subtitleAcc ? columns.find((c) => c.accessor === subtitleAcc) : null;
        const title = titleCol?.render ? titleCol.render(row) : String(row[titleAcc] ?? "");
        const subtitle = subtitleCol?.render ? subtitleCol.render(row) : subtitleAcc ? String(row[subtitleAcc] ?? "") : null;
        return (
          <button
            key={String(row.id)}
            type="button"
            onClick={() => onRowClick?.(row)}
            className="w-full text-left p-4 rounded-xl border border-border bg-surface hover:bg-white/5 transition-colors flex items-center justify-between gap-2"
          >
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-white truncate">{title}</div>
              {subtitle != null && <div className="text-sm text-gray-400 truncate mt-0.5">{subtitle}</div>}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
