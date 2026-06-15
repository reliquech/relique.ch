"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { MarketplaceItem } from "@/lib/types/admin";

interface MarketplaceItemRowMenuProps {
  item: MarketplaceItem;
  onEdit: () => void;
  onPreview: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  canPreview: boolean;
  canMutate?: boolean;
}

/** Row overflow menu — wraps shadcn dropdown without editing primitives. */
export function MarketplaceItemRowMenu({
  item,
  onEdit,
  onPreview,
  onDuplicate,
  onPublish,
  onUnpublish,
  onArchive,
  onRestore,
  onDelete,
  canPreview,
  canMutate = true,
}: MarketplaceItemRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Actions for ${item.title}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-surface border-border text-white">
        <DropdownMenuItem onClick={onEdit} disabled={!canMutate}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPreview} disabled={!canPreview}>
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate} disabled={!canMutate}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        {item.status === "draft" ? (
          <DropdownMenuItem onClick={onPublish} disabled={!canMutate}>
            Publish
          </DropdownMenuItem>
        ) : null}
        {item.status === "published" ? (
          <DropdownMenuItem onClick={onUnpublish} disabled={!canMutate}>
            Unpublish
          </DropdownMenuItem>
        ) : null}
        {item.status === "published" ? (
          <DropdownMenuItem onClick={onArchive} disabled={!canMutate}>
            Archive
          </DropdownMenuItem>
        ) : null}
        {item.status === "archived" ? (
          <DropdownMenuItem onClick={onRestore} disabled={!canMutate}>
            Restore
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={onDelete}
          disabled={!canMutate}
          className="text-destructive focus:text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
