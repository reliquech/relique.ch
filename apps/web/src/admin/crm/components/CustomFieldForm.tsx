"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FieldTypeSchema = z.enum(["text", "number", "date", "select", "multiselect", "boolean", "textarea", "url"]);

const CustomFieldSchema = z
  .object({
    name: z.string().min(1),
    key: z.string().min(1).regex(/^[a-z][a-z0-9_]*$/),
    entity_type: z.enum(["customer", "lead", "deal", "message"]),
    field_type: FieldTypeSchema,
    required: z.boolean().optional().default(false),
    options: z.array(z.string()).optional().nullable(),
    position: z.number().int().min(1).optional(),
    group: z.string().optional().nullable(),
    visibility_rules: z.record(z.string(), z.unknown()).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if ((data.field_type === "select" || data.field_type === "multiselect") && (!data.options || data.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options are required for select fields",
        path: ["options"],
      });
    }
  });

export type CustomFieldFormData = z.infer<typeof CustomFieldSchema>;

interface CustomFieldFormProps {
  defaultValues?: Partial<CustomFieldFormData>;
  disableEntityType?: boolean;
  onSubmit: (data: CustomFieldFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function normalizeOptions(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CustomFieldForm({
  defaultValues,
  disableEntityType = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CustomFieldFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomFieldFormData>({
    resolver: zodResolver(CustomFieldSchema) as Resolver<CustomFieldFormData>,
    defaultValues: defaultValues ?? {
      entity_type: "customer",
      field_type: "text",
      required: false,
    },
  });

  const fieldType = watch("field_type");
  const [optionsInput, setOptionsInput] = useState("");

  useEffect(() => {
    if (!defaultValues?.options) return;
    setOptionsInput((defaultValues.options ?? []).join(", "));
  }, [defaultValues?.options]);

  useEffect(() => {
    if (fieldType !== "select" && fieldType !== "multiselect") {
      setOptionsInput("");
      setValue("options", undefined, { shouldDirty: true });
    }
  }, [fieldType, setValue]);

  const handleOptionsChange = (value: string) => {
    setOptionsInput(value);
    setValue("options", normalizeOptions(value), { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-gray-300">Field name *</Label>
        <Input
          {...register("name")}
          className={`bg-white/5 border-border text-white mt-1 ${errors.name ? "border-destructive" : ""}`}
          placeholder="Account tier"
        />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label className="text-gray-300">Key *</Label>
        <Input
          {...register("key")}
          className={`bg-white/5 border-border text-white mt-1 ${errors.key ? "border-destructive" : ""}`}
          placeholder="account_tier"
        />
        {errors.key && <p className="text-destructive text-xs mt-1">{errors.key.message}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-300">Entity</Label>
          <select
            {...register("entity_type")}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
            disabled={disableEntityType}
          >
            <option value="customer">Customer</option>
            <option value="lead">Lead</option>
            <option value="deal">Deal</option>
            <option value="message">Message</option>
          </select>
        </div>
        <div>
          <Label className="text-gray-300">Field type</Label>
          <select
            {...register("field_type")}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="select">Select</option>
            <option value="multiselect">Multi-select</option>
            <option value="boolean">Boolean</option>
            <option value="textarea">Textarea</option>
            <option value="url">URL</option>
          </select>
        </div>
      </div>
      {(fieldType === "select" || fieldType === "multiselect") && (
        <div>
          <Label className="text-gray-300">Options (comma separated)</Label>
          <Input
            value={optionsInput}
            onChange={(e) => handleOptionsChange(e.target.value)}
            className="bg-white/5 border-border text-white mt-1"
            placeholder="vip, wholesale, enterprise"
          />
          {errors.options && (
            <p className="text-destructive text-xs mt-1">{errors.options.message as string}</p>
          )}
        </div>
      )}
      <div>
        <Label className="text-gray-300">Group (section name)</Label>
        <Input
          {...register("group")}
          className="bg-white/5 border-border text-white mt-1"
          placeholder="e.g. Billing"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-300">Position</Label>
          <Input
            {...register("position", {
              setValueAs: (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
            })}
            type="number"
            min={1}
            className={`bg-white/5 border-border text-white mt-1 ${errors.position ? "border-destructive" : ""}`}
            placeholder="1"
          />
          {errors.position && <p className="text-destructive text-xs mt-1">{errors.position.message}</p>}
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="required" {...register("required")} className="h-4 w-4" />
          <Label htmlFor="required" className="text-gray-300">Required</Label>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-border text-gray-300">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
