"use client";

import { Building2, CalendarClock, Mail, Phone, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LeadForm,
  type LeadFormData,
} from "@/components/admin/crm/components/LeadForm";
import { ActivityFeed } from "@/components/admin/crm/components/ActivityFeed";
import { AttachmentsPanel } from "@/components/admin/crm/components/AttachmentsPanel";
import { MarketplaceInterestsPanel } from "@/components/admin/crm/components/MarketplaceInterestsPanel";
import type { Lead } from "@/lib/types/admin";
import { cn } from "@/lib/utils";

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

const statusStyles: Record<string, string> = {
  new: "border-sky-400/40 bg-sky-400/10 text-sky-100",
  contacted: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  qualified: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  unqualified: "border-gray-500/50 bg-white/5 text-gray-300",
};

function formatStatus(status?: string | null) {
  if (!status) return "New";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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
  const isEditing = Boolean(editingId);
  const status = defaultValues?.status ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-[100vw] flex-col gap-0 overflow-hidden border-border bg-surface p-0 text-white sm:h-auto sm:max-h-[88dvh] sm:max-w-6xl">
        <DialogHeader className="border-b border-border bg-white/[0.03] px-5 py-4 text-left sm:px-6">
          <div className="flex flex-col gap-4 pr-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl font-semibold text-white">
                  {isEditing ? "Edit lead" : "Create lead"}
                </DialogTitle>
                {isEditing ? (
                  <span
                    className={cn(
                      "border px-2 py-1 text-xs font-medium",
                      statusStyles[status] ?? statusStyles.new,
                    )}
                  >
                    {formatStatus(status)}
                  </span>
                ) : null}
              </div>
              <DialogDescription className="text-sm text-gray-300">
                {isEditing
                  ? "Update lead details, review interests, and check files or activity without leaving this workspace."
                  : "Capture a new lead with the core contact details the CRM needs."}
              </DialogDescription>
            </div>

            {isEditing && defaultValues ? (
              <div className="grid gap-2 text-sm text-gray-300 sm:grid-cols-2 lg:min-w-[28rem]">
                <div className="flex min-w-0 items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 text-gray-500" />
                  <span className="truncate">
                    {defaultValues.company || "No company"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>Score {defaultValues.score ?? 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>Created {formatDate(defaultValues.created_at)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {defaultValues.email ? (
                    <a
                      className="inline-flex items-center gap-1 text-gray-200 hover:text-white"
                      href={`mailto:${defaultValues.email}`}
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  ) : null}
                  {defaultValues.phone ? (
                    <a
                      className="inline-flex items-center gap-1 text-gray-200 hover:text-white"
                      href={`tel:${defaultValues.phone}`}
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div
            className={cn(
              "grid gap-0",
              isEditing && "lg:grid-cols-[minmax(0,1fr)_27rem]",
            )}
          >
            <section className="min-w-0 border-border p-5 sm:p-6 lg:border-r">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-white">
                  Lead details
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Keep contact fields tight; status and score drive the queue.
                </p>
              </div>
              <LeadForm
                defaultValues={
                  defaultValues
                    ? {
                        full_name: defaultValues.full_name,
                        email: defaultValues.email ?? undefined,
                        phone: defaultValues.phone ?? undefined,
                        company: defaultValues.company ?? undefined,
                        source: defaultValues.source ?? undefined,
                        status: defaultValues.status as
                          | "new"
                          | "contacted"
                          | "qualified"
                          | "unqualified",
                        score: defaultValues.score ?? 0,
                      }
                    : undefined
                }
                onSubmit={onSubmit}
                onCancel={onCancel}
                isSubmitting={isSubmitting}
                compact
                submitLabel={isEditing ? "Save changes" : "Create lead"}
              />
            </section>

            {isEditing && editingId ? (
              <aside className="min-w-0 bg-white/[0.02] p-5 sm:p-6">
                <Tabs defaultValue="interests" className="space-y-4">
                  <TabsList className="grid h-10 w-full grid-cols-3 bg-white/5 p-1">
                    <TabsTrigger value="interests">Interests</TabsTrigger>
                    <TabsTrigger value="attachments">Files</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  <TabsContent value="interests" className="mt-0">
                    <MarketplaceInterestsPanel
                      leadId={editingId}
                      leadEmail={defaultValues?.email}
                    />
                  </TabsContent>
                  <TabsContent value="attachments" className="mt-0">
                    <AttachmentsPanel
                      entityType="lead"
                      entityId={editingId}
                      readOnly={!canEdit}
                    />
                  </TabsContent>
                  <TabsContent value="activity" className="mt-0">
                    <div className="border border-border bg-surface p-4">
                      <ActivityFeed
                        entityType="lead"
                        entityId={editingId}
                        readOnly={!canEdit}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </aside>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
