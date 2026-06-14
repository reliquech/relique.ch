"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
}

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 12,
  maxSizeMB = 8,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File ${file.name} exceeds ${maxSizeMB}MB limit`;
    }
    return null;
  };

  const processFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      Array.from(newFiles).forEach((file) => {
        if (files.length + validFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          return;
        }

        const error = validateFile(file);
        if (error) {
          errors.push(error);
          return;
        }

        const fileWithPreview = Object.assign(file, {
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
        });

        validFiles.push(fileWithPreview);
      });

      if (errors.length > 0) {
        alert(errors.join("\n"));
      }

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
    },
    [files, maxFiles, maxSizeMB, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    const file = files[index];
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted"
        )}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Max {maxFiles} files, {maxSizeMB}MB each. Accepted: JPG, PNG, WebP, PDF
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = accept;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              processFiles(target.files);
            };
            input.click();
          }}
        >
          Select Files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files ({files.length}/{maxFiles})</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

