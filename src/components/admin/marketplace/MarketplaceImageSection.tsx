"use client";

import React from "react";
import { Upload, X, Loader2, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  coverError?: string;
  isUploading?: boolean;
};

function UploadOverlay({ status, error }: { status: ImageUploadStatus; error?: string }) {
  if (status !== "uploading" && status !== "error") return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-xs uppercase tracking-[0.2em] text-white">
      {status === "uploading" ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Uploading</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="text-destructive">{error || "Upload failed"}</span>
        </>
      )}
    </div>
  );
}

function ImageTile({
  item,
  onRemove,
  sizeClass,
  alt,
}: {
  item: ImageUploadItem;
  onRemove: () => void;
  sizeClass: string;
  alt: string;
}) {
  const src =
    item.status === "uploaded" && item.url ? item.url : item.previewUrl || item.url;
  return (
    <div className={cn("relative border border-border/60 overflow-hidden bg-bg-0/20", sizeClass)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : null}
      <UploadOverlay status={item.status} error={item.error} />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground clip-path-slant hover:bg-destructive/90 transition-base"
      >
        <X className="w-4 h-4" />
      </button>
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
  coverError,
  isUploading,
}: MarketplaceImageSectionProps) {
  return (
    <Card className="bg-surface/40 border-border/60">
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
              sizeClass="w-full h-48 clip-path-slant-lg"
              alt="Cover preview"
            />
          ) : (
            <label
              htmlFor="cover-image"
              className={cn(
                "clip-path-slant-lg flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/60 bg-bg-0/20 cursor-pointer hover:bg-white/5 transition-base",
                coverError && "border-destructive",
                isUploading && "opacity-70"
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
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
          {coverError && <p className="text-sm text-destructive">{coverError}</p>}
        </div>

        <div className="space-y-2">
          <Label>Additional Images</Label>
          <label
            htmlFor="additional-images"
            className={cn(
              "clip-path-slant-lg flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/60 bg-bg-0/20 cursor-pointer hover:bg-white/5 transition-base",
              isUploading && "opacity-70"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> multiple images
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 8MB each</p>
            </div>
            <input
              id="additional-images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onAdditionalChange}
            />
          </label>

          {additionalImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {additionalImages.map((item, index) => (
                <ImageTile
                  key={item.id}
                  item={item}
                  onRemove={() => onAdditionalRemove(item.id)}
                  sizeClass="w-full h-32 clip-path-slant"
                  alt={`Additional ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
