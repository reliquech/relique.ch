"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types/admin";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: () => void;
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "lead_stale":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "deal_stale":
        return <FileText className="h-4 w-4 text-yellow-400" />;
      case "message_unread":
        return <Info className="h-4 w-4 text-blue-400" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const isUnread = !notification.read_at;

  return (
    <div
      className={cn(
        "border p-3 flex items-start gap-3",
        isUnread && "bg-muted/40"
      )}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>
      {isUnread && (
        <Button variant="ghost" size="icon" onClick={onMarkAsRead}>
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
