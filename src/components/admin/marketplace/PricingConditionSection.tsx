import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarketplaceFormData } from "@/features/marketplace/schema";
import { inputClassName, textareaClassName } from "./shared";

interface PricingConditionSectionProps {
  register: UseFormRegister<MarketplaceFormData>;
  errors: FieldErrors<MarketplaceFormData>;
}

export function PricingConditionSection({
  register,
  errors,
}: PricingConditionSectionProps) {
  return (
    <Card className="bg-surface/40 border-border/60 backdrop-blur-md transition-all duration-300 hover:border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white tracking-tight">
          Pricing & Condition
        </CardTitle>
        <CardDescription className="text-textSec text-sm">
          Set pricing details, commission rate, and item condition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price_usd" className="text-sm font-semibold text-white">
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
              <p className="text-sm text-destructive mt-1">{errors.price_usd.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission_rate" className="text-sm font-semibold text-white">
              Commission Rate (%)
            </Label>
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

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-sm font-semibold text-white">
            Condition
          </Label>
          <Input
            id="condition"
            {...register("condition")}
            placeholder="e.g., Excellent, Good, Fair"
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="provenance" className="text-sm font-semibold text-white">
            Provenance
          </Label>
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
  );
}
