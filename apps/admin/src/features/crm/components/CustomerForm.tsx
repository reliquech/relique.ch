"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CustomerSchema } from "@/features/crm/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomField } from "@/lib/types";
import { CustomFieldsSection } from "@/features/crm/components/CustomFieldsSection";

export type CustomerFormData = z.infer<typeof CustomerSchema>;

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormData>;
  customFields?: CustomField[];
  customFieldValues?: Record<string, unknown>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CustomerForm({
  defaultValues,
  customFields = [],
  customFieldValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(CustomerSchema) as Resolver<CustomerFormData>,
    defaultValues: defaultValues ?? {
      status: "active",
    },
  });

  const [tagsInput, setTagsInput] = useState(() => (defaultValues?.tags ?? []).join(", "));
  const [customValues, setCustomValues] = useState<Record<string, unknown>>(customFieldValues ?? {});

  useEffect(() => {
    register("custom_fields");
  }, [register]);

  useEffect(() => {
    const next = (defaultValues?.tags ?? []).join(", ");
    setTagsInput(next);
    const tagsArray = next
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setValue("tags", tagsArray, { shouldDirty: false });
  }, [defaultValues?.tags, setValue]);

  useEffect(() => {
    setCustomValues(customFieldValues ?? {});
    setValue("custom_fields", customFieldValues ?? {}, { shouldDirty: false });
  }, [customFieldValues, setValue]);

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tagsArray = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setValue("tags", tagsArray, { shouldDirty: true });
  };

  const handleCustomFieldsChange = (next: Record<string, unknown>) => {
    setCustomValues(next);
    setValue("custom_fields", next, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-gray-300">Full name *</Label>
        <Input
          {...register("full_name")}
          className="bg-white/5 border-border text-white mt-1"
          placeholder="Full name"
        />
        {errors.full_name && (
          <p className="text-destructive text-xs mt-1">{errors.full_name.message}</p>
        )}
      </div>
      <div>
        <Label className="text-gray-300">Email</Label>
        <Input
          {...register("email")}
          type="email"
          className="bg-white/5 border-border text-white mt-1"
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label className="text-gray-300">Phone</Label>
        <Input
          {...register("phone")}
          className="bg-white/5 border-border text-white mt-1"
          placeholder="Phone"
        />
      </div>
      <div>
        <Label className="text-gray-300">Company</Label>
        <Input
          {...register("company")}
          className="bg-white/5 border-border text-white mt-1"
          placeholder="Company"
        />
      </div>
      <div>
        <Label className="text-gray-300">Address</Label>
        <Input
          {...register("address")}
          className="bg-white/5 border-border text-white mt-1"
          placeholder="Address"
        />
      </div>
      <div>
        <Label className="text-gray-300">Tags</Label>
        <Input
          value={tagsInput}
          onChange={(e) => handleTagsChange(e.target.value)}
          className="bg-white/5 border-border text-white mt-1"
          placeholder="vip, wholesale, nyc"
        />
        <p className="text-[10px] text-gray-500 mt-1">Separate tags with commas</p>
      </div>
      <div>
        <Label className="text-gray-300">Notes</Label>
        <textarea
          {...register("notes")}
          className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1 min-h-[80px]"
          placeholder="Notes"
        />
      </div>
      <div>
        <Label className="text-gray-300">Status</Label>
        <select
          {...register("status")}
          className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <CustomFieldsSection
        fields={customFields}
        values={customValues}
        onChange={handleCustomFieldsChange}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-border text-gray-300"
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
