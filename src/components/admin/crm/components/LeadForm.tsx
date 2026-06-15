"use client";

import React from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LeadSchema } from "@/features/crm/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LeadFormData = z.infer<typeof LeadSchema>;

interface LeadFormProps {
  defaultValues?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function LeadForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(LeadSchema) as Resolver<LeadFormData>,
    defaultValues: defaultValues ?? { status: "new", score: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-gray-300">Full name *</Label>
        <Input {...register("full_name")} className={`bg-white/5 border-border text-white mt-1 ${errors.full_name ? "border-destructive" : ""}`} placeholder="Full name" aria-invalid={!!errors.full_name} />
        {errors.full_name && <p className="text-destructive text-xs mt-1">{errors.full_name.message}</p>}
      </div>
      <div>
        <Label className="text-gray-300">Email</Label>
        <Input {...register("email")} type="email" className={`bg-white/5 border-border text-white mt-1 ${errors.email ? "border-destructive" : ""}`} placeholder="email@example.com" aria-invalid={!!errors.email} />
        {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label className="text-gray-300">Phone</Label>
        <Input {...register("phone")} className="bg-white/5 border-border text-white mt-1" placeholder="Phone" />
      </div>
      <div>
        <Label className="text-gray-300">Company</Label>
        <Input {...register("company")} className="bg-white/5 border-border text-white mt-1" placeholder="Company" />
      </div>
      <div>
        <Label className="text-gray-300">Source</Label>
        <Input {...register("source")} className="bg-white/5 border-border text-white mt-1" placeholder="Source" />
      </div>
      <div>
        <Label className="text-gray-300">Status</Label>
        <select {...register("status")} className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1">
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="unqualified">Unqualified</option>
        </select>
      </div>
      <div>
        <Label className="text-gray-300">Score</Label>
        <Input
          {...register("score", { setValueAs: (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)) })}
          type="number"
          className={`bg-white/5 border-border text-white mt-1 ${errors.score ? "border-destructive" : ""}`}
          placeholder="0"
          aria-invalid={!!errors.score}
        />
        {errors.score && <p className="text-destructive text-xs mt-1">{errors.score.message}</p>}
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-border text-gray-300">Cancel</Button>
        <Button type="submit" className="flex-1 bg-primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}
