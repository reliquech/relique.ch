"use client";

import { Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ConsignFormData } from "@/lib/validations/consignSchema";

interface ItemDetailsSectionProps {
  control: Control<ConsignFormData>;
}

export function ItemDetailsSection({ control }: ItemDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="itemDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item Description *</FormLabel>
            <FormControl>
              <Textarea rows={6} placeholder="Provide a detailed description..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="sports">Sports Memorabilia</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="historical">Historical</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

