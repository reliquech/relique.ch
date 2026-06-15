"use client";

import { ExternalLink, PackageSearch } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarketplaceInterestsPanel } from "@/components/admin/crm/components/MarketplaceInterestsPanel";
import type { Lead } from "@/lib/types/admin";

interface LeadMarketplaceInterestsDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadMarketplaceInterestsDialog({
  lead,
  open,
  onOpenChange,
}: LeadMarketplaceInterestsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86dvh] overflow-hidden border-border bg-surface p-0 text-white sm:max-w-2xl">
        <DialogHeader className="border-b border-border bg-white/[0.03] px-5 py-4 text-left">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-white/5">
              <PackageSearch className="h-5 w-5 text-primaryBlue" />
            </div>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-lg font-semibold text-white">
                Selected listings
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-300">
                {lead
                  ? `Marketplace products requested by ${lead.email ?? lead.full_name}.`
                  : "Marketplace products requested by this lead."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(86dvh-6rem)] overflow-y-auto p-5">
          {lead ? (
            <MarketplaceInterestsPanel
              leadId={lead.id}
              leadEmail={lead.email}
            />
          ) : (
            <div className="flex items-center gap-2 border border-border bg-white/5 p-4 text-sm text-gray-400">
              <ExternalLink className="h-4 w-4" />
              Select a lead to view listings.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
