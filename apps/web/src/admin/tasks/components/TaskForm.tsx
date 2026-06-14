"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customersService } from "@/admin/crm/services/customersService";
import { leadsService } from "@/admin/crm/services/leadsService";
import { dealsService } from "@/admin/crm/services/dealsService";
import { messagesService } from "@/admin/crm/services/messagesService";

const TaskSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    status: z.enum(["open", "done"]).optional().default("open"),
    priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
    due_at: z.string().optional().nullable(),
    entity_type: z.enum(["lead", "deal", "message", "customer"]).optional().nullable(),
    entity_id: z.string().uuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.entity_id && !data.entity_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Entity type is required when entity ID is provided.",
        path: ["entity_type"],
      });
    }
    if (data.entity_type && !data.entity_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Entity ID is required when entity type is provided.",
        path: ["entity_id"],
      });
    }
  });

export type TaskFormData = z.infer<typeof TaskSchema>;

interface TaskFormProps {
  defaultValues?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TaskForm({ defaultValues, onSubmit, onCancel, isSubmitting = false }: TaskFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [entityQuery, setEntityQuery] = useState("");
  const [entityResults, setEntityResults] = useState<{ id: string; label: string; subtitle?: string }[]>([]);
  const [entityLoading, setEntityLoading] = useState(false);
  const [entityError, setEntityError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(TaskSchema) as Resolver<TaskFormData>,
    defaultValues: defaultValues ?? { status: "open", priority: "medium" },
  });

  const entityType = watch("entity_type");

  useEffect(() => {
    if (!entityType) {
      setEntityQuery("");
      setEntityResults([]);
      setEntityError(null);
    }
  }, [entityType]);

  useEffect(() => {
    if (!entityType) return;
    if (!entityQuery || entityQuery.trim().length < 2) {
      setEntityResults([]);
      setEntityError(null);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      setEntityLoading(true);
      setEntityError(null);
      try {
        if (entityType === "customer") {
          const res = await customersService.list({ q: entityQuery.trim(), page: 1, pageSize: 5 });
          if (cancelled) return;
          setEntityResults(
            res.items.map((item) => ({
              id: item.id,
              label: item.full_name,
              subtitle: item.email ?? item.company ?? undefined,
            }))
          );
        } else if (entityType === "lead") {
          const res = await leadsService.list({ q: entityQuery.trim(), page: 1, pageSize: 5 });
          if (cancelled) return;
          setEntityResults(
            res.items.map((item) => ({
              id: item.id,
              label: item.full_name,
              subtitle: item.email ?? item.company ?? undefined,
            }))
          );
        } else if (entityType === "deal") {
          const res = await dealsService.list({ q: entityQuery.trim(), page: 1, pageSize: 5 });
          if (cancelled) return;
          setEntityResults(
            res.items.map((item) => ({
              id: item.id,
              label: item.title,
              subtitle: item.status,
            }))
          );
        } else if (entityType === "message") {
          const res = await messagesService.list({ q: entityQuery.trim(), page: 1, pageSize: 5 });
          if (cancelled) return;
          setEntityResults(
            res.items.map((item) => ({
              id: item.id,
              label: item.subject ?? item.name,
              subtitle: item.email,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setEntityError(err instanceof Error ? err.message : "Failed to search entities");
        }
      } finally {
        if (!cancelled) {
          setEntityLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [entityQuery, entityType]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-gray-300">Title *</Label>
        <Input
          {...register("title")}
          className={`bg-white/5 border-border text-white mt-1 ${errors.title ? "border-destructive" : ""}`}
          placeholder="Follow up with client"
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label className="text-gray-300">Description</Label>
        <textarea
          {...register("description")}
          className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white min-h-[100px] mt-1"
          placeholder="Add details..."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-gray-300">Status</Label>
          <select
            {...register("status")}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
          >
            <option value="open">Open</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <Label className="text-gray-300">Priority</Label>
          <select
            {...register("priority")}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <Label className="text-gray-300">Due date</Label>
          <Input
            {...register("due_at")}
            type="date"
            className="bg-white/5 border-border text-white mt-1"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((prev) => !prev)}
        className="text-xs text-gray-400 hover:text-white"
      >
        {showAdvanced ? "Hide advanced" : "Show advanced"}
      </button>

      {showAdvanced ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-gray-300">Entity type</Label>
            <select
            {...register("entity_type", {
              setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : v),
            })}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
          >
              <option value="">None</option>
              <option value="lead">Lead</option>
              <option value="deal">Deal</option>
              <option value="message">Message</option>
              <option value="customer">Customer</option>
            </select>
            {errors.entity_type && <p className="text-destructive text-xs mt-1">{errors.entity_type.message}</p>}
          </div>
          <div>
            <Label className="text-gray-300">Entity ID</Label>
            <Input
            {...register("entity_id", {
              setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : v),
            })}
            className={`bg-white/5 border-border text-white mt-1 ${errors.entity_id ? "border-destructive" : ""}`}
            placeholder="UUID"
            aria-invalid={!!errors.entity_id}
            />
            {errors.entity_id && <p className="text-destructive text-xs mt-1">{errors.entity_id.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label className="text-gray-300">Find entity</Label>
            <Input
              value={entityQuery}
              onChange={(e) => setEntityQuery(e.target.value)}
              className="bg-white/5 border-border text-white mt-1"
              placeholder={entityType ? `Search ${entityType}...` : "Select entity type first"}
              disabled={!entityType}
            />
            {entityLoading && <p className="text-[10px] text-gray-500 mt-1">Searching...</p>}
            {entityError && <p className="text-[10px] text-destructive mt-1">{entityError}</p>}
            {entityResults.length > 0 && (
              <div className="mt-2 border border-border rounded-lg bg-surface/80 divide-y divide-border">
                {entityResults.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setValue("entity_id", item.id, { shouldValidate: true });
                      setEntityQuery("");
                      setEntityResults([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/5"
                  >
                    <p className="text-sm text-white">{item.label}</p>
                    {item.subtitle ? (
                      <p className="text-[10px] text-gray-500">{item.subtitle}</p>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

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
