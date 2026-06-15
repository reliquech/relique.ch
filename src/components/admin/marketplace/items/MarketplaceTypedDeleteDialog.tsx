"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MarketplaceTypedDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Array<{ id: string; title: string }>;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
}

export function MarketplaceTypedDeleteDialog({
  open,
  onOpenChange,
  items,
  onConfirm,
  isDeleting,
}: MarketplaceTypedDeleteDialogProps) {
  const [value, setValue] = useState("");
  const single = items.length === 1 ? items[0] : null;
  const requiredPhrase = useMemo(() => (single ? single.title : "DELETE"), [single]);
  const disabled = value !== requiredPhrase || isDeleting;

  useEffect(() => {
    if (!open) setValue("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete marketplace item{items.length === 1 ? "" : "s"}</DialogTitle>
          <DialogDescription>
            {single
              ? `Type "${single.title}" to confirm. This cannot be undone.`
              : `Type "DELETE" to permanently delete ${items.length} items. This cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="marketplace-delete-confirm" className="text-sm font-medium text-white">
            Confirmation
          </label>
          <Input
            id="marketplace-delete-confirm"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            placeholder={requiredPhrase}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={disabled}
            onClick={() => void onConfirm()}
          >
            {isDeleting ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
