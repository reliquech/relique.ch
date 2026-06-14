"use client";

import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ConsignFormData } from "@/lib/validations/consignSchema";

interface ConsignFormFieldsProps {
  control: Control<ConsignFormData>;
}

export function ConsignFormFields({ control }: ConsignFormFieldsProps) {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
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
      <div className="grid md:grid-cols-2 gap-4">
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
      </div>
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
    </>
  );
}

