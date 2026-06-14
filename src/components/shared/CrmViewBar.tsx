"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Clock, Star, Share2 } from "lucide-react";
import { crmViewsService, type CrmSavedView, type CrmEntityType } from "@/admin/crm/services/crmViewsService";
import { useProfile } from "@/admin/users/hooks/useProfile";
import { crmSearchesService, type CrmRecentSearch } from "@/admin/crm/services/crmSearchesService";
import { crmFiltersService, type CrmSavedFilter } from "@/admin/crm/services/crmFiltersService";

interface CrmViewBarProps {
  entityType: CrmEntityType;
  getState: () => Record<string, unknown>;
  applyState: (state: Record<string, unknown>) => void;
  onSearchSelect?: (query: string) => void;
  reloadSignal?: string | number;
}

export function CrmViewBar({ entityType, getState, applyState, onSearchSelect, reloadSignal }: CrmViewBarProps) {
  const { userId } = useProfile();
  const [views, setViews] = useState<CrmSavedView[]>([]);
  const [filters, setFilters] = useState<CrmSavedFilter[]>([]);
  const [recentSearches, setRecentSearches] = useState<CrmRecentSearch[]>([]);
  const [viewName, setViewName] = useState("");
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [viewsData, searchesData, filtersData] = await Promise.all([
        crmViewsService.list(entityType),
        crmSearchesService.list(entityType),
        crmFiltersService.list(entityType),
      ]);
      setViews(viewsData);
      setRecentSearches(searchesData);
      setFilters(filtersData);
    } catch (error) {
      console.error("Failed to load CRM views:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [entityType, reloadSignal]);

  const handleSaveView = async () => {
    if (!viewName.trim()) return;
    try {
      const saved = await crmViewsService.create({
        entity_type: entityType,
        name: viewName.trim(),
        state: getState(),
      });
      setViews((prev) => [saved, ...prev]);
      setViewName("");
    } catch (error) {
      console.error("Failed to save view:", error);
    }
  };

  const handleDeleteView = async (id: string) => {
    try {
      await crmViewsService.remove(id);
      setViews((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error("Failed to delete view:", error);
    }
  };

  const handleSetDefault = async (view: CrmSavedView) => {
    if (view.user_id !== userId) return;
    try {
      const updated = await crmViewsService.update(view.id, { is_default: true });
      setViews((prev) => prev.map((v) => (v.id === view.id ? updated : { ...v, is_default: v.entity_type === view.entity_type ? false : v.is_default })));
    } catch (error) {
      console.error("Failed to set default:", error);
    }
  };

  const handleToggleShared = async (view: CrmSavedView) => {
    if (view.user_id !== userId) return;
    try {
      const updated = await crmViewsService.update(view.id, { shared: !view.shared });
      setViews((prev) => prev.map((v) => (v.id === view.id ? updated : v)));
    } catch (error) {
      console.error("Failed to toggle share:", error);
    }
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;
    try {
      const state = getState();
      const saved = await crmFiltersService.create({
        entity_type: entityType,
        name: filterName.trim(),
        query: typeof state.query === "string" ? state.query : null,
        filters: typeof state.filters === "object" ? (state.filters as Record<string, unknown>) : null,
      });
      setFilters((prev) => [saved, ...prev]);
      setFilterName("");
    } catch (error) {
      console.error("Failed to save filter:", error);
    }
  };

  const handleDeleteFilter = async (id: string) => {
    try {
      await crmFiltersService.remove(id);
      setFilters((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Failed to delete filter:", error);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Views
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>Saved views</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {views.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {loading ? "Loading..." : "No saved views"}
            </div>
          ) : (
            views.map((view) => (
              <div key={view.id} className="flex items-center justify-between gap-1 px-3 py-2 group">
                <button
                  onClick={() => applyState(view.state as Record<string, unknown>)}
                  className="flex-1 text-left text-sm hover:text-foreground flex items-center gap-1"
                >
                  {view.is_default ? <Star className="w-3.5 h-3.5 fill-current text-amber-500" /> : null}
                  {view.name}
                  {view.shared ? <Share2 className="w-3 h-3 text-muted-foreground" /> : null}
                </button>
                {view.user_id === userId ? (
                  <span className="flex items-center gap-0.5">
                    <button type="button" onClick={() => handleSetDefault(view)} className="text-xs text-muted-foreground hover:text-foreground" title="Set as default">★</button>
                    <button type="button" onClick={() => handleToggleShared(view)} className="text-xs text-muted-foreground hover:text-foreground" title={view.shared ? "Unshare" : "Share"}>⇗</button>
                    <button type="button" onClick={() => handleDeleteView(view.id)} className="text-xs text-muted-foreground hover:text-destructive">×</button>
                  </span>
                ) : null}
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>Saved filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filters.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {loading ? "Loading..." : "No saved filters"}
            </div>
          ) : (
            filters.map((filter) => (
              <div key={filter.id} className="flex items-center justify-between px-3 py-2">
                <button
                  onClick={() =>
                    applyState({
                      ...getState(),
                      query: filter.query ?? "",
                      filters: filter.filters ?? {},
                    })
                  }
                  className="flex-1 text-left text-sm hover:text-foreground"
                >
                  {filter.name}
                </button>
                <button
                  onClick={() => handleDeleteFilter(filter.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>Recent searches</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {recentSearches.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {loading ? "Loading..." : "No recent searches"}
            </div>
          ) : (
            recentSearches.map((search) => (
              <button
                key={search.id}
                onClick={() => onSearchSelect?.(search.query)}
                className="w-full px-3 py-2 text-left text-sm hover:text-foreground"
              >
                {search.query}
              </button>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          placeholder="Save view..."
          className="h-9 px-3 text-sm border border-input bg-background rounded-none w-32"
        />
        <Button variant="outline" size="sm" onClick={handleSaveView} disabled={!viewName.trim()}>
          Save
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Save filter..."
          className="h-9 px-3 text-sm border border-input bg-background rounded-none w-32"
        />
        <Button variant="outline" size="sm" onClick={handleSaveFilter} disabled={!filterName.trim()}>
          Save
        </Button>
      </div>
    </div>
  );
}
