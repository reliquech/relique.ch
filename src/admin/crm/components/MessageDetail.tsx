"use client";

import React, { useEffect, useState } from "react";
import type { Message } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AttachmentsPanel } from "@/admin/crm/components/AttachmentsPanel";
import { CustomFieldsSection } from "@/admin/crm/components/CustomFieldsSection";
import { customFieldsService } from "@/admin/crm/services/customFieldsService";
import { customFieldValuesService } from "@/admin/crm/services/customFieldValuesService";
import type { CustomField } from "@/lib/types/admin";

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
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    let mounted = true;
    customFieldsService
      .list("message")
      .then((data) => {
        if (mounted) setCustomFields(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!message?.id) return;
    let mounted = true;
    customFieldValuesService
      .list({ entity_type: "message", entity_id: message.id })
      .then((res) => {
        if (!mounted) return;
        const map: Record<string, unknown> = {};
        res.items.forEach((item) => {
          map[item.field_id] = item.value_json;
        });
        setCustomValues(map);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [message?.id]);

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
          {customFields.length > 0 && (
            <div className="pt-4 border-t border-border">
              <CustomFieldsSection
                fields={customFields}
                values={customValues}
                onChange={setCustomValues}
                readOnly
              />
            </div>
          )}
          <div className="pt-4 border-t border-border">
            <AttachmentsPanel entityType="message" entityId={message.id} readOnly={readOnly} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
