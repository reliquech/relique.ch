import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceFormData } from "@/features/marketplace/schema";
import { inputClassName, selectClassName, checkboxClassName } from "./shared";

interface StatusSettingsSectionProps {
  register: UseFormRegister<MarketplaceFormData>;
  errors: FieldErrors<MarketplaceFormData>;
}

export function StatusSettingsSection({ register, errors }: StatusSettingsSectionProps) {
  return (
    <Card className="bg-surface/40 border-border/60 backdrop-blur-md transition-all duration-300 hover:border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white tracking-tight">Status & Settings</CardTitle>
        <CardDescription className="text-textSec text-sm">Publishing and feature settings</CardDescription>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="featured_order" className="text-sm font-semibold text-white">Featured Order</Label>
            <Input
              id="featured_order"
              type="number"
              {...register("featured_order", { valueAsNumber: true })}
              placeholder="Order in featured carousel"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission_rate" className="text-sm font-semibold text-white">Commission Rate (%)</Label>
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
              <p className="text-sm text-destructive mt-1">{errors.commission_rate.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
