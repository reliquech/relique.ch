"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { EmptyPlaceholderCard } from "@/components/shared/EmptyPlaceholderCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminLoadingState } from "@/components/shared/AdminLoadingState";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { AutomationRuleForm, type AutomationRuleFormData } from "@/admin/automations/components/AutomationRuleForm";
import { alertRulesService } from "@/admin/automations/services/alertRulesService";
import type { AlertRule } from "@/lib/types/admin";
import { useProfile } from "@/admin/users/hooks/useProfile";
import { toast } from "sonner";

export default function AutomationsPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewCounts, setPreviewCounts] = useState<Record<string, number>>({});
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});
  const [runLoading, setRunLoading] = useState(false);
  const [lastRunLabel, setLastRunLabel] = useState<string>("Never");
  const { role } = useProfile();
  const canEdit = role === "admin" || role === "editor";

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPreviewCounts({});
    setPreviewLoading({});
    try {
      const data = await alertRulesService.list();
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load automations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (!rules.length) return;
    let cancelled = false;

    const run = async () => {
      for (const rule of rules) {
        if (previewCounts[rule.id] !== undefined || previewLoading[rule.id]) continue;
        setPreviewLoading((prev) => ({ ...prev, [rule.id]: true }));
        try {
          const res = await alertRulesService.preview(rule.id);
          if (!cancelled) {
            setPreviewCounts((prev) => ({ ...prev, [rule.id]: res.count }));
          }
        } catch {
          // ignore preview errors
        } finally {
          if (!cancelled) {
            setPreviewLoading((prev) => ({ ...prev, [rule.id]: false }));
          }
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [rules, previewCounts, previewLoading]);

  useEffect(() => {
    const formatLastRun = (value: string | null) => {
      if (!value) return "Never";
      const ts = new Date(value);
      if (Number.isNaN(ts.getTime())) return "Never";
      const diffMs = Date.now() - ts.getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    };

    const update = () => {
      if (typeof window === "undefined") return;
      const value = window.localStorage.getItem("automation_last_run");
      setLastRunLabel(formatLastRun(value));
    };

    update();
    const interval = setInterval(update, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = () => {
    setEditingRule(null);
    setFormOpen(true);
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormOpen(true);
  };

  const handleToggle = async (rule: AlertRule) => {
    if (!canEdit) return;
    try {
      await alertRulesService.update(rule.id, { enabled: !rule.enabled });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update rule");
    }
  };

  const buildConditionsPayload = (formData: AutomationRuleFormData) => {
    return formData.conditions.map((condition) => {
      const value = condition.value;
      switch (condition.type) {
        case "lead_stale":
          return { type: condition.type, params: { days: Number(value || 7) } };
        case "deal_stale":
          return { type: condition.type, params: { days: Number(value || 14) } };
        case "message_unread":
          return { type: condition.type, params: { hours: Number(value || 24) } };
        case "lead_status":
          return { type: condition.type, params: { status: value || "new" } };
        case "deal_status":
          return { type: condition.type, params: { status: value || "open" } };
        case "message_status":
          return { type: condition.type, params: { status: value || "new" } };
        case "lead_score_min":
          return { type: condition.type, params: { min: Number(value || 0) } };
        case "lead_score_max":
          return { type: condition.type, params: { max: Number(value || 0) } };
        case "deal_value_min":
          return { type: condition.type, params: { min: Number(value || 0) } };
        case "deal_value_max":
          return { type: condition.type, params: { max: Number(value || 0) } };
        case "lead_source":
          return { type: condition.type, params: { source: value || "" } };
        case "message_source":
          return { type: condition.type, params: { source: value || "" } };
        default:
          return { type: condition.type, params: {} };
      }
    });
  };

  const handleFormSubmit = async (data: AutomationRuleFormData) => {
    setIsSubmitting(true);
    try {
      const conditions = buildConditionsPayload(data);
      const primaryCondition = conditions[0];
      if (!primaryCondition) {
        toast.error("At least one condition is required");
        return;
      }

      const action_params =
        data.action_type === "create_task"
          ? {
              due_in_days: data.due_in_days ?? 1,
              priority: data.priority ?? "medium",
              ...(data.title_template ? { title_template: data.title_template } : {}),
            }
          : {};

      if (editingRule) {
        await alertRulesService.update(editingRule.id, {
          name: data.name,
          condition_type: primaryCondition.type as any,
          condition_params: primaryCondition.params as any,
          conditions,
          action_type: data.action_type,
          action_params,
          enabled: data.enabled,
          cooldown_hours: data.cooldown_hours ?? 24,
        });
        toast.success("Rule updated");
      } else {
        await alertRulesService.create({
          name: data.name,
          condition_type: primaryCondition.type as any,
          condition_params: primaryCondition.params as any,
          conditions,
          action_type: data.action_type,
          action_params,
          enabled: data.enabled,
          cooldown_hours: data.cooldown_hours ?? 24,
        });
        toast.success("Rule created");
      }

      setFormOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await alertRulesService.remove(deleteId);
      toast.success("Rule deleted");
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete rule");
    }
    setDeleteId(null);
  };

  const handlePreview = async (rule: AlertRule) => {
    setPreviewLoading((prev) => ({ ...prev, [rule.id]: true }));
    try {
      const res = await alertRulesService.preview(rule.id);
      setPreviewCounts((prev) => ({ ...prev, [rule.id]: res.count }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to preview rule");
    } finally {
      setPreviewLoading((prev) => ({ ...prev, [rule.id]: false }));
    }
  };

  const handleRunNow = async () => {
    if (!canEdit) return;
    setRunLoading(true);
    try {
      const res = await alertRulesService.run();
      toast.success(`Triggered ${res.triggered} rule(s).`);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("automation_last_run", new Date().toISOString());
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to run automations");
    } finally {
      setRunLoading(false);
    }
  };

  const handleRunNowPreview = async () => {
    if (!canEdit) return;
    setRunLoading(true);
    try {
      const res = await alertRulesService.run({ dry_run: true });
      toast.success(
        `Dry run: ${res.triggered} rule(s) would trigger, ${res.notifications ?? 0} notification(s), ${res.tasks ?? 0} task(s). No data created.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setRunLoading(false);
    }
  };

  const defaultValues = useMemo(() => {
    if (!editingRule) return undefined;
    const existingConditions = Array.isArray(editingRule.conditions) && editingRule.conditions.length
      ? editingRule.conditions
      : [{ type: editingRule.condition_type, params: editingRule.condition_params ?? {} }];
    const conditions = existingConditions.map((cond: any) => {
      let value = "";
      if (cond.type === "lead_stale" || cond.type === "deal_stale") value = String(cond.params?.days ?? 7);
      if (cond.type === "message_unread") value = String(cond.params?.hours ?? 24);
      if (cond.type === "lead_status" || cond.type === "deal_status" || cond.type === "message_status") value = String(cond.params?.status ?? "");
      if (cond.type === "lead_score_min") value = String(cond.params?.min ?? 0);
      if (cond.type === "lead_score_max") value = String(cond.params?.max ?? 0);
      if (cond.type === "deal_value_min") value = String(cond.params?.min ?? 0);
      if (cond.type === "deal_value_max") value = String(cond.params?.max ?? 0);
      if (cond.type === "lead_source" || cond.type === "message_source") value = String(cond.params?.source ?? "");
      return { type: cond.type, value };
    });
    const dueInDays = Number((editingRule.action_params as any)?.due_in_days ?? 1);
    const priority = (editingRule.action_params as any)?.priority ?? "medium";
    const titleTemplate = (editingRule.action_params as any)?.title_template ?? "";
    const cooldownHours = Number(editingRule.cooldown_hours ?? 24);

    return {
      name: editingRule.name,
      conditions,
      action_type: editingRule.action_type,
      due_in_days: dueInDays,
      priority,
      title_template: titleTemplate,
      enabled: editingRule.enabled,
      cooldown_hours: cooldownHours,
    };
  }, [editingRule]);

  const describeRule = (rule: AlertRule) => {
    const conditions = Array.isArray(rule.conditions) && rule.conditions.length
      ? rule.conditions
      : [{ type: rule.condition_type, params: rule.condition_params ?? {} }];
    const actionParams = rule.action_params as Record<string, any> | null;
    const actionLabel = rule.action_type === "create_task" ? "create task" : "notify";
    const priority = actionParams?.priority ? ` (${actionParams.priority})` : "";

    const label = conditions
      .map((cond) => {
        if (cond.type === "lead_stale" || cond.type === "deal_stale") {
          return `${cond.type.replace(/_/g, " ")} ${cond.params?.days ?? 7} days`;
        }
        if (cond.type === "message_unread") {
          return `${cond.type.replace(/_/g, " ")} ${cond.params?.hours ?? 24} hours`;
        }
        if (cond.type.includes("status")) {
          return `${cond.type.replace(/_/g, " ")} = ${cond.params?.status ?? ""}`;
        }
        if (cond.type.includes("score") || cond.type.includes("value")) {
          const val = cond.params?.min ?? cond.params?.max ?? "";
          return `${cond.type.replace(/_/g, " ")} ${val}`;
        }
        if (cond.type.includes("source")) {
          return `${cond.type.replace(/_/g, " ")} ${cond.params?.source ?? ""}`;
        }
        return cond.type.replace(/_/g, " ");
      })
      .join(" AND ");

    return `${label} → ${actionLabel}${priority}`;
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title="Automations"
          children={
            <>
              <div className="text-xs text-gray-400 mr-2">
                Last run: <span className="text-gray-200">{lastRunLabel}</span>
              </div>
              {canEdit ? (
                <>
                  <button
                    type="button"
                    onClick={handleRunNowPreview}
                    className="bg-white/5 text-gray-300 px-3 py-2 rounded-lg text-xs border border-border hover:text-white"
                    disabled={runLoading}
                  >
                    Preview run
                  </button>
                  <button
                    type="button"
                    onClick={handleRunNow}
                    className="bg-white/5 text-white px-4 py-2 rounded-lg text-xs font-bold border border-border"
                    disabled={runLoading}
                  >
                    {runLoading ? "Running..." : "Run now"}
                  </button>
                </>
              ) : null}
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Plus className="w-4 h-4" /> New Rule
                </button>
              ) : null}
            </>
          }
        />

        {error ? (
          <ErrorState message={error} onRetry={fetchList} />
        ) : loading ? (
          <AdminLoadingState />
        ) : rules.length === 0 ? (
          <EmptyPlaceholderCard ctaLabel="Create Rule" onCtaClick={canEdit ? handleCreate : undefined} />
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${rule.enabled ? "bg-success/10 text-success" : "bg-white/10 text-gray-400"}`}>
                      {rule.enabled ? "enabled" : "disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{describeRule(rule)}</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mt-2">
                    <span>
                      Last run: {rule.last_triggered_at ? new Date(rule.last_triggered_at).toLocaleString() : "Never"}
                    </span>
                    {previewCounts[rule.id] !== undefined && (
                      <span className="text-primary">Matches: {previewCounts[rule.id]}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-gray-400">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggle(rule)}
                      disabled={!canEdit}
                      className="h-4 w-4"
                    />
                    Enabled
                  </label>
                  <button
                    type="button"
                    onClick={() => handlePreview(rule)}
                    className="px-3 py-2 text-xs rounded-lg bg-white/5 text-gray-300 hover:text-white"
                    disabled={previewLoading[rule.id]}
                  >
                    {previewLoading[rule.id] ? "Previewing..." : "Preview"}
                  </button>
                  {canEdit ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                        title="Edit rule"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(rule.id)}
                        className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingRule ? "Edit Rule" : "Create Rule"}>
        <AutomationRuleForm
          defaultValues={defaultValues}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </FormDialog>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
