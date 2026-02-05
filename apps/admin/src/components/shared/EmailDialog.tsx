"use client";

import React, { useState, useEffect } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailService } from "@/features/crm/services/emailService";
import { toast } from "sonner";

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "customer" | "lead";
  entityId: string | null;
  defaultTo?: string | null;
  defaultSubject?: string;
  onSent?: () => void;
}

export function EmailDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  defaultTo,
  defaultSubject,
  onSent,
}: EmailDialogProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setTo(defaultTo ?? "");
      setSubject(defaultSubject ?? "");
      setBody("");
    }
  }, [open, defaultTo, defaultSubject]);

  const handleSend = async () => {
    if (!entityId) {
      toast.error("Missing entity");
      return;
    }
    if (!to || !subject || !body) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setSending(true);
      await emailService.send({
        to,
        subject,
        body,
        entity_type: entityType,
        entity_id: entityId,
      });
      toast.success("Email sent");
      onOpenChange(false);
      onSent?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Send Email">
      <div className="space-y-4">
        <div>
          <Label>To</Label>
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" />
        </div>
        <div>
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        </div>
        <div>
          <Label>Message</Label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white min-h-[120px]"
            placeholder="Write your message..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
