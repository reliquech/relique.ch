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

const AlertRuleSchema = z.object({
  name: z.string().min(1),
  condition_type: ConditionTypeSchema.optional(),
  condition_params: z.record(z.string(), z.unknown()).optional().nullable(),
  conditions: z.array(ConditionSchema).min(1).optional().nullable(),
  entity_type: EntityTypeSchema.optional().nullable(),
  action_type: ActionTypeSchema.optional().default("create_notification"),
  action_params: z.record(z.string(), z.unknown()).optional().nullable(),
  enabled: z.boolean().optional().default(true),
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
  const entity = firstType ? conditionEntityMap[firstType] : undefined;
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

async function ensureDefaultRules(supabase: ReturnType<typeof createServiceRoleClient>, userId: string) {
  const { data, error } = await supabase
    .from("alert_rules")
    .select("id, action_type")
    .eq("user_id", userId)
    .limit(25);

  if (error) return;

  type RuleRow = { id: string; action_type: string };
  const rows = (data ?? []) as RuleRow[];
  const hasAny = rows.length > 0;
  const hasTask = rows.some((rule) => rule.action_type === "create_task");

  if (!hasAny) {
    await supabase.from("alert_rules").insert([
      {
        user_id: userId,
        name: "Stale leads (7 days)",
        entity_type: "lead",
        condition_type: "lead_stale",
        condition_params: { days: 7 },
        conditions: [{ type: "lead_stale", params: { days: 7 } }],
        action_type: "create_notification",
        action_params: {},
        enabled: true,
        cooldown_hours: 24,
      },
      {
        user_id: userId,
        name: "Stale deals (14 days)",
        entity_type: "deal",
        condition_type: "deal_stale",
        condition_params: { days: 14 },
        conditions: [{ type: "deal_stale", params: { days: 14 } }],
        action_type: "create_notification",
        action_params: {},
        enabled: true,
        cooldown_hours: 24,
      },
      {
        user_id: userId,
        name: "Unread messages (24 hours)",
        entity_type: "message",
        condition_type: "message_unread",
        condition_params: { hours: 24 },
        conditions: [{ type: "message_unread", params: { hours: 24 } }],
        action_type: "create_notification",
        action_params: {},
        enabled: true,
        cooldown_hours: 24,
      },
    ] as never);
  }

  if (!hasTask) {
    await supabase.from("alert_rules").insert([
      {
        user_id: userId,
        name: "Follow up stale leads (7 days)",
        entity_type: "lead",
        condition_type: "lead_stale",
        condition_params: { days: 7 },
        conditions: [{ type: "lead_stale", params: { days: 7 } }],
        action_type: "create_task",
        action_params: { due_in_days: 1, priority: "medium" },
        enabled: true,
        cooldown_hours: 24,
      },
      {
        user_id: userId,
        name: "Review stale deals (14 days)",
        entity_type: "deal",
        condition_type: "deal_stale",
        condition_params: { days: 14 },
        conditions: [{ type: "deal_stale", params: { days: 14 } }],
        action_type: "create_task",
        action_params: { due_in_days: 1, priority: "medium" },
        enabled: true,
        cooldown_hours: 24,
      },
      {
        user_id: userId,
        name: "Respond to unread messages (24 hours)",
        entity_type: "message",
        condition_type: "message_unread",
        condition_params: { hours: 24 },
        conditions: [{ type: "message_unread", params: { hours: 24 } }],
        action_type: "create_task",
        action_params: { due_in_days: 0, priority: "high" },
        enabled: true,
        cooldown_hours: 24,
      },
    ] as never);
  }
}

export async function GET() {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const supabase = createServiceRoleClient();
    await ensureDefaultRules(supabase, user.id);

    const { data, error } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching alert rules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;
    const { response: roleResponse } = await requireRole({
      userId: user.id,
      allow: ["admin", "editor"],
    });
    if (roleResponse) return roleResponse;

    const supabase = createServiceRoleClient();
    const body = await request.json();
    const validated = AlertRuleSchema.parse(body);

    const conditions = validated.conditions?.length
      ? validated.conditions
      : validated.condition_type
      ? [{ type: validated.condition_type, params: validated.condition_params ?? {} }]
      : null;

    if (!conditions) {
      return NextResponse.json({ error: "Missing conditions" }, { status: 400 });
    }

    const entityType = validated.entity_type ?? inferEntityType(conditions);
    if (!entityType) {
      return NextResponse.json({ error: "Conditions must belong to a single entity" }, { status: 400 });
    }

    const actionType = validated.action_type ?? "create_notification";
    const firstCondition = conditions[0];
    const payload = {
      ...validated,
      entity_type: entityType,
      conditions,
      condition_type: firstCondition?.type ?? "",
      condition_params: firstCondition?.params ?? {},
      action_type: actionType,
      action_params: actionType === "create_task" ? normalizeTaskParams(validated.action_params) : validated.action_params ?? {},
      cooldown_hours: validated.cooldown_hours ?? 24,
    };

    const insertPayload = { ...payload, user_id: user.id };
    const { data, error } = await supabase
      .from("alert_rules")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertPayload as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating alert rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
