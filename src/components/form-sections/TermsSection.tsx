"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ConsignFormData } from "@/lib/validations/consignSchema";

interface TermsSectionProps {
  control: Control<ConsignFormData>;
}

export function TermsSection({ control }: TermsSectionProps) {
  return (
    <FormField
      control={control}
      name="consent"
      render={({ field }) => (
        <FormItem className="flex items-start gap-2">
          <FormControl>
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              className="mt-1"
            />
          </FormControl>
          <div className="space-y-1">
            <FormLabel className="text-sm">
              I acknowledge that I have read and agree to the{" "}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="/policies" className="text-primary hover:underline">Privacy Policy</a>. *
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

