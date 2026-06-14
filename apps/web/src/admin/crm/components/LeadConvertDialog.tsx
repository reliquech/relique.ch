"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/lib/types/admin";
import { leadsService } from "@/admin/crm/services/leadsService";
import { customersService } from "@/admin/crm/services/customersService";
import { dealsService } from "@/admin/crm/services/dealsService";
import { pipelineStagesService } from "@/admin/crm/services/pipelineStagesService";
import type { PipelineStage } from "@/lib/types/admin";
import { toast } from "sonner";
import { User, HandCoins } from "lucide-react";

interface LeadConvertDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LeadConvertDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: LeadConvertDialogProps) {
  const [defaultStage, setDefaultStage] = useState<PipelineStage | null>(null);
  const [submitting, setSubmitting] = useState<"customer" | "customer-deal" | null>(null);

  useEffect(() => {
    if (open) {
      pipelineStagesService
        .list({ sort: "position" })
        .then((res) => {
          const stages = res.items ?? [];
          const def = stages.find((s) => s.is_default) ?? stages[0] ?? null;
          setDefaultStage(def);
        })
        .catch(() => setDefaultStage(null));
    }
  }, [open]);

  const handleCustomerOnly = async () => {
    if (!lead) return;
    setSubmitting("customer");
    try {
      const customer = await customersService.create({
        full_name: lead.full_name,
        email: lead.email ?? undefined,
        phone: lead.phone ?? undefined,
        company: lead.company ?? undefined,
      });
      await leadsService.update(lead.id, { converted_customer_id: customer.id });
      toast.success("Lead converted to customer");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to convert");
    } finally {
      setSubmitting(null);
    }
  };

  const handleCustomerAndDeal = async () => {
    if (!lead) return;
    if (!defaultStage) {
      toast.error("No default pipeline stage. Add stages first.");
      return;
    }
    setSubmitting("customer-deal");
    try {
      const customer = await customersService.create({
        full_name: lead.full_name,
        email: lead.email ?? undefined,
        phone: lead.phone ?? undefined,
        company: lead.company ?? undefined,
      });
      await dealsService.create({
        title: lead.company ? `${lead.full_name} – ${lead.company}` : lead.full_name,
        customer_id: customer.id,
        lead_id: lead.id,
        pipeline_stage_id: defaultStage.id,
      });
      await leadsService.update(lead.id, { converted_customer_id: customer.id });
      toast.success("Customer and deal created");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to convert");
    } finally {
      setSubmitting(null);
    }
  };

  if (!lead) return null;

  const alreadyConverted = Boolean(lead.converted_customer_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border text-white">
        <DialogHeader>
          <DialogTitle>Convert lead to customer</DialogTitle>
          <DialogDescription className="text-gray-400">
            {lead.full_name}
            {lead.company && ` · ${lead.company}`}
          </DialogDescription>
        </DialogHeader>
        {alreadyConverted ? (
          <div className="py-4 text-muted-foreground">
            This lead has already been converted.
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-400">Choose how to convert:</p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 border-border text-white hover:bg-white/10"
                onClick={handleCustomerOnly}
                disabled={!!submitting}
              >
                <User className="w-4 h-4" />
                Create Customer only
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 border-border text-white hover:bg-white/10"
                onClick={handleCustomerAndDeal}
                disabled={!!submitting || !defaultStage}
              >
                <HandCoins className="w-4 h-4" />
                Customer + Deal
                {defaultStage && <span className="text-xs text-gray-500">(stage: {defaultStage.name})</span>}
              </Button>
            </div>
            {submitting && <p className="text-sm text-gray-400">Processing…</p>}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-gray-400">
            {alreadyConverted ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
