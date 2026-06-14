"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { X, FileText } from "lucide-react";
import { consignService } from "@/lib/services/consignService";
import type { ConsignDraft } from "@/lib/schemas/consign";

interface DraftManagerProps {
  onLoadDraft: (draft: ConsignDraft) => void;
  onDiscard: () => void;
}

export function DraftManager({ onLoadDraft, onDiscard }: DraftManagerProps) {
  const [draft, setDraft] = useState<ConsignDraft | null>(null);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    const loadDraft = async () => {
      const drafts = await consignService.drafts.list();
      const latestDraft = drafts.sort((a, b) => b.timestamp - a.timestamp)[0];
      if (latestDraft && latestDraft.status === "draft") {
        setDraft(latestDraft);
      }
    };
    loadDraft();
  }, []);

  if (!draft || !showAlert) return null;

  return (
    <Alert className="mb-6">
      <FileText className="h-4 w-4" />
      <AlertTitle>Draft Found</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          You have an unsaved draft from{" "}
          {draft.timestamp
            ? new Date(draft.timestamp).toLocaleString()
            : "earlier"}
          .
        </p>
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => {
              onLoadDraft(draft);
              setShowAlert(false);
            }}
          >
            Continue Draft
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              // Drafts don't have id, but remove() clears the single draft anyway
              await consignService.drafts.remove(String(draft.timestamp));
              setDraft(null);
              setShowAlert(false);
              onDiscard();
            }}
          >
            Discard
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAlert(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

