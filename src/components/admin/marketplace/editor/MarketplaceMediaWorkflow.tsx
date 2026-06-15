"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, RotateCcw, Star, Trash2, Upload } from "lucide-react";
import { RemoteImage } from "@/components/shared/RemoteImage";

interface MarketplaceMediaWorkflowProps {
  images: string[];
  primaryImage?: string;
  altTextByUrl?: Record<string, string>;
  disabled?: boolean;
  onImagesChange: (images: string[]) => void;
  onPrimaryImageChange: (url: string) => void;
  onAltTextChange: (url: string, alt: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

function moveItem(items: string[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (!item) return items;
  next.splice(to, 0, item);
  return next;
}

export function MarketplaceMediaWorkflow({
  images,
  primaryImage,
  altTextByUrl,
  disabled,
  onImagesChange,
  onPrimaryImageChange,
  onAltTextChange,
  onUploadingChange,
}: MarketplaceMediaWorkflowProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const accepted = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (accepted.length === 0) {
        setFailedFiles(Array.from(files).map((file) => file.name));
        return;
      }

      onUploadingChange?.(true);
      setProgress(35);
      const urls = accepted.map((file) => URL.createObjectURL(file));
      const next = [...images, ...urls];
      onImagesChange(next);
      if (!primaryImage && urls[0]) onPrimaryImageChange(urls[0]);
      setProgress(100);
      window.setTimeout(() => {
        setProgress(0);
        onUploadingChange?.(false);
      }, 350);
    },
    [images, onImagesChange, onPrimaryImageChange, onUploadingChange, primaryImage]
  );

  const remove = (url: string) => {
    const next = images.filter((image) => image !== url);
    onImagesChange(next);
    if (primaryImage === url) onPrimaryImageChange(next[0] ?? "");
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) addFiles(event.dataTransfer.files);
  };

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface/40 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Media</p>
        <h2 className="mt-1 text-lg font-bold text-white">Images</h2>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white/5 p-6 text-center"
      >
        <Upload className="mb-3 h-5 w-5 text-gray-400" />
        <p className="text-sm text-gray-300">Drag images here or choose files</p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-3 min-h-[40px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
          }}
        />
        {progress > 0 ? (
          <div className="mt-4 h-1 w-full max-w-xs overflow-hidden rounded bg-white/10">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </div>

      {failedFiles.map((name) => (
        <div key={name} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <span>{name} failed</span>
          <button type="button" className="inline-flex items-center gap-2" onClick={() => setFailedFiles((prev) => prev.filter((file) => file !== name))}>
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((url, index) => {
          const isPrimary = primaryImage === url;
          return (
            <div key={url} className="rounded-lg border border-border bg-white/5 p-3">
              <div className="aspect-[4/3] overflow-hidden rounded bg-black/30">
                {url ? (
                  <RemoteImage src={url} alt="" width={320} height={240} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-600">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => onPrimaryImageChange(url)} className="inline-flex min-h-[36px] items-center gap-1 rounded border border-border px-2 text-xs text-white">
                  <Star className={`h-3 w-3 ${isPrimary ? "fill-accent text-accent" : ""}`} />
                  Set primary
                </button>
                <button type="button" disabled={index === 0} onClick={() => onImagesChange(moveItem(images, index, index - 1))} className="min-h-[36px] rounded border border-border px-2 text-xs text-white disabled:opacity-40">
                  Move left
                </button>
                <button type="button" disabled={index === images.length - 1} onClick={() => onImagesChange(moveItem(images, index, index + 1))} className="min-h-[36px] rounded border border-border px-2 text-xs text-white disabled:opacity-40">
                  Move right
                </button>
                <button type="button" onClick={() => remove(url)} className="inline-flex min-h-[36px] items-center gap-1 rounded border border-destructive/40 px-2 text-xs text-destructive">
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
              <label className="mt-3 block text-xs font-semibold text-gray-300">
                Alt text
                <input
                  value={altTextByUrl?.[url] ?? ""}
                  onChange={(event) => onAltTextChange(url, event.target.value)}
                  className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
