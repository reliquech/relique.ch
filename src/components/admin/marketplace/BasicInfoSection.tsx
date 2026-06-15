import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarketplaceFormData } from "@/features/marketplace/schema";
import { inputClassName, textareaClassName } from "./shared";

interface BasicInfoSectionProps {
  register: UseFormRegister<MarketplaceFormData>;
  errors: FieldErrors<MarketplaceFormData>;
}

export function BasicInfoSection({ register, errors }: BasicInfoSectionProps) {
  return (
    <Card className="bg-surface/40 border-border/60 backdrop-blur-md transition-all duration-300 hover:border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white tracking-tight">Basic Information</CardTitle>
        <CardDescription className="text-textSec text-sm">Required information for the marketplace item</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold text-white">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Enter item title"
            className={cn(inputClassName, errors.title && "border-destructive")}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-white">
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
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_description" className="text-sm font-semibold text-white">Full Description</Label>
          <textarea
            id="full_description"
            {...register("full_description")}
            placeholder="Enter detailed description (optional)"
            rows={6}
            className={textareaClassName}
          />
          {errors.full_description && (
            <p className="text-sm text-destructive mt-1">{errors.full_description.message}</p>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
