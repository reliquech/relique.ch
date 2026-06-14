import { useState, useEffect, useCallback } from "react";
import { storage } from "@/lib/storage";

const MAX_RECENT_SEARCHES = 20;

export function useSearchHistory() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const searches = storage.admin.recentSearches.get();
    setRecentSearches(searches);
  }, []);

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const searches = storage.admin.recentSearches.get();
    const filtered = searches.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    storage.admin.recentSearches.set(updated);
    setRecentSearches(updated);
  }, []);

  const clearSearches = useCallback(() => {
    storage.admin.recentSearches.set([]);
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addSearch,
    clearSearches,
  };
}

