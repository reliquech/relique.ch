"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Clock, AlertCircle, Save, History, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type DraftStatus = "idle" | "saving" | "saved" | "error";

export interface DraftVersion {
  id: string;
  timestamp: number;
  label?: string;
}

interface DraftStatusBarProps {
  status: DraftStatus;
  lastSaved: Date | null;
  versions: DraftVersion[];
  onSaveNow: () => void;
  onRestoreVersion: (version: DraftVersion) => void;
  errorMessage?: string;
}

export function DraftStatusBar({
  status,
  lastSaved,
  versions,
  onSaveNow,
  onRestoreVersion,
  errorMessage,
}: DraftStatusBarProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "saved":
        return <Check className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "saving":
        return "Saving...";
      case "saved":
        return lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : "Saved";
      case "error":
        return errorMessage || "Failed to save";
      default:
        return lastSaved ? `Last saved ${formatTimeAgo(lastSaved)}` : "Not saved yet";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 border bg-card",
        status === "error" && "border-destructive bg-destructive/10"
      )}
    >
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm">{getStatusText()}</span>
        {status === "saved" && (
          <Badge variant="outline" className="text-xs">
            Draft
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {versions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <History className="w-4 h-4 mr-2" />
                Versions ({versions.length})
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Previous Versions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {versions.slice(0, 5).map((version) => (
                <DropdownMenuItem
                  key={version.id}
                  onClick={() => onRestoreVersion(version)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="flex-1">
                    {version.label || formatVersionTime(version.timestamp)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onSaveNow}
          disabled={status === "saving"}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Now
        </Button>
      </div>
    </div>
  );
}

function formatVersionTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

