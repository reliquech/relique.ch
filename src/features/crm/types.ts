export type {
  Customer,
  Lead,
  Deal,
  PipelineStage,
  Message,
  Attachment,
  PaginatedListResponse,
} from "@/lib/types/admin";

export type ActivityItemKind = "audit" | "task" | "attachment" | "message";

export interface ActivityItem {
  id: string;
  kind: ActivityItemKind;
  at: string;
  audit?: { action: string; actor_id: string | null; metadata: Record<string, unknown> | null };
  task?: { title: string; status: string; due_at: string | null };
  attachment?: { file_path: string; title?: string | null };
  message?: { subject: string | null; message: string; status: string };
}
