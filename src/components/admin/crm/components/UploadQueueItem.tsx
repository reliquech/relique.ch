"use client";

import { X, RefreshCw } from "lucide-react";
import { formatBytes } from "./AttachmentListItem";

export type QueueItemStatus = "pending" | "uploading" | "done" | "error";

export interface UploadQueueItemData {
  id: string;
  file: File;
  status: QueueItemStatus;
  message?: string;
  progress?: number;
}

interface UploadQueueItemProps {
  item: UploadQueueItemData;
  onCancel?: () => void;
  onRetry?: () => void;
  readOnly?: boolean;
}

export function UploadQueueItem({ item, onCancel, onRetry, readOnly }: UploadQueueItemProps) {
  return (
    <div className="flex items-center justify-between bg-white/5 border border-border rounded-lg px-3 py-2 text-xs gap-2">
      <div className="min-w-0 flex-1">
        <div className="text-gray-200 truncate">{item.file.name}</div>
        <div className="text-[10px] text-gray-500">{formatBytes(item.file.size)}</div>
        {item.status === "uploading" && (
          <div className="mt-1 h-1 w-full bg-white/10 rounded overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${item.progress ?? 0}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] uppercase tracking-wider">
          {item.status === "pending" && <span className="text-gray-400">Queued</span>}
          {item.status === "uploading" && <span className="text-primary">Uploading</span>}
          {item.status === "done" && <span className="text-success">Done</span>}
          {item.status === "error" && (
            <span className="text-destructive" title={item.message}>
              Error
            </span>
          )}
        </span>
        {!readOnly && item.status === "uploading" && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!readOnly && item.status === "error" && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
