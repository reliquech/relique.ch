import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";

export type SavedView = {
  id: string;
  name: string;
  filters?: unknown;
  sort?: unknown;
  columnVisibility?: Record<string, boolean>;
  pageSize?: number;
  createdAt: number;
};

export function useTableViews() {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const views = storage.admin.views.saved.get();
    const columns = storage.admin.views.columns.get();
    setSavedViews(views);
    setColumnVisibility(columns);
  }, []);

  const saveView = (view: Omit<SavedView, "id" | "createdAt">) => {
    const newView: SavedView = {
      ...view,
      id: `view-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [...savedViews, newView].slice(-10);
    storage.admin.views.saved.set(updated);
    setSavedViews(updated);
  };

  const deleteView = (id: string) => {
    const updated = savedViews.filter((v) => v.id !== id);
    storage.admin.views.saved.set(updated);
    setSavedViews(updated);
  };

  const updateColumnVisibility = (visibility: Record<string, boolean>) => {
    storage.admin.views.columns.set(visibility);
    setColumnVisibility(visibility);
  };

  const applyView = (view: SavedView) => {
    if (view.columnVisibility) {
      updateColumnVisibility(view.columnVisibility);
    }
    return view;
  };

  return {
    savedViews,
    columnVisibility,
    saveView,
    deleteView,
    updateColumnVisibility,
    applyView,
  };
}

