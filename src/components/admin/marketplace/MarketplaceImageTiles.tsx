"use client";

import { X, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ImageUploadStatus = "idle" | "uploading" | "uploaded" | "error";

export type ImageUploadItem = {
  id: string;
  previewUrl?: string;
  url?: string;
  status: ImageUploadStatus;
  error?: string;
};

export function getImageSrc(item: ImageUploadItem) {
  return item.status === "uploaded" && item.url ? item.url : item.previewUrl || item.url;
}

function UploadOverlay({
  status,
  error,
  onRetry,
}: {
  status: ImageUploadStatus;
  error?: string;
  onRetry?: () => void;
}) {
  if (status !== "uploading" && status !== "error") return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-2 text-center text-xs text-white">
      {status === "uploading" ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="uppercase tracking-[0.2em]">Uploading</span>
        </>
      ) : (
        <>
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">{error || "Upload failed. Please try again."}</span>
          {onRetry ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRetry();
              }}
              className="mt-1 rounded-md border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
            >
              Retry
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

export function ImageTile({
  item,
  onRemove,
  onPreview,
  onRetry,
  sizeClass,
  alt,
}: {
  item: ImageUploadItem;
  onRemove: () => void;
  onPreview?: () => void;
  onRetry?: () => void;
  sizeClass: string;
  alt: string;
}) {
  const src = getImageSrc(item);
  const canPreview = item.status === "uploaded" && Boolean(src);

  return (
    <div className={cn("relative overflow-hidden rounded-md border border-border/60 bg-bg-0/20", sizeClass)}>
      {src ? (
        <button
          type="button"
          onClick={canPreview ? onPreview : undefined}
          className={cn("absolute inset-0 block w-full", canPreview && "cursor-zoom-in")}
          aria-label={canPreview ? `View ${alt}` : undefined}
          disabled={!canPreview}
        >
          { }
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </button>
      ) : null}
      <UploadOverlay status={item.status} error={item.error} onRetry={onRetry} />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
        aria-label={`Remove ${alt}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function DraggableAdditionalTile({
  item,
  index,
  dragIndex,
  dropTargetIndex,
  onDragIndexChange,
  onDropTargetChange,
  onReorder,
  onRemove,
  onPreview,
  onRetry,
  alt,
}: {
  item: ImageUploadItem;
  index: number;
  dragIndex: number | null;
  dropTargetIndex: number | null;
  onDragIndexChange: (index: number | null) => void;
  onDropTargetChange: (index: number | null) => void;
  onReorder: (activeIndex: number, overIndex: number) => void;
  onRemove: () => void;
  onPreview: () => void;
  onRetry: () => void;
  alt: string;
}) {
  const isDragging = dragIndex === index;
  const isDropTarget =
    dropTargetIndex === index && dragIndex !== null && dragIndex !== index;

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", String(index));
        event.dataTransfer.effectAllowed = "move";
        onDragIndexChange(index);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (dragIndex !== null && dragIndex !== index) {
          onDropTargetChange(index);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        const srcIndex = Number.parseInt(event.dataTransfer.getData("text/plain"), 10);
        if (!Number.isNaN(srcIndex)) {
          onReorder(srcIndex, index);
        }
        onDragIndexChange(null);
        onDropTargetChange(null);
      }}
      onDragEnd={() => {
        onDragIndexChange(null);
        onDropTargetChange(null);
      }}
      className={cn(
        "cursor-grab rounded-md active:cursor-grabbing",
        isDragging && "opacity-50",
        isDropTarget && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <ImageTile
        item={item}
        onRemove={onRemove}
        onPreview={onPreview}
        onRetry={onRetry}
        sizeClass="aspect-square w-full"
        alt={alt}
      />
    </div>
  );
}
