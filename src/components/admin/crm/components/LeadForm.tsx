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
import { cn } from "@/lib/utils";

export type LeadFormData = z.infer<typeof LeadSchema>;

interface LeadFormProps {
  defaultValues?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  compact?: boolean;
  submitLabel?: string;
}

export function LeadForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  compact = false,
  submitLabel = "Save",
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      <div
        className={cn(
          "space-y-4",
          compact && "grid gap-4 space-y-0 sm:grid-cols-2",
        )}
      >
        <div className={compact ? "sm:col-span-2" : undefined}>
          <Label className="text-gray-300">Full name *</Label>
          <Input
            {...register("full_name")}
            className={`mt-1 bg-white/5 text-white placeholder:text-gray-500 ${errors.full_name ? "border-destructive" : "border-border"}`}
            placeholder="Full name"
            aria-invalid={!!errors.full_name}
          />
          {errors.full_name && (
            <p className="text-destructive text-xs mt-1">
              {errors.full_name.message}
            </p>
          )}
        </div>
        <div>
          <Label className="text-gray-300">Email</Label>
          <Input
            {...register("email")}
            type="email"
            className={`mt-1 bg-white/5 text-white placeholder:text-gray-500 ${errors.email ? "border-destructive" : "border-border"}`}
            placeholder="email@example.com"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <Label className="text-gray-300">Phone</Label>
          <Input
            {...register("phone")}
            className="mt-1 border-border bg-white/5 text-white placeholder:text-gray-500"
            placeholder="Phone"
          />
        </div>
        <div>
          <Label className="text-gray-300">Company</Label>
          <Input
            {...register("company")}
            className="mt-1 border-border bg-white/5 text-white placeholder:text-gray-500"
            placeholder="Company"
          />
        </div>
        <div>
          <Label className="text-gray-300">Source</Label>
          <Input
            {...register("source")}
            className="mt-1 border-border bg-white/5 text-white placeholder:text-gray-500"
            placeholder="Source"
          />
        </div>
        <div>
          <Label className="text-gray-300">Status</Label>
          <select
            {...register("status")}
            className="mt-1 h-10 w-full border border-border bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option className="bg-surface text-white" value="new">
              New
            </option>
            <option className="bg-surface text-white" value="contacted">
              Contacted
            </option>
            <option className="bg-surface text-white" value="qualified">
              Qualified
            </option>
            <option className="bg-surface text-white" value="unqualified">
              Unqualified
            </option>
          </select>
        </div>
        <div>
          <Label className="text-gray-300">Score</Label>
          <Input
            {...register("score", {
              setValueAs: (v) =>
                v === "" || v === undefined || v === null
                  ? undefined
                  : Number(v),
            })}
            type="number"
            className={`mt-1 bg-white/5 text-white placeholder:text-gray-500 ${errors.score ? "border-destructive" : "border-border"}`}
            placeholder="0"
            aria-invalid={!!errors.score}
          />
          {errors.score && (
            <p className="text-destructive text-xs mt-1">
              {errors.score.message}
            </p>
          )}
        </div>
      </div>
      <div
        className={cn(
          "mt-6 flex gap-3 border-t border-border pt-4",
          compact && "sticky bottom-0 -mx-1 bg-surface/95 px-1 pb-1",
        )}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-border text-gray-300 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
