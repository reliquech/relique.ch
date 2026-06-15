import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarketplaceFormData } from "@/features/marketplace/schema";
import { inputClassName, selectClassName, checkboxClassName } from "./shared";

interface AthleteCollectorCategorySectionProps {
  register: UseFormRegister<MarketplaceFormData>;
  errors: FieldErrors<MarketplaceFormData>;
}

export function AthleteCollectorCategorySection({
  register,
  errors,
}: AthleteCollectorCategorySectionProps) {
  return (
    <Card className="bg-surface/40 border-border/60 backdrop-blur-md transition-all duration-300 hover:border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white tracking-tight">
          Athlete, Collector & Category
        </CardTitle>
        <CardDescription className="text-textSec text-sm">
          Categorization, signer details, and collector profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold text-white">
              Category <span className="text-destructive">*</span>
            </Label>
            <select
              id="category"
              {...register("category")}
              className={cn(selectClassName, errors.category && "border-destructive")}
            >
              <option value="">Select a category</option>
              <option value="premium">Premium</option>
              <option value="sport">Sport</option>
              <option value="collector">Collector</option>
              <option value="story">Story</option>
            </select>
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signed_by" className="text-sm font-semibold text-white">
              Signed By / Athlete
            </Label>
            <Input
              id="signed_by"
              {...register("signed_by")}
              placeholder="e.g., Michael Jordan"
              className={inputClassName}
            />
            {errors.signed_by && (
              <p className="text-sm text-destructive mt-1">{errors.signed_by.message}</p>
            )}
          </div>
        </div>

        <div className="border-t border-border/40 pt-4 space-y-4">
          <h4 className="text-sm font-bold text-white/80">Collector Information</h4>
          
          <div className="space-y-2">
            <Label htmlFor="seller_name" className="text-sm font-semibold text-white">
              Seller Name
            </Label>
            <Input
              id="seller_name"
              {...register("seller_name")}
              placeholder="Seller name"
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="seller_rating" className="text-sm font-semibold text-white">
                Seller Rating (0-5)
              </Label>
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
                <p className="text-sm text-destructive mt-1">{errors.seller_rating.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2.5 pb-2.5">
              <input
                type="checkbox"
                id="seller_verified"
                {...register("seller_verified")}
                className={checkboxClassName}
              />
              <Label
                htmlFor="seller_verified"
                className="cursor-pointer text-sm font-medium text-white select-none"
              >
                Seller is verified
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
