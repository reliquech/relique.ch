"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

interface FileWithPreview extends File {
  preview?: string;
}

interface MarketplaceFormProps {
  onSubmit: (data: MarketplaceFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function MarketplaceForm({ onSubmit, onCancel, isSubmitting = false }: MarketplaceFormProps) {
  const [coverImage, setCoverImage] = useState<FileWithPreview | null>(null);
  const [additionalImages, setAdditionalImages] = useState<FileWithPreview[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/marketplace/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload file");
    }

    const data = await response.json();
    return data.url;
  };

  const handleCoverImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (8MB)
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Image size must be less than 8MB");
        return;
      }

      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      }) as FileWithPreview;

      setCoverImage(fileWithPreview);

      // Upload immediately
      setUploadingImage(true);
      try {
        const url = await uploadFile(file);
        setValue("image", url);
        toast.success("Cover image uploaded");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to upload image");
        setCoverImage(null);
      } finally {
        setUploadingImage(false);
      }
    },
    [setValue]
  );

  const handleAdditionalImagesChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const validFiles: FileWithPreview[] = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 8MB limit`);
          continue;
        }
        validFiles.push(
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }) as FileWithPreview
        );
      }

      if (validFiles.length === 0) return;

      setAdditionalImages((prev) => [...prev, ...validFiles]);

      // Upload all files
      setUploadingImage(true);
      try {
        const urls = await Promise.all(validFiles.map((f) => uploadFile(f)));
        const currentImages = watch("images") || [];
        setValue("images", [...currentImages, ...urls]);
        toast.success(`${validFiles.length} image(s) uploaded`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to upload images");
      } finally {
        setUploadingImage(false);
      }
    },
    [setValue, watch]
  );

  const removeCoverImage = () => {
    if (coverImage?.preview) {
      URL.revokeObjectURL(coverImage.preview);
    }
    setCoverImage(null);
    setValue("image", "");
  };

  const removeAdditionalImage = (index: number) => {
    const file = additionalImages[index];
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);

    // Update form value
    const currentImages = watch("images") || [];
    const newUrls = currentImages.filter((_, i) => i !== index);
    setValue("images", newUrls.length > 0 ? newUrls : null);
  };

  const onFormSubmit = async (data: MarketplaceFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Form submission error:", error);
    }
  };

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
            {coverImage || watch("image") ? (
              <div className="relative w-full h-48 clip-path-slant-lg border border-border/60 overflow-hidden bg-bg-0/20">
                {coverImage?.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverImage.preview}
                    alt="Cover preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                ) : watch("image") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={watch("image")}
                    alt="Cover"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground clip-path-slant hover:bg-destructive/90 transition-base"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="cover-image"
                className={cn(
                  "clip-path-slant-lg flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/60 bg-bg-0/20 cursor-pointer hover:bg-white/5 transition-base",
                  errors.image && "border-destructive",
                  uploadingImage && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadingImage ? (
                    <Loader2 className="w-10 h-10 mb-3 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  )}
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
                  onChange={handleCoverImageChange}
                  disabled={uploadingImage}
                />
              </label>
            )}
            {errors.image && (
              <p className="text-sm text-destructive">{errors.image.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Additional Images</Label>
            <label
              htmlFor="additional-images"
              className={cn(
                "clip-path-slant-lg flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/60 bg-bg-0/20 cursor-pointer hover:bg-white/5 transition-base",
                uploadingImage && "opacity-50 cursor-not-allowed"
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
                onChange={handleAdditionalImagesChange}
                disabled={uploadingImage}
              />
            </label>

            {additionalImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {additionalImages.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-full h-32 clip-path-slant border border-border/60 overflow-hidden bg-bg-0/20"
                  >
                    {file.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.preview}
                        alt={`Additional ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-1 right-1 p-2 bg-destructive text-destructive-foreground clip-path-slant hover:bg-destructive/90 transition-base"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
          onClick={() => onCancel?.() ?? window.history.back()}
          disabled={isSubmitting || uploadingImage}
          className="clip-path-slant border-border/70 bg-bg-0/30 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-[color:var(--relique-highlight-ice)] hover:text-[color:var(--relique-navy)] transition-base"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || uploadingImage}
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
