"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StickyNote, Plus } from "lucide-react";
import { activityService } from "@/admin/crm/services/activityService";
import { toast } from "sonner";

interface ActivityQuickAddProps {
  entityType: string;
  entityId: string;
  onNoteAdded?: () => void;
  onAddTaskClick?: () => void;
  readOnly?: boolean;
}

export function ActivityQuickAdd({
  entityType,
  entityId,
  onNoteAdded,
  onAddTaskClick,
  readOnly,
}: ActivityQuickAddProps) {
  const [noteBody, setNoteBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async () => {
    const body = noteBody.trim();
    if (!body || readOnly) return;
    setSubmitting(true);
    try {
      await activityService.addNote(entityType, entityId, body);
      setNoteBody("");
      toast.success("Note added");
      onNoteAdded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  if (readOnly) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          placeholder="Add a note…"
          className="flex-1 min-h-[72px] rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleAddNote}
          disabled={!noteBody.trim() || submitting}
          className="gap-1"
        >
          <StickyNote className="w-3.5 h-3.5" />
          {submitting ? "Adding…" : "Add note"}
        </Button>
        {onAddTaskClick && (
          <Button type="button" size="sm" variant="outline" onClick={onAddTaskClick} className="gap-1">
            <Plus className="w-3.5 h-3.5" />
            Add task
          </Button>
        )}
      </div>
    </div>
  );
}
