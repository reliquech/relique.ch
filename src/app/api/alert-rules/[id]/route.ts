import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const EntityTypeSchema = z.enum(["lead", "deal", "message"]);
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
const ActionTypeSchema = z.enum(["create_notification", "create_task"]);

const ConditionSchema = z.object({
  type: ConditionTypeSchema,
  params: z.record(z.string(), z.unknown()).optional().nullable(),
});

const TaskActionParamsSchema = z
  .object({
    due_in_days: z.number().int().min(0).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    title_template: z.string().optional(),
  })
  .optional()
  .nullable();

const AlertRuleUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  condition_type: ConditionTypeSchema.optional(),
  condition_params: z.record(z.string(), z.unknown()).optional().nullable(),
  conditions: z.array(ConditionSchema).min(1).optional().nullable(),
  entity_type: EntityTypeSchema.optional().nullable(),
  action_type: ActionTypeSchema.optional(),
  action_params: z.record(z.string(), z.unknown()).optional().nullable(),
  enabled: z.boolean().optional(),
  cooldown_hours: z.number().int().min(1).optional().nullable(),
});

const conditionEntityMap: Record<string, "lead" | "deal" | "message"> = {
  lead_stale: "lead",
  lead_status: "lead",
  lead_score_min: "lead",
  lead_score_max: "lead",
  lead_source: "lead",
  deal_stale: "deal",
  deal_status: "deal",
  deal_value_min: "deal",
  deal_value_max: "deal",
  message_unread: "message",
  message_status: "message",
  message_source: "message",
};

function inferEntityType(conditions: Array<{ type: string }>): "lead" | "deal" | "message" | null {
  const firstType = conditions[0]?.type;
  if (firstType === undefined) return null;
  const entity = conditionEntityMap[firstType];
  if (!entity) return null;
  const same = conditions.every((cond) => conditionEntityMap[cond.type] === entity);
  return same ? entity : null;
}

function normalizeTaskParams(actionParams: Record<string, unknown> | null | undefined) {
  const parsed = TaskActionParamsSchema.safeParse(actionParams ?? {});
  if (!parsed.success || !parsed.data) {
    return { due_in_days: 1, priority: "medium" };
  }
  return {
    due_in_days: parsed.data.due_in_days ?? 1,
    priority: parsed.data.priority ?? "medium",
    ...(parsed.data.title_template ? { title_template: parsed.data.title_template } : {}),
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const body = await request.json();
    const validated = AlertRuleUpdateSchema.parse(body);
    const payload: Record<string, unknown> = { ...validated };

    if (validated.conditions?.length) {
      const firstCondition = validated.conditions[0];
      if (!firstCondition) {
        return NextResponse.json({ error: "At least one condition required" }, { status: 400 });
      }
      const entityType = validated.entity_type ?? inferEntityType(validated.conditions);
      if (!entityType) {
        return NextResponse.json({ error: "Conditions must belong to a single entity" }, { status: 400 });
      }
      payload.entity_type = entityType;
      payload.conditions = validated.conditions;
      payload.condition_type = firstCondition.type;
      payload.condition_params = firstCondition.params ?? {};
    }

    if (validated.action_type === "create_task" && validated.action_params !== undefined) {
      payload.action_params = normalizeTaskParams(validated.action_params);
    }

    const { data, error } = await supabase
      .from("alert_rules")
      .update(payload as never)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating alert rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("alert_rules")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
