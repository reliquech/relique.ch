"use client";

import * as React from "react";
import { Upload, X, ArrowUp, ArrowDown, File, AlertTriangle } from "lucide-react";
import { cn } from "../../cn";
import { useCallback, useRef, useState } from "react";

export type UploadMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  note?: string;
  tag?: string;
};

export type UploadManagerProps = {
  value: UploadMeta[];
  onChange: (next: UploadMeta[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // bytes
  maxTotalSize?: number; // bytes
  allowedTypes?: string[]; // e.g. ["image/jpeg", "image/png", "application/pdf"]
  className?: string;
  onValidationError?: (error: string) => void;
  requiredTags?: string[]; // e.g. ["Full item", "Signature close-up"]
  showWarnings?: boolean;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

export function UploadManager({
  value,
  onChange,
  maxFiles = 20,
  maxFileSize = 15 * 1024 * 1024, // 15MB default
  maxTotalSize = 120 * 1024 * 1024, // 120MB default
  allowedTypes,
  className,
  onValidationError,
  requiredTags = [],
  showWarnings = true,
}: UploadManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxFileSize && file.size > maxFileSize) {
        return `File "${file.name}" exceeds maximum size of ${formatBytes(maxFileSize)}`;
      }

      if (allowedTypes && allowedTypes.length > 0) {
        if (!allowedTypes.includes(file.type)) {
          return `File "${file.name}" has unsupported type. Allowed: ${allowedTypes.join(", ")}`;
        }
      }

      return null;
    },
    [maxFileSize, allowedTypes]
  );

  const validateFiles = useCallback(
    (files: File[]): string | null => {
      const currentTotalSize = value.reduce((sum, f) => sum + f.size, 0);
      const newFilesTotalSize = files.reduce((sum, f) => sum + f.size, 0);
      const totalSize = currentTotalSize + newFilesTotalSize;

      if (maxTotalSize && totalSize > maxTotalSize) {
        return `Total file size (${formatBytes(totalSize)}) exceeds maximum of ${formatBytes(maxTotalSize)}`;
      }

      const remaining = Math.max(0, maxFiles - value.length);
      if (files.length > remaining) {
        return `Maximum ${maxFiles} files allowed. You can add ${remaining} more file(s).`;
      }

      for (const file of files) {
        const error = validateFile(file);
        if (error) return error;
      }

      return null;
    },
    [value, maxFiles, maxTotalSize, validateFile]
  );

  const processFiles = useCallback(
    (files: File[]) => {
      const error = validateFiles(files);
      if (error) {
        onValidationError?.(error);
        setDragError(error);
        return;
      }

      setDragError(null);
      const current = [...value];
      const remaining = Math.max(0, maxFiles - current.length);
      const next = Array.from(files)
        .slice(0, remaining)
        .map((f) => ({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: f.name,
          size: f.size,
          type: f.type,
          previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        }));
      onChange([...current, ...next]);
    },
    [value, maxFiles, validateFiles, onChange, onValidationError]
  );

  const onPick = (files: FileList | null) => {
    if (!files) return;
    processFiles(Array.from(files));
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  const remove = (id: string) => {
    const file = value.find((f) => f.id === id);
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    onChange(value.filter((x) => x.id !== id));
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = value.findIndex((x) => x.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(idx, 1);
    next.splice(to, 0, item!);
    onChange(next);
  };

  const patch = (id: string, partial: Partial<UploadMeta>) =>
    onChange(value.map((x) => (x.id === id ? { ...x, ...partial } : x)));

  const totalSize = value.reduce((sum, f) => sum + f.size, 0);
  const hasFullItem = value.some((f) => f.tag?.toLowerCase().includes("full"));
  const hasSignatureCloseUp = value.some((f) => f.tag?.toLowerCase().includes("signature") || f.tag?.toLowerCase().includes("close-up"));

  const getTagSuggestions = () => [
    "Full item",
    "Signature close-up",
    "Supporting document",
    "Certificate",
    "Packaging",
  ];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border border-dashed rounded-none p-8 bg-background transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-accent",
          dragError && "border-destructive bg-destructive/10"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onPick(e.target.files)}
          accept={allowedTypes?.join(",")}
        />
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground text-center">
          <Upload className="h-6 w-6" aria-hidden />
          <div>
            {dragError ? (
              <span className="text-destructive">{dragError}</span>
            ) : isDragging ? (
              <span className="text-primary">Drop files here</span>
            ) : (
              <>
                <span className="font-medium text-foreground">Drag & drop files here</span>
                <span className="block mt-1">or click to browse</span>
              </>
            )}
          </div>
          <div className="text-xs space-y-1">
            <p>
              Max {maxFiles} files · {formatBytes(maxFileSize)} per file · {formatBytes(maxTotalSize)} total
            </p>
            {allowedTypes && allowedTypes.length > 0 && (
              <p className="text-muted-foreground">Allowed: {allowedTypes.map((t) => t.split("/")[1] || t).join(", ")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {showWarnings && (
        <div className="space-y-1">
          {requiredTags.includes("Full item") && !hasFullItem && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="w-4 h-4" />
              <span>Warning: Full item photo recommended</span>
            </div>
          )}
          {requiredTags.includes("Signature close-up") && !hasSignatureCloseUp && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="w-4 h-4" />
              <span>Warning: Signature close-up photo recommended</span>
            </div>
          )}
        </div>
      )}

      {/* File List */}
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No files selected.</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2">
            <span>{value.length} file(s) · {formatBytes(totalSize)}</span>
            {maxTotalSize && (
              <span className={totalSize > maxTotalSize ? "text-destructive" : ""}>
                {formatBytes(totalSize)} / {formatBytes(maxTotalSize)}
              </span>
            )}
          </div>
          {value.map((f, idx) => (
            <div key={f.id} className="border rounded-none p-3 bg-background">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-start gap-3 flex-1">
                  {f.previewUrl ? (
                    <img
                      src={f.previewUrl}
                      alt={f.name}
                      className="h-16 w-16 object-cover border border-border rounded-none flex-shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 border border-border bg-muted/20 rounded-none flex-shrink-0 flex items-center justify-center">
                      <File className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(f.size)} · {f.type || "unknown"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center border border-border bg-background hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => move(f.id, -1)}
                    disabled={idx === 0}
                    aria-label={`Move file ${idx + 1} up`}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center border border-border bg-background hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => move(f.id, 1)}
                    disabled={idx === value.length - 1}
                    aria-label={`Move file ${idx + 1} down`}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="h-8 w-8 inline-flex items-center justify-center border border-border bg-background hover:border-destructive hover:text-destructive"
                    onClick={() => remove(f.id)}
                    aria-label={`Remove file ${f.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div>
                  <select
                    className={cn(
                      "h-9 w-full rounded-none border border-input bg-background px-3 text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    )}
                    value={f.tag ?? ""}
                    onChange={(e) => patch(f.id, { tag: e.target.value })}
                  >
                    <option value="">Select tag...</option>
                    {getTagSuggestions().map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <input
                    className={cn(
                      "h-9 w-full rounded-none border border-input bg-background px-3 text-sm mt-2",
                      "placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    )}
                    placeholder="Or enter custom tag"
                    value={f.tag ?? ""}
                    onChange={(e) => patch(f.id, { tag: e.target.value })}
                  />
                </div>
                <input
                  className={cn(
                    "h-9 w-full rounded-none border border-input bg-background px-3 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                  )}
                  placeholder="Note (optional)"
                  value={f.note ?? ""}
                  onChange={(e) => patch(f.id, { note: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
