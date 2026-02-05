"use client";

import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/shared/FormDialog";
import { ActivityFeed } from "@/features/crm/components/ActivityFeed";
import { AttachmentsPanel } from "@/features/crm/components/AttachmentsPanel";
import { CustomFieldsSection } from "@/features/crm/components/CustomFieldsSection";
import { TaskForm, type TaskFormData } from "@/features/tasks/components/TaskForm";
import { dealsService } from "@/features/crm/services/dealsService";
import { customFieldsService } from "@/features/crm/services/customFieldsService";
import { customFieldValuesService } from "@/features/crm/services/customFieldValuesService";
import { tasksService } from "@/features/tasks/services/tasksService";
import type { CustomField, Deal, PipelineStage } from "@/lib/types";
import { toast } from "sonner";

interface DealDetailProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: PipelineStage[];
  onSave?: () => void;
  readOnly?: boolean;
}

export function DealDetail({ deal, open, onOpenChange, stages, onSave, readOnly }: DealDetailProps) {
  const [title, setTitle] = useState("");
  const [pipelineStageId, setPipelineStageId] = useState("");
  const [status, setStatus] = useState<"open" | "won" | "lost">("open");
  const [value, setValue] = useState<string>("");
  const [probability, setProbability] = useState<string>("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  useEffect(() => {
    if (deal) {
      setTitle(deal.title ?? "");
      setPipelineStageId(deal.pipeline_stage_id ?? "");
      setStatus((deal.status as "open" | "won" | "lost") ?? "open");
      setValue(deal.value != null ? String(deal.value) : "");
      setProbability(deal.probability != null ? String(deal.probability) : "");
      setExpectedCloseDate(deal.expected_close_date ?? "");
      setNotes(deal.notes ?? "");
    }
  }, [deal]);

  useEffect(() => {
    let mounted = true;
    customFieldsService
      .list("deal")
      .then((data) => {
        if (mounted) setCustomFields(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!deal?.id) return;
    let mounted = true;
    customFieldValuesService
      .list({ entity_type: "deal", entity_id: deal.id })
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
  }, [deal?.id]);

  const handleSave = async () => {
    if (!deal) return;
    setSaving(true);
    try {
      await dealsService.update(deal.id, {
        title,
        pipeline_stage_id: pipelineStageId || undefined,
        status,
        value: value === "" ? undefined : Number(value),
        probability: probability === "" ? undefined : Number(probability),
        expected_close_date: expectedCloseDate || undefined,
        notes: notes || undefined,
      });
      if (!readOnly) {
        await customFieldValuesService.upsert({
          entity_type: "deal",
          entity_id: deal.id,
          values: customValues,
        });
      }
      toast.success("Deal updated");
      onSave?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTaskSubmit = async (data: TaskFormData) => {
    setTaskSubmitting(true);
    try {
      await tasksService.create({
        title: data.title,
        description: data.description ?? undefined,
        status: data.status ?? "open",
        priority: data.priority ?? "medium",
        due_at: data.due_at ?? undefined,
        entity_type: "deal",
        entity_id: deal!.id,
      });
      toast.success("Task created");
      setTaskDialogOpen(false);
      setActivityRefresh((c) => c + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setTaskSubmitting(false);
    }
  };

  if (!deal) return null;

  return (
    <>
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
            <Label className="text-gray-300">Stage</Label>
            <select
              value={pipelineStageId}
              onChange={(e) => setPipelineStageId(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white mt-1"
              disabled={readOnly}
            >
              <option value="">—</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
        {customFields.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <CustomFieldsSection
              fields={customFields}
              values={customValues}
              onChange={setCustomValues}
              readOnly={readOnly}
            />
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-white mb-3">Attachments</h3>
          <AttachmentsPanel entityType="deal" entityId={deal.id} readOnly={readOnly} />
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-white mb-3">Activity</h3>
          <ActivityFeed
            entityType="deal"
            entityId={deal.id}
            readOnly={readOnly}
            onAddTaskClick={readOnly ? undefined : () => setTaskDialogOpen(true)}
            refreshTrigger={activityRefresh}
          />
        </div>
      </SheetContent>
    </Sheet>
    <FormDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} title="Add task">
      <TaskForm
        defaultValues={{ entity_type: "deal", entity_id: deal.id, status: "open", priority: "medium" }}
        onSubmit={handleTaskSubmit}
        onCancel={() => setTaskDialogOpen(false)}
        isSubmitting={taskSubmitting}
      />
    </FormDialog>
  </>
  );
}
