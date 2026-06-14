"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { notificationsService } from "@/admin/notifications/services/notificationsService";
import { toast } from "sonner";
import type { Notification } from "@/lib/types/admin";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
    try {
      const data = await notificationsService.list({ page: 1, pageSize: 50 });
      setNotifications(data.items);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

    load();
  }, []);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
    try {
      const data = await notificationsService.list({ page: 1, pageSize: 50 });
      setNotifications(data.items);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };
    load();
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markAsRead = async (id: string) => {
    try {
      const updatedNotification = await notificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updatedNotification : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) =>
        prev.map((n) =>
          n.read_at ? n : { ...n, read_at: new Date().toISOString() }
        )
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {loading && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Loading notifications...
            </p>
          )}
          {!loading && notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications
            </p>
          ) : (
            notifications
              .slice()
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
