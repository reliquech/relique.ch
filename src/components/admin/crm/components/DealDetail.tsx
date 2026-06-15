"use client";

import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ActivityFeed } from "@/components/admin/crm/components/ActivityFeed";
import { AttachmentsPanel } from "@/components/admin/crm/components/AttachmentsPanel";
import { dealsService } from "@/features/crm/services/dealsService";
import type { Deal } from "@/lib/types/admin";
import { toast } from "sonner";

interface DealDetailProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

export function DealDetail({ deal, open, onOpenChange, onSave, readOnly }: DealDetailProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"open" | "won" | "lost">("open");
  const [value, setValue] = useState<string>("");
  const [probability, setProbability] = useState<string>("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (deal) {
      setTitle(deal.title ?? "");
      setStatus((deal.status as "open" | "won" | "lost") ?? "open");
      setValue(deal.value != null ? String(deal.value) : "");
      setProbability(deal.probability != null ? String(deal.probability) : "");
      setExpectedCloseDate(deal.expected_close_date ?? "");
      setNotes(deal.notes ?? "");
    }
  }, [deal]);

  const handleSave = async () => {
    if (!deal) return;
    setSaving(true);
    try {
      await dealsService.update(deal.id, {
        title,
        status,
        value: value === "" ? undefined : Number(value),
        probability: probability === "" ? undefined : Number(probability),
        expected_close_date: expectedCloseDate || undefined,
        notes: notes || undefined,
      });
      toast.success("Deal updated");
      onSave?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!deal) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full max-w-[100vw] sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white">Deal details</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <Label className="text-gray-300">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-border text-white mt-1" disabled={readOnly} />
          </div>
          <div>
            <Label className="text-gray-300">Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "open" | "won" | "lost")}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
              disabled={readOnly}
            >
              <option value="open">Open</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <Label className="text-gray-300">Value</Label>
            <Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="bg-white/5 border-border text-white mt-1" placeholder="0" disabled={readOnly} />
          </div>
          <div>
            <Label className="text-gray-300">Probability (%)</Label>
            <Input type="number" min={0} max={100} value={probability} onChange={(e) => setProbability(e.target.value)} className="bg-white/5 border-border text-white mt-1" placeholder="0" disabled={readOnly} />
          </div>
          <div>
            <Label className="text-gray-300">Expected close date</Label>
            <Input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} className="bg-white/5 border-border text-white mt-1" disabled={readOnly} />
          </div>
          <div>
            <Label className="text-gray-300">Notes</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1 min-h-[80px]" placeholder="Notes" disabled={readOnly} />
          </div>
          {!readOnly ? (
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save"}
            </Button>
          ) : null}
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-white mb-3">Attachments</h3>
          <AttachmentsPanel entityType="deal" entityId={deal.id} readOnly={readOnly} />
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-white mb-3">Activity</h3>
          <ActivityFeed entityType="deal" entityId={deal.id} readOnly={readOnly} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
