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

interface SignatureInformationSectionProps {
  control: Control<ConsignFormData>;
}

export function SignatureInformationSection({ control }: SignatureInformationSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="signedBy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Signed By</FormLabel>
            <FormControl>
              <Input placeholder="Name of signer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="numberOfSignatures"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Signatures</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

