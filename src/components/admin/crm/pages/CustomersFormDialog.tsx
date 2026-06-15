"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { CustomerForm, type CustomerFormData } from "@/components/admin/crm/components/CustomerForm";
import { ActivityFeed } from "@/components/admin/crm/components/ActivityFeed";
import { AttachmentsPanel } from "@/components/admin/crm/components/AttachmentsPanel";
import type { Customer } from "@/lib/types/admin";

interface CustomersFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  defaultValues: Customer | undefined;
  canEdit: boolean;
  isSubmitting: boolean;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
}

export function CustomersFormDialog({
  open,
  onOpenChange,
  editingId,
  defaultValues,
  canEdit,
  isSubmitting,
  onSubmit,
  onCancel,
}: CustomersFormDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingId ? "Edit Customer" : "Create Customer"}
    >
      <div className="space-y-6">
        <CustomerForm
          defaultValues={
            defaultValues
              ? {
                  full_name: defaultValues.full_name,
                  email: defaultValues.email ?? undefined,
                  phone: defaultValues.phone ?? undefined,
                  company: defaultValues.company ?? undefined,
                  address: defaultValues.address ?? undefined,
                  notes: defaultValues.notes ?? undefined,
                  tags: defaultValues.tags ?? undefined,
                  status: defaultValues.status as "active" | "inactive",
                }
              : undefined
          }
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
        {editingId ? (
          <>
            <AttachmentsPanel entityType="customer" entityId={editingId} readOnly={!canEdit} />
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-white mb-3">Activity</h3>
              <ActivityFeed entityType="customer" entityId={editingId} readOnly={!canEdit} />
            </div>
          </>
        ) : null}
      </div>
    </FormDialog>
  );
}
