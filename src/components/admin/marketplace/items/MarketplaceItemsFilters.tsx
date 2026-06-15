"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { MarketplaceItemsUrlState } from "@/features/marketplace/types/itemsList";
import { MarketplaceItemsFilterFields } from "./MarketplaceItemsFilterFields";

interface MarketplaceItemsFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: MarketplaceItemsUrlState;
  onApply: (patch: Partial<MarketplaceItemsUrlState>) => void;
}

export function MarketplaceItemsFilters({
  open,
  onOpenChange,
  state,
  onApply,
}: MarketplaceItemsFiltersProps) {
  const isMobile = useIsMobile(768);
  const [draft, setDraft] = useState({
    statusMulti: state.statusMulti,
    featured: state.featured,
    athlete: state.athlete,
    priceMin: state.priceMin,
    priceMax: state.priceMax,
  });

  useEffect(() => {
    if (open) {
      setDraft({
        statusMulti: state.statusMulti,
        featured: state.featured,
        athlete: state.athlete,
        priceMin: state.priceMin,
        priceMax: state.priceMax,
      });
    }
  }, [open, state]);

  const applyDraft = () => {
    onApply({ ...draft, page: 1 });
    onOpenChange(false);
  };

  const fields = (
    <MarketplaceItemsFilterFields
      draft={draft}
      onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="bg-surface border-border text-white w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{fields}</div>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white/5 border border-border py-3 rounded-lg text-sm text-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyDraft}
              className="flex-1 bg-primary py-3 rounded-lg text-sm font-bold text-white"
            >
              Apply filters
            </button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleContent className="bg-surface border border-border rounded-xl p-4 data-[state=open]:animate-in data-[state=closed]:animate-out">
        <div className="flex items-center justify-between mb-4">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold text-white">
            <ChevronDown className="w-4 h-4" aria-hidden />
            Advanced filters
          </CollapsibleTrigger>
          <button
            type="button"
            onClick={applyDraft}
            className="bg-primary px-4 py-2 rounded-lg text-xs font-bold text-white min-h-[32px]"
          >
            Apply
          </button>
        </div>
        {fields}
      </CollapsibleContent>
    </Collapsible>
  );
}
