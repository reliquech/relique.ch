"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MarketplaceFormFooterProps {
  isSubmitting: boolean;
  isUploading: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

export function MarketplaceFormFooter({
  isSubmitting,
  isUploading,
  isEdit,
  onCancel,
}: MarketplaceFormFooterProps) {
  return (
    <div className="flex justify-end gap-sm pt-6 border-t border-stitch-outline-variant">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting || isUploading}
        className="px-lg py-[10px] rounded-lg border border-stitch-outline-variant text-stitch-on-surface font-label-md text-label-md uppercase tracking-wider font-bold hover:bg-stitch-surface-container transition-colors"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting || isUploading}
        className="px-lg py-[10px] rounded-lg bg-stitch-primary text-stitch-on-primary font-label-md text-label-md uppercase tracking-wider font-bold hover:bg-stitch-primary/95 transition-colors shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isEdit ? "Saving..." : "Creating..."}
          </>
        ) : isEdit ? (
          "Save Changes"
        ) : (
          "Create Item"
        )}
      </Button>
    </div>
  );
}
