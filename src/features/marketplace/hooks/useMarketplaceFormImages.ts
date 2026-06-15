"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import type { MarketplaceFormData } from "@/features/marketplace/schema";
import type { ImageUploadItem } from "@/components/admin/marketplace/MarketplaceImageSection";
import { useMarketplaceTempUploads } from "@/features/marketplace/hooks/useMarketplaceTempUploads";
import { createTempUploadPath } from "@/features/marketplace/utils/uploadPaths";

export type UploadItem = ImageUploadItem & {
  file?: File;
  path?: string;
};

async function uploadMarketplaceFile(
  file: File,
  path: string,
  sessionId: string
): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", sessionId);
  formData.append("path", path);

  const response = await fetch("/api/marketplace/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload file");
  }

  const data = await response.json();
  return { url: data.url as string, path: data.path as string };
}

export function useMarketplaceFormImages(setValue: UseFormSetValue<MarketplaceFormData>) {
  const [coverImage, setCoverImage] = useState<UploadItem | null>(null);
  const [additionalImages, setAdditionalImages] = useState<UploadItem[]>([]);
  const coverImageRef = useRef<UploadItem | null>(null);
  const additionalImagesRef = useRef<UploadItem[]>([]);

  useEffect(() => {
    coverImageRef.current = coverImage;
  }, [coverImage]);

  useEffect(() => {
    additionalImagesRef.current = additionalImages;
  }, [additionalImages]);

  useEffect(() => {
    return () => {
      if (coverImageRef.current?.previewUrl) {
        URL.revokeObjectURL(coverImageRef.current.previewUrl);
      }
      additionalImagesRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const clearUploads = useCallback(() => {
    const currentCover = coverImageRef.current;
    if (currentCover?.previewUrl) {
      URL.revokeObjectURL(currentCover.previewUrl);
    }
    additionalImagesRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setCoverImage(null);
    setAdditionalImages([]);
    coverImageRef.current = null;
    additionalImagesRef.current = [];
    setValue("image", "");
    setValue("images", null);
  }, [setValue]);

  const {
    sessionId,
    registerTempPath,
    cleanupPaths,
    finalizeTempUploads,
    markFinalized,
  } = useMarketplaceTempUploads({ onExpire: clearUploads });

  const validateImageFile = useCallback((file: File, label?: string) => {
    if (!file.type.startsWith("image/")) {
      return `${label ?? "File"} must be an image`;
    }
    if (file.size > 8 * 1024 * 1024) {
      return `${label ?? "Image"} exceeds 8MB limit`;
    }
    return null;
  }, []);

  const syncAdditionalUrls = useCallback(
    (items: UploadItem[]) => {
      const urls = items
        .filter((item) => item.status === "uploaded" && item.url)
        .map((item) => item.url!) as string[];
      setValue("images", urls.length > 0 ? urls : null);
    },
    [setValue]
  );

  const handleCoverImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      const errorMessage = validateImageFile(file, "Cover image");
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }

      if (coverImage?.previewUrl) {
        URL.revokeObjectURL(coverImage.previewUrl);
      }
      if (coverImage?.path) {
        void cleanupPaths([coverImage.path]);
      }

      const previewUrl = URL.createObjectURL(file);
      const path = createTempUploadPath(sessionId, file.name);
      registerTempPath(path);

      const nextCover: UploadItem = {
        id: path,
        file,
        previewUrl,
        path,
        status: "uploading",
      };
      coverImageRef.current = nextCover;
      setCoverImage(nextCover);
      setValue("image", "");

      try {
        const { url, path: storedPath } = await uploadMarketplaceFile(file, path, sessionId);
        if (coverImageRef.current?.id !== path) {
          void cleanupPaths([storedPath, path]);
          return;
        }
        setCoverImage((prev) => {
          if (!prev) return prev;
          const next: UploadItem = { ...prev, url, path: storedPath, status: "uploaded" };
          coverImageRef.current = next;
          return next;
        });
        if (storedPath !== path) {
          void cleanupPaths([path]);
        }
        registerTempPath(storedPath);
        setValue("image", url, { shouldValidate: true, shouldDirty: true });
        toast.success("Cover image uploaded");
      } catch (error) {
        setCoverImage((prev) => {
          if (!prev) return prev;
          const next: UploadItem = { ...prev, status: "error", error: "Upload failed" };
          coverImageRef.current = next;
          return next;
        });
        void cleanupPaths([path]);
        toast.error(error instanceof Error ? error.message : "Failed to upload image");
      }
    },
    [cleanupPaths, coverImage, registerTempPath, sessionId, setValue, validateImageFile]
  );

  const handleAdditionalImagesChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      e.target.value = "";
      if (files.length === 0) return;

      const nextItems: UploadItem[] = [];
      files.forEach((file) => {
        const errorMessage = validateImageFile(file, file.name);
        if (errorMessage) {
          toast.error(errorMessage);
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        const path = createTempUploadPath(sessionId, file.name);
        registerTempPath(path);
        nextItems.push({
          id: path,
          file,
          previewUrl,
          path,
          status: "uploading",
        });
      });

      if (nextItems.length === 0) return;

      setAdditionalImages((prev) => {
        const next = [...prev, ...nextItems];
        additionalImagesRef.current = next;
        return next;
      });

      let successCount = 0;
      await Promise.all(
        nextItems.map(async (item) => {
          try {
            const { url, path: storedPath } = await uploadMarketplaceFile(
              item.file!,
              item.path!,
              sessionId
            );
            if (!additionalImagesRef.current.some((existing) => existing.id === item.id)) {
              void cleanupPaths([storedPath, item.path!]);
              return;
            }
            setAdditionalImages((prev) => {
              const next: UploadItem[] = prev.map((existing) =>
                existing.id === item.id
                  ? ({ ...existing, url, path: storedPath, status: "uploaded" } as UploadItem)
                  : existing
              );
              additionalImagesRef.current = next;
              syncAdditionalUrls(next);
              return next;
            });
            if (storedPath !== item.path) {
              void cleanupPaths([item.path!]);
            }
            registerTempPath(storedPath);
            successCount += 1;
          } catch (error) {
            setAdditionalImages((prev) => {
              const next: UploadItem[] = prev.map((existing) =>
                existing.id === item.id
                  ? ({ ...existing, status: "error", error: "Upload failed" } as UploadItem)
                  : existing
              );
              additionalImagesRef.current = next;
              syncAdditionalUrls(next);
              return next;
            });
            void cleanupPaths([item.path!]);
            toast.error(error instanceof Error ? error.message : "Failed to upload image");
          }
        })
      );
      if (successCount > 0) {
        toast.success(`${successCount} image(s) uploaded`);
      }
    },
    [cleanupPaths, registerTempPath, sessionId, syncAdditionalUrls, validateImageFile]
  );

  const removeCoverImage = useCallback(() => {
    if (coverImage?.previewUrl) {
      URL.revokeObjectURL(coverImage.previewUrl);
    }
    if (coverImage?.path) {
      void cleanupPaths([coverImage.path]);
    }
    setCoverImage(null);
    coverImageRef.current = null;
    setValue("image", "");
  }, [cleanupPaths, coverImage, setValue]);

  const removeAdditionalImage = useCallback(
    (id: string) => {
      setAdditionalImages((prev) => {
        const target = prev.find((item) => item.id === id);
        if (target?.previewUrl) {
          URL.revokeObjectURL(target.previewUrl);
        }
        if (target?.path) {
          void cleanupPaths([target.path]);
        }
        const next = prev.filter((item) => item.id !== id);
        additionalImagesRef.current = next;
        syncAdditionalUrls(next);
        return next;
      });
    },
    [cleanupPaths, syncAdditionalUrls]
  );

  const isUploading = useMemo(
    () =>
      coverImage?.status === "uploading" ||
      additionalImages.some((item) => item.status === "uploading"),
    [additionalImages, coverImage]
  );

  const finalizeImagesForSubmit = useCallback(
    async (data: MarketplaceFormData) => {
      const tempUploadPaths = Array.from(
        new Set(
          [coverImage?.path, ...additionalImages.map((item) => item.path)].filter(Boolean)
        )
      ) as string[];

      if (tempUploadPaths.length === 0) return data;

      const finalized = await finalizeTempUploads(tempUploadPaths);
      const mapping = new Map(finalized.files.map((file) => [file.from, file]));

      if (coverImage?.path && mapping.has(coverImage.path)) {
        const next = mapping.get(coverImage.path)!;
        data.image = next.url;
        setCoverImage((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, url: next.url, path: next.to };
          coverImageRef.current = updated;
          return updated;
        });
        setValue("image", next.url);
      }

      if (additionalImages.length > 0) {
        const nextAdditional = additionalImages.map((item) => {
          if (!item.path) return item;
          const next = mapping.get(item.path);
          return next ? { ...item, url: next.url, path: next.to } : item;
        });
        setAdditionalImages(nextAdditional);
        additionalImagesRef.current = nextAdditional;
        const nextUrls = nextAdditional
          .filter((item) => item.url && item.status === "uploaded")
          .map((item) => item.url!) as string[];
        data.images = nextUrls.length > 0 ? nextUrls : null;
        setValue("images", data.images);
      }

      markFinalized();
      return data;
    },
    [additionalImages, coverImage, finalizeTempUploads, markFinalized, setValue]
  );

  const handleCancel = useCallback(async () => {
    await cleanupPaths();
    clearUploads();
  }, [cleanupPaths, clearUploads]);

  return {
    coverImage,
    additionalImages,
    setCoverImage,
    setAdditionalImages,
    isUploading,
    handleCoverImageChange,
    handleAdditionalImagesChange,
    removeCoverImage,
    removeAdditionalImage,
    finalizeImagesForSubmit,
    handleCancel,
  };
}
