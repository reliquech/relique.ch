import { STORAGE_KEYS, STORAGE_LIMITS } from "./keys";
import { getJson, setJson } from "./json";
import { pruneByLimit } from "./utils";

/**
 * Typed storage helpers for Marketplace domain
 */

export function getMarketplaceFavorites(): string[] {
  return getJson<string[]>(STORAGE_KEYS.MARKETPLACE_FAVORITES, []);
}

export function setMarketplaceFavorites(favorites: string[]): void {
  // Cap to reasonable limit
  const capped = pruneByLimit(favorites, 100);
  setJson(STORAGE_KEYS.MARKETPLACE_FAVORITES, capped);
}

export function addMarketplaceFavorite(id: string): void {
  const favorites = getMarketplaceFavorites();
  if (!favorites.includes(id)) {
    setMarketplaceFavorites([...favorites, id]);
  }
}

export function removeMarketplaceFavorite(id: string): void {
  const favorites = getMarketplaceFavorites();
  setMarketplaceFavorites(favorites.filter((f) => f !== id));
}

export function toggleMarketplaceFavorite(id: string): void {
  const favorites = getMarketplaceFavorites();
  if (favorites.includes(id)) {
    removeMarketplaceFavorite(id);
  } else {
    addMarketplaceFavorite(id);
  }
}

import type { SavedSearch } from "../contracts/marketplace.contract";

export function getSavedSearches(): SavedSearch[] {
  return getJson<SavedSearch[]>(STORAGE_KEYS.MARKETPLACE_SAVED_SEARCHES, []);
}

export function setSavedSearches(searches: SavedSearch[]): void {
  const capped = pruneByLimit(searches, STORAGE_LIMITS.SAVED_SEARCHES);
  setJson(STORAGE_KEYS.MARKETPLACE_SAVED_SEARCHES, capped);
}

export function addSavedSearch(search: SavedSearch): void {
  const searches = getSavedSearches();
  setSavedSearches([...searches, search]);
}

