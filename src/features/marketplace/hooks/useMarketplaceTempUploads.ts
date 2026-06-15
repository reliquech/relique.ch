"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TEMP_UPLOAD_TTL_MS } from "@/features/marketplace/constants";

type StoredSession = {
  sessionId: string;
  createdAt: number;
  lastTouchedAt: number;
  paths: string[];
};

type FinalizeResponse = {
  files: { from: string; to: string; url: string }[];
  errors?: { path: string; message: string }[];
};

export type MarketplaceUploadQueueItem = {
  id: string;
  path: string;
  progress: number;
  status: "queued" | "uploading" | "uploaded" | "failed";
  error?: string;
  retry: () => void;
  remove: () => void;
};

const STORAGE_KEY = "marketplace_temp_upload_session";

const createSessionId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const readSession = (): StoredSession | null => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
};

const isSessionActive = (session: StoredSession | null) =>
  Boolean(session && Date.now() - session.lastTouchedAt < TEMP_UPLOAD_TTL_MS);

type TempUploadsOptions = {
  onExpire?: () => void;
};

function resolveInitialSession() {
  const stored = readSession();
  if (isSessionActive(stored) && stored) {
    return {
      sessionId: stored.sessionId,
      createdAt: stored.createdAt,
      paths: stored.paths ?? [],
    };
  }
  return {
    sessionId: createSessionId(),
    createdAt: Date.now(),
    paths: [] as string[],
  };
}

export function useMarketplaceTempUploads(options: TempUploadsOptions = {}) {
  const initial = useMemo(() => resolveInitialSession(), []);
  const sessionIdRef = useRef(initial.sessionId);
  const createdAtRef = useRef(initial.createdAt);
  const bootstrapDoneRef = useRef(false);
  const tempPathsRef = useRef<string[]>(initial.paths);
  const [tempPaths, setTempPaths] = useState<string[]>(initial.paths);
  const [finalized, setFinalized] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<MarketplaceUploadQueueItem[]>([]);

  useEffect(() => {
    tempPathsRef.current = tempPaths;
  }, [tempPaths]);

  const writeSession = useCallback((paths: string[]) => {
    if (typeof window === "undefined") return;
    const payload: StoredSession = {
      sessionId: sessionIdRef.current,
      createdAt: createdAtRef.current,
      lastTouchedAt: Date.now(),
      paths,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, []);

  const sendBeaconCleanup = useCallback((paths: string[]) => {
    if (typeof window === "undefined" || paths.length === 0) return;
    const payload = JSON.stringify({ paths });
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/marketplace/upload/cleanup", blob);
  }, []);

  const cleanupPaths = useCallback(
    async (paths?: string[]) => {
      const toRemove = (paths ?? tempPathsRef.current).filter(Boolean);
      if (toRemove.length === 0) return;
      await fetch("/api/marketplace/upload/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: toRemove }),
      });
      setTempPaths((prev) => {
        const next = prev.filter((path) => !toRemove.includes(path));
        writeSession(next);
        return next;
      });
    },
    [writeSession]
  );

  const registerTempPath = useCallback(
    (path: string) => {
      if (!path) return;
      const id = path;
      const retry = () =>
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, progress: 0, status: "queued", error: undefined } : item
          )
        );
      const remove = () => {
        setUploadQueue((prev) => prev.filter((item) => item.id !== id));
        void cleanupPaths([path]);
      };
      setTempPaths((prev) => {
        if (prev.includes(path)) return prev;
        const next = [...prev, path];
        writeSession(next);
        return next;
      });
      setUploadQueue((prev) => {
        if (prev.some((item) => item.id === id)) return prev;
        return [...prev, { id, path, progress: 100, status: "uploaded", retry, remove }];
      });
    },
    [cleanupPaths, writeSession]
  );

  const finalizeTempUploads = useCallback(async (paths: string[]) => {
    if (paths.length === 0) return { files: [], errors: [] } as FinalizeResponse;
    const response = await fetch("/api/marketplace/upload/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });

    const data = (await response.json()) as FinalizeResponse & { error?: string };
    if (!response.ok && !data.files) {
      throw new Error(data.error || "Failed to finalize uploads");
    }

    if (data.errors && data.errors.length > 0) {
      const detail = data.errors[0]?.message;
      throw new Error(
        detail ? `Failed to finalize uploads: ${detail}` : "Failed to finalize uploads"
      );
    }

    setTempPaths((prev) => {
      const next = prev.filter((path) => !paths.includes(path));
      writeSession(next);
      return next;
    });
    setFinalized(true);

    return data;
  }, [writeSession]);

  // Bootstrap once: restore active session or cleanup only expired/abandoned uploads.
  useEffect(() => {
    if (bootstrapDoneRef.current) return;
    bootstrapDoneRef.current = true;

    const previous = readSession();
    if (previous?.paths?.length && !isSessionActive(previous)) {
      void fetch("/api/marketplace/upload/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: previous.paths }),
      });
      writeSession([]);
      setTempPaths([]);
    } else {
      writeSession(tempPathsRef.current);
    }
  }, [writeSession]);

  useEffect(() => {
    if (finalized || tempPaths.length === 0) return;
    const handler = () => sendBeaconCleanup(tempPathsRef.current);
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [finalized, sendBeaconCleanup, tempPaths.length]);

  const onExpire = options.onExpire;

  useEffect(() => {
    if (finalized || tempPaths.length === 0) return;
    const timer = window.setInterval(() => {
      const session = readSession();
      if (!session) return;
      if (Date.now() - session.lastTouchedAt >= TEMP_UPLOAD_TTL_MS) {
        void cleanupPaths().then(() => {
          onExpire?.();
          toast.info("Temporary uploads expired. Please re-upload images.");
        });
      }
    }, 5 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [cleanupPaths, finalized, onExpire, tempPaths.length]);

  const sessionId = useMemo(() => sessionIdRef.current, []);

  return {
    sessionId,
    tempPaths,
    uploadQueue,
    registerTempPath,
    cleanupPaths,
    finalizeTempUploads,
    markFinalized: () => setFinalized(true),
  };
}
