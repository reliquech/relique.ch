import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";

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

function hoursToMs(hours: number) {
  return hours * 60 * 60 * 1000;
}

function ensureNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function countLeads(supabase: ReturnType<typeof createServiceRoleClient>, conditions: any[]) {
  let query = supabase.from("leads").select("id", { count: "exact", head: true });

  for (const cond of conditions) {
    switch (cond.type) {
      case "lead_stale": {
        const days = ensureNumber(cond.params?.days, 7);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        query = query.or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoff.toISOString()}`);
        break;
      }
      case "lead_status": {
        if (cond.params?.status) query = query.eq("status", cond.params.status);
        break;
      }
      case "lead_score_min": {
        const min = ensureNumber(cond.params?.min, 0);
        query = query.gte("score", min);
        break;
      }
      case "lead_score_max": {
        const max = ensureNumber(cond.params?.max, 0);
        query = query.lte("score", max);
        break;
      }
      case "lead_source": {
        if (cond.params?.source) query = query.eq("source", cond.params.source);
        break;
      }
      default:
        break;
    }
  }

  const { count } = await query;
  return count ?? 0;
}

async function countDeals(supabase: ReturnType<typeof createServiceRoleClient>, conditions: any[]) {
  let query = supabase.from("deals").select("id", { count: "exact", head: true });

  for (const cond of conditions) {
    switch (cond.type) {
      case "deal_stale": {
        const days = ensureNumber(cond.params?.days, 14);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        query = query.eq("status", "open").lt("updated_at", cutoff.toISOString());
        break;
      }
      case "deal_status": {
        if (cond.params?.status) query = query.eq("status", cond.params.status);
        break;
      }
      case "deal_value_min": {
        const min = ensureNumber(cond.params?.min, 0);
        query = query.gte("value", min);
        break;
      }
      case "deal_value_max": {
        const max = ensureNumber(cond.params?.max, 0);
        query = query.lte("value", max);
        break;
      }
      default:
        break;
    }
  }

  const { count } = await query;
  return count ?? 0;
}

async function countMessages(supabase: ReturnType<typeof createServiceRoleClient>, conditions: any[]) {
  let query = supabase.from("messages").select("id", { count: "exact", head: true });

  for (const cond of conditions) {
    switch (cond.type) {
      case "message_unread": {
        const hours = ensureNumber(cond.params?.hours, 24);
        const cutoff = new Date();
        cutoff.setTime(cutoff.getTime() - hoursToMs(hours));
        query = query.eq("status", "new").lt("created_at", cutoff.toISOString());
        break;
      }
      case "message_status": {
        if (cond.params?.status) query = query.eq("status", cond.params.status);
        break;
      }
      case "message_source": {
        if (cond.params?.source) query = query.eq("source", cond.params.source);
        break;
      }
      default:
        break;
    }
  }

  const { count } = await query;
  return count ?? 0;
}

function buildDefaultMessage(primaryType: string, count: number, params: Record<string, unknown> | null) {
  if (primaryType === "lead_stale") {
    const days = ensureNumber(params?.days, 7);
    return `You have ${count} lead(s) without contact in the last ${days} days.`;
  }
  if (primaryType === "deal_stale") {
    const days = ensureNumber(params?.days, 14);
    return `You have ${count} open deal(s) untouched for ${days} days.`;
  }
  if (primaryType === "message_unread") {
    const hours = ensureNumber(params?.hours, 24);
    return `You have ${count} unread message(s) older than ${hours} hours.`;
  }
  return `You have ${count} record(s) matching ${primaryType.replace(/_/g, " ")}.`;
}

function buildDefaultTaskTitle(primaryType: string, count: number) {
  if (primaryType === "lead_stale") return `Follow up ${count} stale lead(s)`;
  if (primaryType === "deal_stale") return `Review ${count} stale deal(s)`;
  if (primaryType === "message_unread") return `Respond to ${count} unread message(s)`;
  return `Follow up ${count} record(s)`;
}

type NotificationPreferences = {
  type_preferences?: Record<string, boolean> | null;
  in_app_enabled?: boolean;
  email_enabled?: boolean;
};

async function getPreferences(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string
): Promise<NotificationPreferences | null> {
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return data as NotificationPreferences;

  const { data: created } = await supabase
    .from("notification_preferences")
    .insert({ user_id: userId } as never)
    .select()
    .single();

  return (created ?? null) as NotificationPreferences | null;
}

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "support@relique.co";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      text,
    }),
  });

  return response.ok;
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

    let dryRun = false;
    try {
      const body = await request.json().catch(() => ({}));
      dryRun = body?.dry_run === true;
    } catch {
      // no body
    }
    const supabase = createServiceRoleClient();
    const { data: rulesRaw, error } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("user_id", user.id)
      .eq("enabled", true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const hourMin = now.getHours() * 60 + now.getMinutes();
    const inActiveHours = (activeHours: { start?: string; end?: string } | null) => {
      if (!activeHours?.start || !activeHours?.end) return true;
      const [sH, sM] = (activeHours.start + ":00").split(":").map(Number);
      const [eH, eM] = (activeHours.end + ":00").split(":").map(Number);
      const startMin = (sH ?? 0) * 60 + (sM ?? 0);
      const endMin = (eH ?? 0) * 60 + (eM ?? 0);
      return hourMin >= startMin && hourMin <= endMin;
    };

    type RuleRow = Record<string, unknown> & {
      active_hours?: { start?: string; end?: string } | null;
      priority?: number | null;
    };
    const rules = ((rulesRaw ?? []) as RuleRow[])
      .filter((r) => inActiveHours(r.active_hours ?? null))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    const preferences = await getPreferences(supabase, user.id);
    const typePrefs = preferences?.type_preferences ?? null;

    const { data: userData } = await supabase.auth.admin.getUserById(user.id);
    const userEmail = userData?.user?.email ?? null;

    const nowIso = now.toISOString();
    let notificationsCreated = 0;
    let tasksCreated = 0;
    let rulesTriggered = 0;

    for (const rule of rules) {
      const actionsList = Array.isArray(rule.actions) && rule.actions.length > 0
        ? rule.actions
        : [{ type: rule.action_type || "create_notification", params: rule.action_params ?? {} }];

      const conditions = Array.isArray(rule.conditions) && rule.conditions.length
        ? rule.conditions
        : [{ type: rule.condition_type, params: rule.condition_params ?? {} }];

      const entityType = rule.entity_type || conditionEntityMap[conditions[0]?.type];
      if (!entityType) continue;

      let count = 0;
      if (entityType === "lead") count = await countLeads(supabase, conditions);
      if (entityType === "deal") count = await countDeals(supabase, conditions);
      if (entityType === "message") count = await countMessages(supabase, conditions);

      if (count <= 0) continue;

      const cooldownHours = typeof rule.cooldown_hours === "number" ? rule.cooldown_hours : 24;
      const cooldownCutoffIso = new Date(now.getTime() - hoursToMs(cooldownHours)).toISOString();

      if (!dryRun) {
        const { data: gate, error: gateError } = await supabase
          .from("alert_rules")
          .update({ last_triggered_at: nowIso } as never)
          .eq("id", rule.id as string)
          .or(`last_triggered_at.is.null,last_triggered_at.lt.${cooldownCutoffIso}`)
          .select("id")
          .single();
        if (gateError || !gate) continue;
      }

      const primaryType = conditions[0]?.type ?? rule.condition_type;
      const message = buildDefaultMessage(primaryType, count, conditions[0]?.params ?? rule.condition_params ?? null);

      for (const action of actionsList) {
        const actionType = (action as { type?: string }).type || "create_notification";
        const actionParams = (action as { params?: Record<string, unknown> }).params ?? {};
        if (actionType !== "create_notification" && actionType !== "create_task") continue;

        if (actionType === "create_notification") {
          const typeAllowed = typePrefs ? typePrefs[primaryType] !== false : true;
          if (!dryRun && preferences?.in_app_enabled !== false && typeAllowed) {
            const { error: insertError } = await supabase.from("notifications").insert({
              user_id: user.id,
              type: primaryType,
              message,
              metadata: { rule_id: rule.id, count },
            } as never);
            if (!insertError) {
              notificationsCreated += 1;
              rulesTriggered += 1;
            }
          }
          if (!dryRun && preferences?.email_enabled && typeAllowed && userEmail) {
            await sendEmail(userEmail, `CRM Alert: ${rule.name}`, message);
          }
          if (dryRun && (preferences?.in_app_enabled !== false || preferences?.email_enabled)) {
            notificationsCreated += 1;
            rulesTriggered += 1;
          }
        }

        if (actionType === "create_task") {
          if (!dryRun) {
            const dueInDays = typeof actionParams.due_in_days === "number" ? actionParams.due_in_days : 1;
            const taskPriority = typeof actionParams.priority === "string" ? actionParams.priority : "medium";
            const titleTemplate = typeof actionParams.title_template === "string" ? actionParams.title_template : "";
            const dueAt = new Date();
            dueAt.setDate(dueAt.getDate() + dueInDays);
            const defaultTitle = buildDefaultTaskTitle(primaryType, count);
            const title = titleTemplate ? titleTemplate.replace(/\{\{count\}\}/g, String(count)) : defaultTitle;
            const { error: taskError } = await supabase.from("tasks").insert({
              title,
              status: "open",
              priority: taskPriority,
              due_at: dueAt.toISOString(),
              assigned_to: user.id,
              created_by: user.id,
              source_rule_id: rule.id,
            } as never);
            if (!taskError) {
              tasksCreated += 1;
              rulesTriggered += 1;
            }
          } else {
            tasksCreated += 1;
            rulesTriggered += 1;
          }
        }
      }
    }

    return NextResponse.json({
      triggered: rulesTriggered,
      notifications: notificationsCreated,
      tasks: tasksCreated,
      dry_run: dryRun,
    });
  } catch (error) {
    console.error("Error running alert rules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
