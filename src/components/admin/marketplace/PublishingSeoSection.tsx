import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarketplaceFormData } from "@/features/marketplace/schema";
import { inputClassName, selectClassName, checkboxClassName, textareaClassName } from "./shared";

interface PublishingSeoSectionProps {
  register: UseFormRegister<MarketplaceFormData>;
  errors: FieldErrors<MarketplaceFormData>;
  watch: UseFormWatch<MarketplaceFormData>;
}

export function PublishingSeoSection({
  register,
  errors,
  watch,
}: PublishingSeoSectionProps) {
  const seoTitle = watch("seo_title") || "";
  const seoDesc = watch("seo_description") || "";

  return (
    <Card className="bg-surface/40 border-border/60 backdrop-blur-md transition-all duration-300 hover:border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white tracking-tight">
          Publishing & SEO
        </CardTitle>
        <CardDescription className="text-textSec text-sm">
          Configure status, featured settings, and search engine metadata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-semibold text-white">Status</Label>
          <select
            id="status"
            {...register("status")}
            className={selectClassName}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          {errors.status && (
            <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2.5 py-1">
          <input
            type="checkbox"
            id="is_featured"
            {...register("is_featured")}
            className={checkboxClassName}
          />
          <Label htmlFor="is_featured" className="cursor-pointer text-sm font-medium text-white select-none">
            Feature this item
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured_order" className="text-sm font-semibold text-white">Featured Order</Label>
          <Input
            id="featured_order"
            type="number"
            {...register("featured_order", { valueAsNumber: true })}
            placeholder="Order in featured carousel (optional)"
            className={inputClassName}
          />
        </div>

        <div className="border-t border-border/40 pt-4 space-y-4">
          <h4 className="text-sm font-bold text-white/80">SEO Configuration</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo_title" className="text-sm font-semibold text-white">SEO Title</Label>
              <span className={cn(
                "text-[10px] font-semibold",
                seoTitle.length > 60 ? "text-warning" : "text-gray-400"
              )}>
                {seoTitle.length} / 60 chars
              </span>
            </div>
            <Input
              id="seo_title"
              {...register("seo_title")}
              placeholder="Search engine optimized title"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo_description" className="text-sm font-semibold text-white">SEO Description</Label>
              <span className={cn(
                "text-[10px] font-semibold",
                seoDesc.length > 160 ? "text-warning" : "text-gray-400"
              )}>
                {seoDesc.length} / 160 chars
              </span>
            </div>
            <textarea
              id="seo_description"
              {...register("seo_description")}
              placeholder="Brief summary for search engine results"
              rows={3}
              className={textareaClassName}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
