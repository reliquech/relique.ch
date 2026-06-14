"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { tasksService } from "@/admin/tasks/services/tasksService";
import type { Task } from "@/lib/types/admin";

export function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await tasksService.list({ status: "open", page: 1, pageSize: 30 });
        setTasks(res.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const { overdue, today, upcoming, dueSoon, noDueDate } = useMemo(() => {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);
    let overdue = 0;
    let today = 0;
    let upcoming = 0;
    const dueSoon: Task[] = [];
    const noDueDate: Task[] = [];

    tasks.forEach((task) => {
      if (task.status === "done") return;
      if (!task.due_at) {
        noDueDate.push(task);
        return;
      }
      const due = new Date(task.due_at);
      if (due < startOfDay) overdue += 1;
      else if (due >= startOfDay && due < endOfDay) today += 1;
      else if (due >= endOfDay) upcoming += 1;
      dueSoon.push(task);
    });

    dueSoon.sort((a, b) => {
      const aDue = a.due_at ? new Date(a.due_at).getTime() : 0;
      const bDue = b.due_at ? new Date(b.due_at).getTime() : 0;
      return aDue - bDue;
    });

    return { overdue, today, upcoming, dueSoon: dueSoon.slice(0, 5), noDueDate };
  }, [tasks]);

  return (
    <div className="bg-surface border border-border p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-white">My Tasks</h3>
        <div className="flex items-center gap-3">
          <Link href="/admin/tasks?create=1" className="text-xs text-accent hover:underline">
            Create
          </Link>
          <Link href="/admin/tasks" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-gray-400 mb-4">
        <span className="bg-white/5 border border-border px-2 py-1 rounded-full">
          Overdue <strong className="text-destructive">{overdue}</strong>
        </span>
        <span className="bg-white/5 border border-border px-2 py-1 rounded-full">
          Today <strong className="text-white">{today}</strong>
        </span>
        <span className="bg-white/5 border border-border px-2 py-1 rounded-full">
          Upcoming <strong className="text-white">{upcoming}</strong>
        </span>
      </div>
      {loading ? (
        <p className="text-xs text-gray-500">Loading tasks...</p>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : dueSoon.length === 0 && noDueDate.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks due soon.</p>
      ) : (
        <div className="space-y-3">
          {dueSoon.map((task) => (
            <div key={task.id} className="flex items-center justify-between border-b border-white/5 pb-2">
              <div>
                <p className="text-sm text-white font-medium">{task.title}</p>
                <p className="text-[10px] text-gray-500">
                  {task.due_at ? `Due ${new Date(task.due_at).toLocaleDateString()}` : "No due date"}
                </p>
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                  task.priority === "high"
                    ? "bg-destructive/15 text-destructive"
                    : task.priority === "medium"
                      ? "bg-warning/15 text-warning"
                      : "bg-success/15 text-success"
                }`}
              >
                {task.priority}
              </span>
            </div>
          ))}
          {dueSoon.length < 5 &&
            noDueDate.slice(0, Math.max(0, 5 - dueSoon.length)).map((task) => (
              <div key={task.id} className="flex items-center justify-between border-b border-white/5 pb-2">
                <div>
                  <p className="text-sm text-white font-medium">{task.title}</p>
                  <p className="text-[10px] text-gray-500">No due date</p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                    task.priority === "high"
                      ? "bg-destructive/15 text-destructive"
                      : task.priority === "medium"
                        ? "bg-warning/15 text-warning"
                        : "bg-success/15 text-success"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
