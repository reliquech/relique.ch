"use client";

import React from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PipelineStageSchema } from "@/admin/crm/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PipelineStageFormData = z.infer<typeof PipelineStageSchema>;

interface PipelineStageFormProps {
  defaultValues?: Partial<PipelineStageFormData>;
  onSubmit: (data: PipelineStageFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PipelineStageForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PipelineStageFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PipelineStageFormData>({
    resolver: zodResolver(PipelineStageSchema) as Resolver<PipelineStageFormData>,
    defaultValues: defaultValues ?? { position: 1, is_default: false },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-gray-300">Name *</Label>
        <Input
          {...register("name")}
          className={`bg-white/5 border-border text-white mt-1 ${errors.name ? "border-destructive" : ""}`}
          placeholder="Stage name"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label className="text-gray-300">Position</Label>
        <Input
          {...register("position", {
            setValueAs: (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
          })}
          type="number"
          min={1}
          className="bg-white/5 border-border text-white mt-1"
          placeholder="1"
        />
      </div>
      <div>
        <Label className="text-gray-300">Color</Label>
        <Input {...register("color")} className="bg-white/5 border-border text-white mt-1" placeholder="#hex or name" />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("is_default")}
          id="is_default"
          className="rounded border-border bg-white/5"
        />
        <Label htmlFor="is_default" className="text-gray-300">Default stage</Label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-border text-gray-300">Cancel</Button>
        <Button type="submit" className="flex-1 bg-primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}
