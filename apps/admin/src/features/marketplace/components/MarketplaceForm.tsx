"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MarketplaceImageSection,
  type ImageUploadItem,
} from "@/features/marketplace/components/MarketplaceImageSection";
import { useMarketplaceTempUploads } from "@/features/marketplace/hooks/useMarketplaceTempUploads";
import { createTempUploadPath } from "@/features/marketplace/utils/uploadPaths";

// Validation schema matching API route
const MarketplaceFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required"),
  full_description: z.string().optional().nullable(),
  price_usd: z.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  image: z.string().min(1, "Image is required"),
  images: z.array(z.string()).optional().nullable(),
  status: z.enum(["draft", "pending", "published", "suspended", "unpublished", "archived"]).optional(),
  authenticated: z.boolean().optional(),
  certificate: z.string().optional().nullable(),
  authenticated_date: z.string().optional().nullable(),
  coa_issuer: z.string().optional().nullable(),
  signed_by: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  provenance: z.string().optional().nullable(),
  seller_name: z.string().optional().nullable(),
  seller_rating: z.number().min(0).max(5).optional().nullable(),
  seller_verified: z.boolean().optional().nullable(),
  is_featured: z.boolean().optional(),
  featured_order: z.number().optional().nullable(),
  commission_rate: z.number().min(0).max(100).optional().nullable(),
});

export type MarketplaceFormData = z.infer<typeof MarketplaceFormSchema>;

type UploadItem = ImageUploadItem & {
  file?: File;
  path?: string;
};

