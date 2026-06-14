import { STORAGE_KEYS } from "./keys";
import { getJson, setJson } from "./json";

/**
 * Typed storage helpers for Content domain
 */

export function getContentBookmarks(): string[] {
  return getJson<string[]>(STORAGE_KEYS.CONTENT_BOOKMARKS, []);
}

export function setContentBookmarks(bookmarks: string[]): void {
  setJson(STORAGE_KEYS.CONTENT_BOOKMARKS, bookmarks);
}

export function addContentBookmark(id: string): void {
  const bookmarks = getContentBookmarks();
  if (!bookmarks.includes(id)) {
    setContentBookmarks([...bookmarks, id]);
  }
}

export function removeContentBookmark(id: string): void {
  const bookmarks = getContentBookmarks();
  setContentBookmarks(bookmarks.filter((b) => b !== id));
}

export function toggleContentBookmark(id: string): void {
  const bookmarks = getContentBookmarks();
  if (bookmarks.includes(id)) {
    removeContentBookmark(id);
  } else {
    addContentBookmark(id);
  }
}

