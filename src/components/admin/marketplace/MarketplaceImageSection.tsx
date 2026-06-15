"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageLightbox, type ImageLightboxImage } from "@/components/shared/ImageLightbox";
import { cn } from "@/lib/utils";

export type ImageUploadStatus = "idle" | "uploading" | "uploaded" | "error";

export type ImageUploadItem = {
  id: string;
  previewUrl?: string;
  url?: string;
  status: ImageUploadStatus;
  error?: string;
};

type MarketplaceImageSectionProps = {
  coverImage: ImageUploadItem | null;
  additionalImages: ImageUploadItem[];
  onCoverChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverRemove: () => void;
  onAdditionalChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAdditionalRemove: (id: string) => void;
  onAdditionalReorder: (activeIndex: number, overIndex: number) => void;
  onRetry: (id: string) => void;
  coverError?: string;
  isUploading?: boolean;
};

function getImageSrc(item: ImageUploadItem) {
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

function ImageTile({
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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

function DraggableAdditionalTile({
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

export function MarketplaceImageSection({
  coverImage,
  additionalImages,
  onCoverChange,
  onCoverRemove,
  onAdditionalChange,
  onAdditionalRemove,
  onAdditionalReorder,
  onRetry,
  coverError,
  isUploading,
}: MarketplaceImageSectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const lightboxImages = useMemo<ImageLightboxImage[]>(() => {
    const images: ImageLightboxImage[] = [];
    if (coverImage && coverImage.status === "uploaded") {
      const src = getImageSrc(coverImage);
      if (src) images.push({ src, alt: "Cover preview" });
    }
    additionalImages.forEach((item, index) => {
      if (item.status !== "uploaded") return;
      const src = getImageSrc(item);
      if (src) images.push({ src, alt: `Additional ${index + 1}` });
    });
    return images;
  }, [additionalImages, coverImage]);

  const openLightboxAt = useCallback(
    (target: "cover" | string) => {
      if (target === "cover") {
        setLightboxIndex(0);
        setLightboxOpen(true);
        return;
      }

      let index = coverImage?.status === "uploaded" && getImageSrc(coverImage) ? 1 : 0;
      for (const item of additionalImages) {
        if (item.status !== "uploaded" || !getImageSrc(item)) continue;
        if (item.id === target) {
          setLightboxIndex(index);
          setLightboxOpen(true);
          return;
        }
        index += 1;
      }
    },
    [additionalImages, coverImage]
  );

  return (
    <>
      <Card className="border-border/60 bg-surface/40">
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload cover image and additional images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              Cover Image <span className="text-destructive">*</span>
            </Label>
            {coverImage ? (
              <ImageTile
                item={coverImage}
                onRemove={onCoverRemove}
                onPreview={() => openLightboxAt("cover")}
                onRetry={() => onRetry(coverImage.id)}
                sizeClass="aspect-video w-full"
                alt="Cover preview"
              />
            ) : (
              <label
                htmlFor="cover-image"
                className={cn(
                  "flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border/60 bg-bg-0/20 transition-base hover:bg-white/5",
                  coverError && "border-destructive",
                  isUploading && "opacity-70"
                )}
              >
                <div className="flex flex-col items-center justify-center px-4 py-6">
                  <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Upload Cover Image</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 8MB</p>
                </div>
                <input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onCoverChange}
                />
              </label>
            )}
            {coverError ? <p className="text-sm text-destructive">{coverError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Additional Images</Label>
            <label
              htmlFor="additional-images"
              className={cn(
                "flex min-h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border/60 bg-bg-0/20 px-4 py-6 transition-base hover:bg-white/5",
                isUploading && "opacity-70"
              )}
            >
              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
              {additionalImages.length === 0 ? (
                <>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">No additional images</p>
                  <p className="text-center text-xs text-muted-foreground">
                    Drag and drop additional photos to show product details from different angles
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> multiple images
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">PNG, JPG, WEBP up to 8MB each</p>
              <input
                id="additional-images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onAdditionalChange}
              />
            </label>

            {additionalImages.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {additionalImages.map((item, index) => (
                  <DraggableAdditionalTile
                    key={item.id}
                    item={item}
                    index={index}
                    dragIndex={dragIndex}
                    dropTargetIndex={dropTargetIndex}
                    onDragIndexChange={setDragIndex}
                    onDropTargetChange={setDropTargetIndex}
                    onReorder={onAdditionalReorder}
                    onRemove={() => onAdditionalRemove(item.id)}
                    onPreview={() => openLightboxAt(item.id)}
                    onRetry={() => onRetry(item.id)}
                    alt={`Additional ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ImageLightbox
        images={lightboxImages}
        activeIndex={lightboxIndex}
        isOpen={lightboxOpen && lightboxImages.length > 0}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
