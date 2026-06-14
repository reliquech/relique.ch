"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Columns, Eye } from "lucide-react";
import { useTableViews } from "@/hooks/useTableViews";
import type { ColumnDef } from "@tanstack/react-table";

type TablePersonalizationProps<T> = {
  columns: ColumnDef<T>[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
};

export function TablePersonalization<T>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: TablePersonalizationProps<T>) {
  const { savedViews, saveView, deleteView, applyView } = useTableViews();
  const [viewName, setViewName] = useState("");

  const handleToggleColumn = (columnId: string, checked: boolean) => {
    const updated = { ...columnVisibility, [columnId]: checked };
    onColumnVisibilityChange(updated);
  };

  const handleSaveView = () => {
    if (!viewName.trim()) return;
    saveView({
      name: viewName,
      columnVisibility,
    });
    setViewName("");
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Columns className="h-4 w-4 mr-2" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) => {
            const id = (column.id || ("accessorKey" in column ? column.accessorKey : undefined)) as string | undefined;
            if (!id || id === "actions") return null;
            return (
              <DropdownMenuCheckboxItem
                key={id}
                checked={columnVisibility[id] !== false}
                onCheckedChange={(checked) => handleToggleColumn(id, checked)}
              >
                {String(column.header || id)}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {savedViews.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Views
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Saved views</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {savedViews.map((view) => (
              <div key={view.id} className="flex items-center justify-between px-2 py-1.5">
                <button
                  onClick={() => applyView(view)}
                  className="flex-1 text-left text-sm hover:text-foreground"
                >
                  {view.name}
                </button>
                <button
                  onClick={() => deleteView(view.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Save view..."
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSaveView();
            }
          }}
          className="h-9 px-3 text-sm border border-input bg-background rounded-none w-32"
        />
        <Button variant="outline" size="sm" onClick={handleSaveView} disabled={!viewName.trim()}>
          Save
        </Button>
      </div>
    </div>
  );
}

