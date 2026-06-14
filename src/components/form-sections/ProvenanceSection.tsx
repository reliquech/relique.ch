"use client";

import { Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ConsignFormData } from "@/lib/validations/consignSchema";

interface ProvenanceSectionProps {
  control: Control<ConsignFormData>;
}

export function ProvenanceSection({ control }: ProvenanceSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="provenance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Provenance</FormLabel>
            <FormControl>
              <Textarea rows={4} placeholder="History of ownership and authenticity..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="background"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Background</FormLabel>
            <FormControl>
              <Textarea rows={4} placeholder="Additional background information..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

