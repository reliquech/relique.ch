"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Trash2 } from "lucide-react";
import type { SubmissionRow } from "./SubmissionsTable";

export function useSubmissionsColumns(
  onView: (row: SubmissionRow) => void,
  onDuplicate?: (row: SubmissionRow) => void,
  onDelete?: (row: SubmissionRow) => void
) {
  return useMemo<ColumnDef<SubmissionRow>[]>(
    () => [
      {
        accessorKey: "type",
        id: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium border">
              {type === "verify" ? "Verify" : "Consign"}
            </span>
          );
        },
      },
      {
        accessorKey: "reference",
        id: "reference",
        header: "Reference",
        cell: ({ row }) => {
          return <code className="text-xs">{row.getValue("reference")}</code>;
        },
      },
      {
        accessorKey: "itemName",
        id: "itemName",
        header: "Item Name",
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const statusColors: Record<string, string> = {
            qualified: "text-green-400",
            inconclusive: "text-yellow-400",
            disqualified: "text-red-400",
            draft: "text-muted-foreground",
            submitted: "text-blue-400",
            in_review: "text-yellow-400",
            complete: "text-green-400",
          };
          return (
            <span className={statusColors[status] || "text-muted-foreground"}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </span>
          );
        },
      },
      {
        accessorKey: "dateUpdated",
        id: "dateUpdated",
        header: "Date Updated",
        cell: ({ row }) => {
          const timestamp = row.getValue("dateUpdated") as number;
          return new Date(timestamp).toLocaleDateString();
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const submission = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(submission)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {onDuplicate && submission.type === "consign" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicate(submission)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(submission)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onView, onDuplicate, onDelete]
  );
}

