"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { LeadForm, type LeadFormData } from "@/components/admin/crm/components/LeadForm";
import { ActivityFeed } from "@/components/admin/crm/components/ActivityFeed";
import { AttachmentsPanel } from "@/components/admin/crm/components/AttachmentsPanel";
import type { Lead } from "@/lib/types/admin";

interface LeadsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  defaultValues: Lead | undefined;
  canEdit: boolean;
  isSubmitting: boolean;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
}

export function LeadsFormDialog({
  open,
  onOpenChange,
  editingId,
  defaultValues,
  canEdit,
  isSubmitting,
  onSubmit,
  onCancel,
}: LeadsFormDialogProps) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={editingId ? "Edit Lead" : "Create Lead"}>
      <div className="space-y-6">
        <LeadForm
          defaultValues={
            defaultValues
              ? {
                  full_name: defaultValues.full_name,
                  email: defaultValues.email ?? undefined,
                  phone: defaultValues.phone ?? undefined,
                  company: defaultValues.company ?? undefined,
                  source: defaultValues.source ?? undefined,
                  status: defaultValues.status as "new" | "contacted" | "qualified" | "unqualified",
                  score: defaultValues.score ?? 0,
                }
              : undefined
          }
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
        {editingId ? (
          <>
            <AttachmentsPanel entityType="lead" entityId={editingId} readOnly={!canEdit} />
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-white mb-3">Activity</h3>
              <ActivityFeed entityType="lead" entityId={editingId} readOnly={!canEdit} />
            </div>
          </>
        ) : null}
      </div>
    </FormDialog>
  );
}
