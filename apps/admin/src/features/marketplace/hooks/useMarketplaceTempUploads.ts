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

type TempUploadsOptions = {
  onExpire?: () => void;
};

export function useMarketplaceTempUploads(options: TempUploadsOptions = {}) {
  const sessionIdRef = useRef(createSessionId());
  const createdAtRef = useRef(Date.now());
  const [tempPaths, setTempPaths] = useState<string[]>([]);
  const [finalized, setFinalized] = useState(false);

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
      const toRemove = (paths ?? tempPaths).filter(Boolean);
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
    [tempPaths, writeSession]
  );

  const cleanupStale = useCallback(async () => {
    await fetch("/api/marketplace/upload/cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cleanupStale: true }),
    });
  }, []);

  const registerTempPath = useCallback(
    (path: string) => {
      if (!path) return;
      setTempPaths((prev) => {
        if (prev.includes(path)) return prev;
        const next = [...prev, path];
        writeSession(next);
        return next;
      });
    },
    [writeSession]
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

  useEffect(() => {
    const previous = readSession();
    if (previous?.paths?.length) {
      void cleanupPaths(previous.paths);
    }
    writeSession([]);
    void cleanupStale();
  }, [cleanupPaths, cleanupStale, writeSession]);

  useEffect(() => {
    if (finalized || tempPaths.length === 0) return;
    const handler = () => sendBeaconCleanup(tempPaths);
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [finalized, sendBeaconCleanup, tempPaths]);

  useEffect(() => {
    return () => {
      if (!finalized && tempPaths.length > 0) {
        sendBeaconCleanup(tempPaths);
      }
    };
  }, [finalized, sendBeaconCleanup, tempPaths]);

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
    registerTempPath,
    cleanupPaths,
    finalizeTempUploads,
    markFinalized: () => setFinalized(true),
  };
}
