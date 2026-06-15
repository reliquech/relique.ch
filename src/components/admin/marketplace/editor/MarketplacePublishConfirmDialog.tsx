"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MarketplacePublishConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  status?: string;
  onConfirm: () => void | Promise<void>;
  isPublishing?: boolean;
}

export function MarketplacePublishConfirmDialog({
  open,
  onOpenChange,
  title,
  status,
  onConfirm,
  isPublishing,
}: MarketplacePublishConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish item</DialogTitle>
          <DialogDescription>
            Publishing {title || "this item"} makes it visible wherever published marketplace items are surfaced.
            Current status: {status ?? "draft"}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void onConfirm()} disabled={isPublishing}>
            {isPublishing ? "Publishing..." : "Publish item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