interface MarketplaceFormProps {
  onSubmit: (data: MarketplaceFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function MarketplaceForm({ onSubmit, onCancel, isSubmitting = false }: MarketplaceFormProps) {
  const [coverImage, setCoverImage] = useState<UploadItem | null>(null);
  const [additionalImages, setAdditionalImages] = useState<UploadItem[]>([]);
  const coverImageRef = useRef<UploadItem | null>(null);
  const additionalImagesRef = useRef<UploadItem[]>([]);

  const inputClassName =
    "border-border/60 bg-bg-0/30 focus-visible:ring-[color:var(--relique-primary-blue)] focus-visible:ring-offset-2";
  const textareaClassName =
    "flex w-full rounded-none border border-border/60 bg-bg-0/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--relique-primary-blue)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const selectClassName =
    "flex h-10 w-full rounded-none border border-border/60 bg-bg-0/30 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--relique-primary-blue)] focus-visible:ring-offset-2";
  const checkboxClassName =
    "h-4 w-4 rounded-none border border-border/60 bg-bg-0/30 accent-[var(--relique-primary-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--relique-primary-blue)] focus-visible:ring-offset-2";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MarketplaceFormData>({
    resolver: zodResolver(MarketplaceFormSchema) as Resolver<MarketplaceFormData>,
    defaultValues: {
      status: "draft",
      authenticated: false,
      is_featured: false,
    },
  });

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

  const uploadFile = async (file: File, path: string): Promise<{ url: string; path: string }> => {
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
  };

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
        const { url, path: storedPath } = await uploadFile(file, path);
        if (coverImageRef.current?.id !== path) {
          void cleanupPaths([storedPath, path]);
          return;
        }
        setCoverImage((prev) => {
          if (!prev) return prev;
          const next = { ...prev, url, path: storedPath, status: "uploaded" };
          coverImageRef.current = next;
          return next;
        });
        if (storedPath !== path) {
          void cleanupPaths([path]);
        }
        registerTempPath(storedPath);
        setValue("image", url);
        toast.success("Cover image uploaded");
      } catch (error) {
        setCoverImage((prev) => {
          if (!prev) return prev;
          const next = { ...prev, status: "error", error: "Upload failed" };
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
            const { url, path: storedPath } = await uploadFile(item.file!, item.path!);
            if (!additionalImagesRef.current.some((existing) => existing.id === item.id)) {
              void cleanupPaths([storedPath, item.path!]);
              return;
            }
            setAdditionalImages((prev) => {
              const next = prev.map((existing) =>
                existing.id === item.id
                  ? { ...existing, url, path: storedPath, status: "uploaded" }
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
              const next = prev.map((existing) =>
                existing.id === item.id
                  ? { ...existing, status: "error", error: "Upload failed" }
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

  const onFormSubmit = async (data: MarketplaceFormData) => {
    try {
      const tempUploadPaths = Array.from(
        new Set([
          coverImage?.path,
          ...additionalImages.map((item) => item.path),
        ].filter(Boolean))
      ) as string[];

      if (tempUploadPaths.length > 0) {
        const finalized = await finalizeTempUploads(tempUploadPaths);
        const mapping = new Map(
          finalized.files.map((file) => [file.from, file])
        );

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
      }

      markFinalized();
      await onSubmit(data);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("finalize")) {
        toast.error(error.message);
      }
      // Error handling is done in parent component
      console.error("Form submission error:", error);
    }
  };

  const handleCancel = useCallback(async () => {
    await cleanupPaths();
    clearUploads();
    onCancel?.() ?? window.history.back();
  }, [cleanupPaths, clearUploads, onCancel]);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Basic Information */}
      <Card className="bg-surface/40 border-border/60">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Required information for the marketplace item</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter item title"
              className={cn(inputClassName, errors.title && "border-destructive")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Enter item description"
              rows={4}
              className={cn(
                textareaClassName,
                errors.description && "border-destructive"
              )}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_description">Full Description</Label>
            <textarea
              id="full_description"
              {...register("full_description")}
              placeholder="Enter detailed description (optional)"
              rows={6}
              className={textareaClassName}
            />
            {errors.full_description && (
              <p className="text-sm text-destructive">{errors.full_description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_usd">
                Price (USD) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price_usd"
                type="number"
                step="0.01"
                {...register("price_usd", { valueAsNumber: true })}
                placeholder="0.00"
                className={cn(inputClassName, errors.price_usd && "border-destructive")}
              />
              {errors.price_usd && (
                <p className="text-sm text-destructive">{errors.price_usd.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="e.g., Jersey, Memorabilia"
                className={cn(inputClassName, errors.category && "border-destructive")}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <MarketplaceImageSection
        coverImage={coverImage}
        additionalImages={additionalImages}
        onCoverChange={handleCoverImageChange}
        onCoverRemove={removeCoverImage}
        onAdditionalChange={handleAdditionalImagesChange}
        onAdditionalRemove={removeAdditionalImage}
        coverError={errors.image?.message}
        isUploading={isUploading}
      />

      {/* Athlete & Authentication */}
      <Card className="bg-surface/40 border-border/60">
        <CardHeader>
          <CardTitle>Athlete & Authentication</CardTitle>
          <CardDescription>Information about the athlete and authentication status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signed_by">Signed By / Athlete</Label>
            <Input
              id="signed_by"
              {...register("signed_by")}
              placeholder="e.g., Michael Jordan"
              className={inputClassName}
            />
            {errors.signed_by && (
              <p className="text-sm text-destructive">{errors.signed_by.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="authenticated"
              {...register("authenticated")}
              className={checkboxClassName}
            />
            <Label htmlFor="authenticated" className="cursor-pointer">
              Item is authenticated
            </Label>
          </div>

          {watch("authenticated") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="certificate">Certificate</Label>
                <Input
                  id="certificate"
                  {...register("certificate")}
                  placeholder="Certificate number or details"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coa_issuer">COA Issuer</Label>
                <Input
                  id="coa_issuer"
                  {...register("coa_issuer")}
                  placeholder="Certificate of Authenticity issuer"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authenticated_date">Authenticated Date</Label>
                <Input
                  id="authenticated_date"
                  type="date"
                  {...register("authenticated_date")}
                  className={inputClassName}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Condition & Provenance */}
      <Card className="bg-surface/40 border-border/60">
        <CardHeader>
          <CardTitle>Condition & Provenance</CardTitle>
          <CardDescription>Item condition and history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Input
              id="condition"
              {...register("condition")}
              placeholder="e.g., Excellent, Good, Fair"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provenance">Provenance</Label>
            <textarea
              id="provenance"
              {...register("provenance")}
              placeholder="Item history and provenance"
              rows={4}
              className={textareaClassName}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seller Information */}
      <Card className="bg-surface/40 border-border/60">
        <CardHeader>
          <CardTitle>Seller Information</CardTitle>
          <CardDescription>Optional seller details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seller_name">Seller Name</Label>
            <Input
              id="seller_name"
              {...register("seller_name")}
              placeholder="Seller name"
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seller_rating">Seller Rating (0-5)</Label>
              <Input
                id="seller_rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register("seller_rating", { valueAsNumber: true })}
                placeholder="0.0"
                className={inputClassName}
              />
              {errors.seller_rating && (
                <p className="text-sm text-destructive">{errors.seller_rating.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="seller_verified"
                {...register("seller_verified")}
                className={checkboxClassName}
              />
              <Label htmlFor="seller_verified" className="cursor-pointer">
                Seller is verified
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Settings */}
      <Card className="bg-surface/40 border-border/60">
        <CardHeader>
          <CardTitle>Status & Settings</CardTitle>
          <CardDescription>Publishing and feature settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              {...register("status")}
              className={selectClassName}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="suspended">Suspended</option>
              <option value="unpublished">Unpublished</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_featured"
              {...register("is_featured")}
              className={checkboxClassName}
            />
            <Label htmlFor="is_featured" className="cursor-pointer">
              Feature this item
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="featured_order">Featured Order</Label>
              <Input
                id="featured_order"
                type="number"
                {...register("featured_order", { valueAsNumber: true })}
                placeholder="Order in featured carousel"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("commission_rate", { valueAsNumber: true })}
                placeholder="0.00"
                className={inputClassName}
              />
              {errors.commission_rate && (
                <p className="text-sm text-destructive">{errors.commission_rate.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting || isUploading}
          className="clip-path-slant border-border/70 bg-bg-0/30 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-[color:var(--relique-highlight-ice)] hover:text-[color:var(--relique-navy)] transition-base"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="clip-path-slant bg-[color:var(--relique-primary-blue)] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-[color:var(--relique-accent-blue)] shadow-[0_20px_40px_rgba(28,77,141,0.2)] transition-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Item"
          )}
        </Button>
      </div>
    </form>
  );
}
