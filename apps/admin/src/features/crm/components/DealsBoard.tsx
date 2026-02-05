"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import type { Deal } from "@/lib/types";
import type { PipelineStage } from "@/lib/types";
import { DealCard } from "@/features/crm/components/DealCard";

interface DealsBoardProps {
  stages: PipelineStage[];
  dealsByStage: Record<string, Deal[]>;
  onDealMove: (dealId: string, stageId: string) => Promise<void>;
  onDealClick: (deal: Deal) => void;
  readOnly?: boolean;
}

function StageColumn({
  stage,
  deals,
  onDealClick,
}: {
  stage: PipelineStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 rounded-xl border border-border bg-surface/50 p-3 min-h-[200px] ${isOver ? "ring-2 ring-primary/50" : ""}`}
    >
      <div className="font-semibold text-white mb-3 flex items-center gap-2">
        <span>{stage.name}</span>
        <span className="text-xs text-gray-500 font-normal">({deals.length})</span>
      </div>
      <div className="space-y-2">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onClick={() => onDealClick(deal)} />
        ))}
      </div>
    </div>
  );
}

export function DealsBoard({
  stages,
  dealsByStage,
  onDealMove,
  onDealClick,
  readOnly,
}: DealsBoardProps) {
  const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null);
  const stageIds = new Set(stages.map((s) => s.id));

  if (readOnly) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-72 rounded-xl border border-border bg-surface/50 p-3 min-h-[200px]"
          >
            <div className="font-semibold text-white mb-3 flex items-center gap-2">
              <span>{stage.name}</span>
              <span className="text-xs text-gray-500 font-normal">({(dealsByStage[stage.id] ?? []).length})</span>
            </div>
            <div className="space-y-2">
              {(dealsByStage[stage.id] ?? []).map((deal) => (
                <DealCard key={deal.id} deal={deal} onClick={() => onDealClick(deal)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const deal = event.active.data.current?.deal as Deal | undefined;
    if (deal) setActiveDeal(deal);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const targetStageId = String(over.id);
    if (!stageIds.has(targetStageId)) return;
    const dealId = String(active.id);
    await onDealMove(dealId, targetStageId);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] ?? []}
            onDealClick={onDealClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeDeal ? (
          <div className="w-72 rounded-lg border border-border bg-surface p-3 shadow-xl opacity-95">
            <div className="font-semibold text-white truncate">{activeDeal.title}</div>
            <div className="text-sm text-gray-400 mt-1">
              {activeDeal.value != null ? `${activeDeal.currency ?? "USD"} ${Number(activeDeal.value).toLocaleString()}` : "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {activeDeal.probability != null ? `${activeDeal.probability}%` : "—"}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
