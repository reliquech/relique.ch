"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DealSchema } from "@/features/crm/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DealFormData = import("zod").infer<typeof DealSchema>;

interface DealFormProps {
  defaultValues?: Partial<DealFormData>;
  onSubmit: (data: DealFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DealForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DealFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(DealSchema) as Resolver<DealFormData>,
    defaultValues: defaultValues ?? { status: "open", currency: "USD", probability: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-gray-300">Title *</Label>
        <Input {...register("title")} className={`bg-white/5 border-border text-white mt-1 ${errors.title ? "border-destructive" : ""}`} placeholder="Deal title" aria-invalid={!!errors.title} />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label className="text-gray-300">Value</Label>
        <Input
          {...register("value", {
            setValueAs: (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
          })}
          type="number"
          step="0.01"
          className="bg-white/5 border-border text-white mt-1"
          placeholder="0"
        />
      </div>
      <div>
        <Label className="text-gray-300">Currency</Label>
        <Input {...register("currency")} className="bg-white/5 border-border text-white mt-1" placeholder="USD" />
      </div>
      <div>
        <Label className="text-gray-300">Probability (%)</Label>
        <Input
          {...register("probability", {
            setValueAs: (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
          })}
          type="number"
          min={0}
          max={100}
          className={`bg-white/5 border-border text-white mt-1 ${errors.probability ? "border-destructive" : ""}`}
          placeholder="0"
          aria-invalid={!!errors.probability}
        />
        {errors.probability && <p className="text-destructive text-xs mt-1">{errors.probability.message}</p>}
      </div>
      <div>
        <Label className="text-gray-300">Expected close date</Label>
        <Input {...register("expected_close_date")} type="date" className="bg-white/5 border-border text-white mt-1" />
      </div>
      <div>
        <Label className="text-gray-300">Status</Label>
        <select {...register("status")} className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1">
          <option value="open">Open</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>
      <div>
        <Label className="text-gray-300">Notes</Label>
        <textarea {...register("notes")} className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1 min-h-[80px]" placeholder="Notes" />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-border text-gray-300">Cancel</Button>
        <Button type="submit" className="flex-1 bg-primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}
