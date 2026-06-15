"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MarketplaceFormData } from "@/features/marketplace/schema";
import { updateMarketplaceItem } from "@/features/marketplace/services/marketplaceEditorService";

export type AutosaveState = "idle" | "dirty" | "saving" | "saved" | "failed" | "offline";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isMarketplaceItemId(id?: string): id is string {
  return Boolean(id && UUID_RE.test(id));
}

interface UseMarketplaceAutosaveProps {
  itemId?: string;
  values: MarketplaceFormData;
  dirty: boolean;
  online: boolean;
  enabled: boolean;
  uploading: boolean;
}

export function useMarketplaceAutosave({
  itemId,
  values,
  dirty,
  online,
  enabled,
  uploading,
}: UseMarketplaceAutosaveProps) {
  const [state, setState] = useState<AutosaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const requestSeqRef = useRef(0);
  const valuesSnapshot = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    if (!enabled || !dirty) {
      setState("idle");
      return;
    }
    if (!isMarketplaceItemId(itemId)) {
      setState("dirty");
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

    const timer = window.setTimeout(() => {
      const seq = ++requestSeqRef.current;
      setState("saving");

      const payload = JSON.parse(valuesSnapshot) as MarketplaceFormData;

      updateMarketplaceItem(itemId, payload)
        .then(() => {
          if (requestSeqRef.current === seq) {
            setState("saved");
            setLastSavedAt(new Date());
          }
        })
        .catch(() => {
          if (requestSeqRef.current === seq) setState("failed");
        });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [dirty, enabled, itemId, online, uploading, valuesSnapshot]);

  return { state, lastSavedAt };
}
