"use client";

import { useCallback, useRef, useState } from "react";
import { attachmentsService } from "@/admin/crm/services/attachmentsService";
import { storageService } from "@/admin/crm/services/storageService";
import type { UploadQueueItemData } from "@/admin/crm/components/UploadQueueItem";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

export function validateAttachmentFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type)) return "Unsupported file type.";
  if (file.size > MAX_SIZE) return "File is too large (max 10MB).";
  return null;
}

export function useAttachmentsUpload(entityType: string, entityId: string) {
  const [queue, setQueue] = useState<UploadQueueItemData[]>([]);
  const [uploading, setUploading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const queueRef = useRef<UploadQueueItemData[]>([]);
  queueRef.current = queue;

  const updateItem = useCallback(
    (id: string, patch: Partial<UploadQueueItemData>) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    []
  );

  const uploadSingle = useCallback(
    async (item: UploadQueueItemData): Promise<void> => {
      const { id, file } = item;
      const controller = new AbortController();
      abortRef.current = controller;
      updateItem(id, { status: "uploading", progress: 0 });
      try {
        const { attachment_id, file_path } = await attachmentsService.getUploadUrl({
          entity_type: entityType,
          entity_id: entityId,
          file_name: file.name,
          content_type: file.type || null,
          size_bytes: file.size,
        });
        if (controller.signal.aborted) throw new Error("Upload cancelled");
        updateItem(id, { progress: 50 });
        await storageService.uploadToPath(file, file_path, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) throw new Error("Upload cancelled");
        updateItem(id, { status: "done", progress: 100 });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        updateItem(id, { status: "error", message });
        throw err;
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [entityType, entityId, updateItem]
  );

  const processQueue = useCallback(
    async (onDone: () => void) => {
      setUploading(true);
      try {
        const current = queueRef.current;
        const pending = current.filter((i) => i.status === "pending" || i.status === "error");
        for (const item of pending) {
          if (item.status === "done") continue;
          setQueue((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: "pending" as const, message: undefined } : i
            )
          );
          await uploadSingle({ ...item, status: "pending" });
        }
        onDone();
      } finally {
        setUploading(false);
      }
    },
    [uploadSingle]
  );

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    const items: UploadQueueItemData[] = list
      .filter((file) => !validateAttachmentFile(file))
      .map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        status: "pending" as const,
      }));
    setQueue((prev) => [...items, ...prev]);
    return items;
  }, []);

  const cancelUpload = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const retry = useCallback(
    (id: string) => {
      const item = queue.find((i) => i.id === id);
      if (!item || item.status !== "error") return;
      setQueue((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "pending" as const, message: undefined } : i
        )
      );
      setUploading(true);
      uploadSingle({ ...item, status: "pending" })
        .catch(() => {})
        .finally(() => setUploading(false));
    },
    [queue, uploadSingle]
  );

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return {
    queue,
    uploading,
    addFiles,
    processQueue,
    cancelUpload,
    retry,
    removeFromQueue,
    updateItem,
    validateFile: validateAttachmentFile,
  };
}
