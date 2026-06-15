import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceFormData } from "@/features/marketplace/schema";
import { inputClassName, textareaClassName } from "./shared";

interface ConditionProvenanceSectionProps {
  register: UseFormRegister<MarketplaceFormData>;
}

export function ConditionProvenanceSection({ register }: ConditionProvenanceSectionProps) {
  return (
    <Card className="bg-surface/40 border-border/60 backdrop-blur-md transition-all duration-300 hover:border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white tracking-tight">Condition & Provenance</CardTitle>
        <CardDescription className="text-textSec text-sm">Item condition and history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="condition" className="text-sm font-semibold text-white">Condition</Label>
          <Input
            id="condition"
            {...register("condition")}
            placeholder="e.g., Excellent, Good, Fair"
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="provenance" className="text-sm font-semibold text-white">Provenance</Label>
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
