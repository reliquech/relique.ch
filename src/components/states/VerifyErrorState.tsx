"use client";

import { ErrorState } from "@/lib/ui/states/error-state";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface VerifyErrorStateProps {
  error: string;
  onRetry?: () => void;
  onContact?: () => void;
}

export function VerifyErrorState({ error, onRetry, onContact }: VerifyErrorStateProps) {
  return (
    <ErrorState
      title="Verification Failed"
      description={error}
      action={
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry}>Try Again</Button>
          )}
          {onContact && (
            <Button variant="outline" onClick={onContact}>
              Contact Support
            </Button>
          )}
        </div>
      }
    />
  );
}

