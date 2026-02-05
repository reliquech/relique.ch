"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Activity } from "lucide-react";
import { activityService } from "@/features/crm/services/activityService";
import type { ActivityItem } from "@/features/crm/types";
import { ActivityTimelineItem } from "@/features/crm/components/ActivityTimelineItem";
import { ActivityQuickAdd } from "@/features/crm/components/ActivityQuickAdd";

interface ActivityFeedProps {
  entityType: string;
  entityId: string;
  readOnly?: boolean;
  onAddTaskClick?: () => void;
  /** Increment to trigger a refetch (e.g. after adding a task from parent) */
  refreshTrigger?: number;
}

export function ActivityFeed({ entityType, entityId, readOnly, onAddTaskClick, refreshTrigger }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await activityService.list({ entity_type: entityType, entity_id: entityId, limit: 50 });
      setItems(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity, refreshTrigger]);

  if (loading) {
    return <div className="text-muted-foreground text-sm py-4">Loading activity…</div>;
  }
  if (error) {
    return <div className="text-destructive text-sm py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <ActivityQuickAdd
          entityType={entityType}
          entityId={entityId}
          onNoteAdded={fetchActivity}
          onAddTaskClick={onAddTaskClick}
          readOnly={readOnly}
        />
      )}
      {items.length === 0 ? (
        <div className="text-muted-foreground text-sm py-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          No activity yet
        </div>
      ) : (
        <ul className="space-y-0">
          {items.map((item) => (
            <ActivityTimelineItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
