"use client";

import React from "react";
import type { ActivityItem } from "@/admin/crm/types";
import { FileText, MessageSquare, CheckSquare, StickyNote } from "lucide-react";

interface ActivityTimelineItemProps {
  item: ActivityItem;
}

function fileName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

export function ActivityTimelineItem({ item }: ActivityTimelineItemProps) {
  const at = new Date(item.at).toLocaleString();

  if (item.kind === "audit") {
    const body = item.audit?.metadata && typeof item.audit.metadata.body === "string" ? item.audit.metadata.body : null;
    return (
      <li className="flex gap-3 text-sm border-l-2 border-border pl-3 py-1.5">
        <StickyNote className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <span className="text-muted-foreground shrink-0">{at}</span>
          <span className="text-white ml-2">{item.audit?.action === "note" && body ? body : item.audit?.action}</span>
          {item.audit?.actor_id && (
            <span className="text-gray-400 truncate ml-1">by {item.audit.actor_id.slice(0, 8)}…</span>
          )}
        </div>
      </li>
    );
  }

  if (item.kind === "task") {
    return (
      <li className="flex gap-3 text-sm border-l-2 border-border pl-3 py-1.5">
        <CheckSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <span className="text-muted-foreground">{at}</span>
          <span className="text-white ml-2">{item.task?.title}</span>
          <span className="text-gray-400 ml-1">({item.task?.status})</span>
        </div>
      </li>
    );
  }

  if (item.kind === "attachment") {
    const name = item.attachment?.title || fileName(item.attachment?.file_path ?? "");
    return (
      <li className="flex gap-3 text-sm border-l-2 border-border pl-3 py-1.5">
        <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <span className="text-muted-foreground">{at}</span>
          <span className="text-white ml-2">Attachment: {name}</span>
        </div>
      </li>
    );
  }

  if (item.kind === "message") {
    const snippet = (item.message?.message ?? "").slice(0, 60);
    return (
      <li className="flex gap-3 text-sm border-l-2 border-border pl-3 py-1.5">
        <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <span className="text-muted-foreground">{at}</span>
          <span className="text-white ml-2">{item.message?.subject || "Message"}</span>
          {snippet && <span className="text-gray-400 block truncate mt-0.5">{snippet}…</span>}
        </div>
      </li>
    );
  }

  return null;
}
