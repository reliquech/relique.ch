import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireRole } from "@/lib/supabase/requireRole";
import { z } from "zod";

const TaskSchema = z
  .object({
    title: z.string().min(1),
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
        message: "entity_type is required when entity_id is provided",
        path: ["entity_type"],
      });
    }
    if (data.entity_type && !data.entity_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "entity_id is required when entity_type is provided",
        path: ["entity_id"],
      });
    }
  });

function getDateRange(kind: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(startOfDay.getDate() + 1);

  if (kind === "overdue") {
    return { lt: now.toISOString() };
  }
  if (kind === "today") {
    return { gte: startOfDay.toISOString(), lt: endOfDay.toISOString() };
  }
  if (kind === "upcoming") {
    return { gte: endOfDay.toISOString() };
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const supabase = createServiceRoleClient();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get("status") as "open" | "done" | null;
    const due = searchParams.get("due") as "overdue" | "today" | "upcoming" | null;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("tasks")
      .select("*", { count: "exact" })
      .eq("assigned_to", user.id)
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (due) {
      const range = getDateRange(due);
      if (range?.gte) query = query.gte("due_at", range.gte);
      if (range?.lt) query = query.lt("due_at", range.lt);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
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
    const validated = TaskSchema.parse(body);

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...validated,
        assigned_to: user.id,
        created_by: user.id,
      } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const row = data as { id: string; title?: string };
    await supabase.from("audit_logs").insert({
      action: "CREATE_TASK",
      entity_type: "task",
      entity_id: row.id,
      metadata: { title: row.title },
    } as never);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
