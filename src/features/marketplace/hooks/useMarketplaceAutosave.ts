"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketplaceFormData } from "@/features/marketplace/schema";
import {
  createMarketplaceDraft,
  updateMarketplaceItem,
} from "@/features/marketplace/services/marketplaceEditorService";

export type AutosaveState = "idle" | "dirty" | "saving" | "saved" | "failed" | "offline";

interface UseMarketplaceAutosaveProps {
  itemId?: string;
  values: MarketplaceFormData;
  dirty: boolean;
  online: boolean;
  enabled: boolean;
  uploading: boolean;
  onDraftCreated?: (id: string) => void;
}

export function useMarketplaceAutosave({
  itemId,
  values,
  dirty,
  online,
  enabled,
  uploading,
  onDraftCreated,
}: UseMarketplaceAutosaveProps) {
  const [state, setState] = useState<AutosaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const requestSeqRef = useRef(0);
  const createdIdRef = useRef<string | undefined>(itemId);
  const createPromiseRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    createdIdRef.current = itemId ?? createdIdRef.current;
  }, [itemId]);

  useEffect(() => {
    if (!enabled || !dirty) {
      if (!dirty && state === "dirty") setState("idle");
      return;
    }
    if (!online) {
      setState("offline");
      return;
    }
    if (uploading) {
      setState("dirty");
      return;
    }

    setState("dirty");
    const timer = window.setTimeout(() => {
      const seq = requestSeqRef.current + 1;
      requestSeqRef.current = seq;
      setState("saving");

      const save = async () => {
        const currentId = createdIdRef.current;
        if (currentId) {
          await updateMarketplaceItem(currentId, values);
          return currentId;
        }

        if (!createPromiseRef.current) {
          createPromiseRef.current = createMarketplaceDraft(values).then((result) => {
            createdIdRef.current = result.id;
            onDraftCreated?.(result.id);
            return result.id;
          });
        }

        return createPromiseRef.current;
      };

      save()
        .then(() => {
          if (requestSeqRef.current === seq) {
            setState("saved");
            setLastSavedAt(new Date());
          }
        })
        .catch(() => {
          if (requestSeqRef.current === seq) setState("failed");
        })
        .finally(() => {
          createPromiseRef.current = null;
        });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [dirty, enabled, online, onDraftCreated, state, uploading, values]);

  return { state, lastSavedAt };
}
