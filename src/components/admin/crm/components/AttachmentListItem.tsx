"use client";

import type { Attachment } from "@/lib/types/admin";
import { Eye, Trash2 } from "lucide-react";

export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

interface AttachmentListItemProps {
  attachment: Attachment;
  previewUrl: string | undefined;
  onView: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export function AttachmentListItem({
  attachment,
  previewUrl,
  onView,
  onDelete,
  readOnly,
}: AttachmentListItemProps) {
  const contentType = attachment.content_type || "";
  const isImage = contentType.startsWith("image/");
  const isPdf = contentType === "application/pdf";

  return (
    <div className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-sm text-white truncate">
          {attachment.title || attachment.file_name}
        </div>
        <div className="text-xs text-gray-500">
          {formatBytes(attachment.size_bytes)} · {attachment.content_type || "unknown"}
        </div>
        {isImage && previewUrl && (
          <img
            src={previewUrl}
            alt={attachment.file_name}
            className="mt-2 h-20 w-auto max-w-full rounded border border-border object-cover"
          />
        )}
        {isPdf && previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
          >
            Preview PDF
          </a>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onView}
          className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        {!readOnly && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
