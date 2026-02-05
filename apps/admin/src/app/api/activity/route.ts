import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/requireUser";
import type { ActivityItem } from "@/features/crm/types";

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireUser();
    if (!user) return response;

    const searchParams = request.nextUrl.searchParams;
    const entity_type = searchParams.get("entity_type");
    const entity_id = searchParams.get("entity_id");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    if (!entity_type || !entity_id) {
      return NextResponse.json(
        { error: "entity_type and entity_id are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const items: ActivityItem[] = [];

    const [auditRes, tasksRes, attachmentsRes, messagesRes] = await Promise.all([
      supabase
        .from("audit_logs")
        .select("id, action, actor_id, metadata, created_at")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("tasks")
        .select("id, title, status, due_at, created_at")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("attachments")
        .select("id, file_path, title, created_at")
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .order("created_at", { ascending: false })
        .limit(limit),
      entity_type === "lead"
        ? supabase
            .from("messages")
            .select("id, subject, message, status, created_at")
            .eq("lead_id", entity_id)
            .order("created_at", { ascending: false })
            .limit(limit)
        : entity_type === "customer"
          ? supabase
              .from("messages")
              .select("id, subject, message, status, created_at")
              .eq("customer_id", entity_id)
              .order("created_at", { ascending: false })
              .limit(limit)
          : Promise.resolve({ data: [] as { id: string; subject: string | null; message: string; status: string; created_at: string }[], error: null }),
    ]);

    type AuditRow = { id: string; action: string; actor_id: string | null; metadata: unknown; created_at: string };
    type TaskRow = { id: string; title: string; status: string; due_at: string | null; created_at: string };
    type AttachmentRow = { id: string; file_path: string; title: string | null; created_at: string };
    if (auditRes.data) {
      for (const row of auditRes.data as AuditRow[]) {
        items.push({
          id: `audit-${row.id}`,
          kind: "audit",
          at: row.created_at,
          audit: {
            action: row.action,
            actor_id: row.actor_id,
            metadata: (row.metadata as Record<string, unknown> | null) ?? null,
          },
        });
      }
    }
    if (tasksRes.data) {
      for (const row of tasksRes.data as TaskRow[]) {
        items.push({
          id: `task-${row.id}`,
          kind: "task",
          at: row.created_at,
          task: { title: row.title, status: row.status, due_at: row.due_at },
        });
      }
    }
    if (attachmentsRes.data) {
      for (const row of attachmentsRes.data as AttachmentRow[]) {
        items.push({
          id: `attachment-${row.id}`,
          kind: "attachment",
          at: row.created_at,
          attachment: { file_path: row.file_path, title: row.title ?? undefined },
        });
      }
    }
    if (messagesRes.data) {
      for (const row of messagesRes.data) {
        items.push({
          id: `message-${row.id}`,
          kind: "message",
          at: row.created_at,
          message: {
            subject: row.subject,
            message: row.message,
            status: row.status,
          },
        });
      }
    }

    items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    const trimmed = items.slice(0, limit);

    return NextResponse.json({ items: trimmed });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
