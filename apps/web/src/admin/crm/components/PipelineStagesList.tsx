"use client";

import React from "react";
import type { PipelineStage } from "@/lib/types/admin";
import { ChevronUp, ChevronDown } from "lucide-react";

interface PipelineStagesListProps {
  stages: PipelineStage[];
  onReorder: (updates: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

export function PipelineStagesList({ stages, onReorder, onEdit, onDelete, readOnly }: PipelineStagesListProps) {
  const move = (index: number, direction: "up" | "down") => {
    const newOrder = [...stages];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newOrder.length) return;
    const a = newOrder[index];
    const b = newOrder[target];
    if (a == null || b == null) return;
    newOrder[index] = b;
    newOrder[target] = a;
    const updates = newOrder.map((s, i) => ({ id: s!.id, position: i + 1 }));
    onReorder(updates);
  };

  return (
    <div className="w-full overflow-x-auto bg-surface border border-border rounded-xl shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/5 border-b border-border">
          <tr>
            <th className="px-4 py-3 w-10" />
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Position</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Color</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Default</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stages.map((stage, index) => (
            <tr key={stage.id} className="hover:bg-white/5 transition-colors group">
              <td className="px-4 py-3 text-gray-500">
                {!readOnly ? (
                  <div className="flex flex-col gap-0">
                    <button
                      type="button"
                      onClick={() => move(index, "up")}
                      disabled={index === 0}
                      className="p-0.5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, "down")}
                      disabled={index === stages.length - 1}
                      className="p-0.5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-white">{stage.name}</td>
              <td className="px-6 py-4 text-sm text-gray-300">{stage.position}</td>
              <td className="px-6 py-4">
                {stage.color ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded border border-border" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm text-gray-300">{stage.color}</span>
                  </span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-300">{stage.is_default ? "Yes" : "—"}</td>
              <td className="px-6 py-4 text-right">
                {!readOnly ? (
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(stage.id)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(stage.id)}
                      className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
