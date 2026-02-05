"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Attachment } from "@/lib/types";
import { attachmentsService } from "@/features/crm/services/attachmentsService";
import { storageService } from "@/features/crm/services/storageService";
import { Paperclip, Upload } from "lucide-react";
import { toast } from "sonner";
import { AttachmentListItem } from "./AttachmentListItem";
import { UploadQueueItem } from "./UploadQueueItem";
import { useAttachmentsUpload } from "@/features/crm/hooks/useAttachmentsUpload";

interface AttachmentsPanelProps {
  entityType: string;
  entityId: string;
  readOnly?: boolean;
}

export function AttachmentsPanel({ entityType, entityId, readOnly }: AttachmentsPanelProps) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const signedCacheRef = useRef<Map<string, { url: string; expiresAt: number }>>(new Map());
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    queue,
    uploading,
    addFiles,
    processQueue,
    cancelUpload,
    retry,
    validateFile,
  } = useAttachmentsUpload(entityType, entityId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attachmentsService.list({
        entity_type: entityType,
        entity_id: entityId,
      });
      setItems(res.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attachments");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    load();
  }, [load]);

  const getSignedUrl = useCallback(async (path: string, expiresInSeconds = 3600) => {
    const cached = signedCacheRef.current.get(path);
    if (cached && cached.expiresAt > Date.now()) return cached.url;
    const url = await storageService.createSignedUrl(path, expiresInSeconds);
    signedCacheRef.current.set(path, {
      url,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    });
    setSignedUrls((prev) => ({ ...prev, [path]: url }));
    return url;
  }, []);

  useEffect(() => {
    items
      .filter((att) => {
        const ct = att.content_type || "";
        return ct.startsWith("image/") || ct === "application/pdf";
      })
      .forEach((att) => {
        if (!signedUrls[att.file_path]) getSignedUrl(att.file_path).catch(() => {});
      });
  }, [items, signedUrls, getSignedUrl]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;
      list.forEach((file) => {
        const err = validateFile(file);
        if (err) toast.error(`${file.name}: ${err}`);
      });
      const added = addFiles(list);
      if (added.length > 0) {
        const run = async () => {
          try {
            await processQueue(load);
            toast.success("Attachments uploaded");
            load();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Upload failed");
          }
          if (fileRef.current) fileRef.current.value = "";
        };
        setTimeout(run, 0);
      }
    },
    [addFiles, processQueue, load, validateFile]
  );

  const handleView = useCallback(
    async (attachment: Attachment) => {
      try {
        const url =
          signedUrls[attachment.file_path] ?? await getSignedUrl(attachment.file_path);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to open file");
      }
    },
    [signedUrls, getSignedUrl]
  );

  const handleDelete = useCallback(
    async (attachment: Attachment) => {
      try {
        await storageService.remove(attachment.file_path);
        await attachmentsService.delete(attachment.id);
        toast.success("Attachment deleted");
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete attachment");
      }
    },
    [load]
  );

  return (
    <div className="border border-border bg-surface rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Paperclip className="w-4 h-4 text-gray-400" />
          Attachments
        </div>
        {!readOnly && (
          <>
            <input
              ref={fileRef}
              type="file"
              multiple
              onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
              className="hidden"
              accept="image/jpeg,image/png,image/webp,application/pdf"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gray-200 hover:text-white hover:bg-white/10 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </>
        )}
      </div>

      {!readOnly && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-lg p-4 text-center text-xs transition-colors ${
            dragActive ? "border-primary text-primary bg-primary/5" : "border-border text-gray-400"
          }`}
        >
          Drag and drop files here, or click Upload
          <div className="mt-1 text-[10px] text-gray-500">JPG, PNG, WEBP, PDF · Max 10MB</div>
        </div>
      )}

      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.slice(0, 10).map((item) => (
            <UploadQueueItem
              key={item.id}
              item={item}
              onCancel={item.status === "uploading" ? cancelUpload : undefined}
              onRetry={item.status === "error" ? () => retry(item.id) : undefined}
              readOnly={readOnly}
            />
          ))}
          {queue.length > 10 && (
            <div className="text-[10px] text-gray-500">+{queue.length - 10} more</div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading attachments...</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No attachments yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((att) => (
            <AttachmentListItem
              key={att.id}
              attachment={att}
              previewUrl={signedUrls[att.file_path]}
              onView={() => handleView(att)}
              onDelete={readOnly ? undefined : () => handleDelete(att)}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
