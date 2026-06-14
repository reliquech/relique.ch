"use client";

import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ConsignFormData } from "@/lib/validations/consignSchema";

interface EstimatedValueSectionProps {
  control: Control<ConsignFormData>;
}

export function EstimatedValueSection({ control }: EstimatedValueSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="estimatedValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Value (USD)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                value={field.value || ""}
                placeholder="0"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

