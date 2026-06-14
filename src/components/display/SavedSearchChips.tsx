"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bookmark, Plus, X, Check } from "lucide-react";
import { getSavedSearches, setSavedSearches, type SavedSearch } from "@/lib/domain";
import type { MarketplaceFilters } from "@/lib/types";
import { toast } from "sonner";

interface SavedSearchChipsProps {
  currentFilters: MarketplaceFilters;
  onApplySearch: (filters: MarketplaceFilters) => void;
}

export function SavedSearchChips({ currentFilters, onApplySearch }: SavedSearchChipsProps) {
  const [savedSearches, setLocalSavedSearches] = useState<SavedSearch[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  useEffect(() => {
    const searches = getSavedSearches();
    setLocalSavedSearches(searches);
  }, []);

  const hasActiveFilters = Object.values(currentFilters).some(Boolean);

  const handleSaveSearch = () => {
    if (!newSearchName.trim()) return;

    const newSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name: newSearchName.trim(),
      query: currentFilters.search,
      filters: currentFilters,
      createdAt: Date.now(),
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    setLocalSavedSearches(updated);
    setNewSearchName("");
    setSaveDialogOpen(false);
    toast.success(`Search "${newSearchName}" saved`);
  };

  const handleDeleteSearch = (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updated);
    setLocalSavedSearches(updated);
    toast.success("Search deleted");
  };

  const handleApplySearch = (search: SavedSearch) => {
    onApplySearch(search.filters || {});
    toast.success(`Applied "${search.name}" filters`);
  };

  if (savedSearches.length === 0 && !hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {savedSearches.map((search) => (
        <Badge
          key={search.id}
          variant="outline"
          className="cursor-pointer hover:bg-accent group flex items-center gap-1 px-3 py-1"
          onClick={() => handleApplySearch(search)}
        >
          <Bookmark className="w-3 h-3 mr-1" />
          {search.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSearch(search.id);
            }}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {hasActiveFilters && (
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-7">
              <Plus className="w-3 h-3 mr-1" />
              Save Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current Search</DialogTitle>
              <DialogDescription>
                Give this search a name to quickly apply it later
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="e.g., High value sports items"
                value={newSearchName}
                onChange={(e) => setNewSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveSearch();
                }}
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Current filters:</p>
                <ul className="list-disc list-inside space-y-1">
                  {currentFilters.search && <li>Search: "{currentFilters.search}"</li>}
                  {currentFilters.category && <li>Category: {currentFilters.category}</li>}
                  {currentFilters.sport && <li>Sport: {currentFilters.sport}</li>}
                  {currentFilters.signedBy && <li>Signed by: {currentFilters.signedBy}</li>}
                  {currentFilters.status && <li>Status: {currentFilters.status}</li>}
                  {currentFilters.coaIssuer && <li>COA: {currentFilters.coaIssuer}</li>}
                  {currentFilters.priceMin && <li>Min price: ${currentFilters.priceMin}</li>}
                  {currentFilters.priceMax && <li>Max price: ${currentFilters.priceMax}</li>}
                </ul>
              </div>
              <Button onClick={handleSaveSearch} disabled={!newSearchName.trim()} className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Save Search
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

