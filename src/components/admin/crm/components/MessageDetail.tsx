"use client";

import React from "react";
import type { Message } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AttachmentsPanel } from "@/components/admin/crm/components/AttachmentsPanel";

interface MessageDetailProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, status: string) => Promise<void>;
  readOnly?: boolean;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
] as const;

export function MessageDetail({
  message,
  open,
  onOpenChange,
  onStatusChange,
  readOnly,
}: MessageDetailProps) {
  if (!message) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    if (onStatusChange) {
      await onStatusChange(message.id, status);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border text-white w-[100vw] max-w-[100vw] h-[100dvh] rounded-none md:max-w-lg md:h-auto md:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Message details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-gray-500 text-xs">Name</Label>
            <p className="text-white font-medium mt-0.5">{message.name}</p>
          </div>
          <div>
            <Label className="text-gray-500 text-xs">Email</Label>
            <p className="text-white mt-0.5">{message.email}</p>
          </div>
          {message.phone && (
            <div>
              <Label className="text-gray-500 text-xs">Phone</Label>
              <p className="text-white mt-0.5">{message.phone}</p>
            </div>
          )}
          {message.subject && (
            <div>
              <Label className="text-gray-500 text-xs">Subject</Label>
              <p className="text-white mt-0.5">{message.subject}</p>
            </div>
          )}
          <div>
            <Label className="text-gray-500 text-xs">Message</Label>
            <p className="text-white mt-0.5 whitespace-pre-wrap">{message.message}</p>
          </div>
          <div>
            <Label className="text-gray-500 text-xs">Status</Label>
            <div className="flex items-center gap-2 mt-1">
              {onStatusChange && !readOnly ? (
                <select
                  value={message.status}
                  onChange={handleStatusChange}
                  className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                getStatusPill(message.status)
              )}
            </div>
          </div>
          <div>
            <Label className="text-gray-500 text-xs">Received</Label>
            <p className="text-gray-400 text-sm mt-0.5">{new Date(message.created_at).toLocaleString()}</p>
          </div>
          <div className="pt-4 border-t border-border">
            <AttachmentsPanel entityType="message" entityId={message.id} readOnly={readOnly} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
