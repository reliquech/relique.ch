"use client";

import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ConditionTypeSchema = z.enum([
  "lead_stale",
  "lead_status",
  "lead_score_min",
  "lead_score_max",
  "lead_source",
  "deal_stale",
  "deal_status",
  "deal_value_min",
  "deal_value_max",
  "message_unread",
  "message_status",
  "message_source",
]);

const ConditionSchema = z.object({
  type: ConditionTypeSchema,
  value: z.string().optional(),
});

const AutomationRuleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  conditions: z.array(ConditionSchema).min(1),
  action_type: z.enum(["create_notification", "create_task"]),
  due_in_days: z.number().int().min(0).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  title_template: z.string().optional(),
  enabled: z.boolean().optional().default(true),
  cooldown_hours: z.number().int().min(1).optional(),
});

export type AutomationRuleFormData = z.infer<typeof AutomationRuleSchema>;

const CONDITION_DEFS: Record<
  string,
  {
    label: string;
    entity: "lead" | "deal" | "message";
    input: "number" | "text" | "select";
    paramLabel: string;
    options?: string[];
  }
> = {
  lead_stale: { label: "Lead stale", entity: "lead", input: "number", paramLabel: "Days" },
  lead_status: { label: "Lead status", entity: "lead", input: "select", paramLabel: "Status", options: ["new", "contacted", "qualified", "unqualified"] },
  lead_score_min: { label: "Lead score ≥", entity: "lead", input: "number", paramLabel: "Min score" },
  lead_score_max: { label: "Lead score ≤", entity: "lead", input: "number", paramLabel: "Max score" },
  lead_source: { label: "Lead source", entity: "lead", input: "text", paramLabel: "Source" },
  deal_stale: { label: "Deal stale", entity: "deal", input: "number", paramLabel: "Days" },
  deal_status: { label: "Deal status", entity: "deal", input: "select", paramLabel: "Status", options: ["open", "won", "lost"] },
  deal_value_min: { label: "Deal value ≥", entity: "deal", input: "number", paramLabel: "Min value" },
  deal_value_max: { label: "Deal value ≤", entity: "deal", input: "number", paramLabel: "Max value" },
  message_unread: { label: "Message unread", entity: "message", input: "number", paramLabel: "Hours" },
  message_status: { label: "Message status", entity: "message", input: "select", paramLabel: "Status", options: ["new", "open", "pending", "closed"] },
  message_source: { label: "Message source", entity: "message", input: "text", paramLabel: "Source" },
};

interface AutomationRuleFormProps {
  defaultValues?: Partial<AutomationRuleFormData>;
  onSubmit: (data: AutomationRuleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AutomationRuleForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AutomationRuleFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AutomationRuleFormData>({
    resolver: zodResolver(AutomationRuleSchema) as Resolver<AutomationRuleFormData>,
    defaultValues: defaultValues ?? {
      conditions: [{ type: "lead_stale", value: "7" }],
      action_type: "create_notification",
      due_in_days: 1,
      priority: "medium",
      enabled: true,
      cooldown_hours: 24,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "conditions",
  });

  const actionType = watch("action_type");
  const firstConditionType = watch("conditions.0.type");
  const entity = firstConditionType ? CONDITION_DEFS[firstConditionType]?.entity : null;

  const conditionOptions = Object.entries(CONDITION_DEFS)
    .filter(([, def]) => !entity || def.entity === entity)
    .map(([value, def]) => ({ value, label: def.label }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-gray-300">Rule name *</Label>
        <Input
          {...register("name")}
          className={`bg-white/5 border-border text-white mt-1 ${errors.name ? "border-destructive" : ""}`}
          placeholder="Stale leads follow-up"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="space-y-3">
        <Label className="text-gray-300">Conditions</Label>
        {fields.map((field, index) => {
          const type = watch(`conditions.${index}.type` as const);
          const def = CONDITION_DEFS[type];

          return (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                {...register(`conditions.${index}.type` as const)}
                className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white"
              >
                {conditionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="sm:col-span-2">
                {def?.input === "select" ? (
                  <select
                    {...register(`conditions.${index}.value` as const)}
                    className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="">Select {def.paramLabel}</option>
                    {def.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    {...register(`conditions.${index}.value` as const)}
                    type={def?.input === "number" ? "number" : "text"}
                    className="bg-white/5 border-border text-white"
                    placeholder={def?.paramLabel}
                  />
                )}
              </div>
              {fields.length > 1 ? (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs text-destructive sm:col-span-3 text-left"
                >
                  Remove condition
                </button>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => append({ type: conditionOptions[0]?.value as any, value: "" })}
          className="text-xs text-primary"
        >
          + Add condition
        </button>
      </div>

      <div>
        <Label className="text-gray-300">Action type</Label>
        <select
          {...register("action_type")}
          className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
        >
          <option value="create_notification">Create notification</option>
          <option value="create_task">Create task</option>
        </select>
      </div>

      {actionType === "create_task" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-gray-300">Due in days</Label>
            <Input
              {...register("due_in_days", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
              })}
              type="number"
              className={`bg-white/5 border-border text-white mt-1 ${errors.due_in_days ? "border-destructive" : ""}`}
              min={0}
              placeholder="1"
              aria-invalid={!!errors.due_in_days}
            />
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
            <Label className="text-gray-300">Title template</Label>
            <Input
              {...register("title_template")}
              className="bg-white/5 border-border text-white mt-1"
              placeholder="Respond to {{count}} messages"
            />
          </div>
        </div>
      ) : null}

      <div>
        <Label className="text-gray-300">Cooldown (hours)</Label>
        <Input
          {...register("cooldown_hours", {
            setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
          })}
          type="number"
          min={1}
          className={`bg-white/5 border-border text-white mt-1 ${errors.cooldown_hours ? "border-destructive" : ""}`}
          placeholder="24"
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="enabled" {...register("enabled")} className="h-4 w-4" />
        <Label htmlFor="enabled" className="text-gray-300">Enabled</Label>
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
