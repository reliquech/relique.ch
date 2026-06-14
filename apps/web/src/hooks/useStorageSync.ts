import { useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";

type StorageSyncCallback = (key: string, newValue: string | null) => void;

export function useStorageSync(
  keys: string[],
  callback: StorageSyncCallback,
  debounceMs: number = 300
) {
  const handleStorageChange = useCallback(
    (e: StorageEvent) => {
      if (e.key && keys.some((k) => e.key?.startsWith(k))) {
        callback(e.key, e.newValue);
      }
    },
    [keys, callback]
  );

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [handleStorageChange]);
}

