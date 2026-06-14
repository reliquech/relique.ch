"use client";

import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ConsignFormData } from "@/lib/validations/consignSchema";

interface AdditionalInformationSectionProps {
  control: Control<ConsignFormData>;
}

export function AdditionalInformationSection({ control }: AdditionalInformationSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="coaIssuer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>COA Issuer (if any)</FormLabel>
            <FormControl>
              <Input placeholder="Certificate issuer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="howDidYouHear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How did you hear about us?</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="search">Search Engine</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
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

