import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceFormData } from "@/features/marketplace/schema";
import { inputClassName, checkboxClassName } from "./shared";

interface SellerInfoSectionProps {
  register: UseFormRegister<MarketplaceFormData>;
  errors: FieldErrors<MarketplaceFormData>;
}

export function SellerInfoSection({ register, errors }: SellerInfoSectionProps) {
  return (
    <Card className="bg-surface/40 border-border/60 backdrop-blur-md transition-all duration-300 hover:border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white tracking-tight">Seller Information</CardTitle>
        <CardDescription className="text-textSec text-sm">Optional seller details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="seller_name" className="text-sm font-semibold text-white">Seller Name</Label>
          <Input
            id="seller_name"
            {...register("seller_name")}
            placeholder="Seller name"
            className={inputClassName}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="seller_rating" className="text-sm font-semibold text-white">Seller Rating (0-5)</Label>
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
            <Label htmlFor="seller_verified" className="cursor-pointer text-sm font-medium text-white select-none">
              Seller is verified
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
