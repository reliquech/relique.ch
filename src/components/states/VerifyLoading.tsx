"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface VerifyLoadingProps {
  duration?: number;
  onComplete?: () => void;
}

export function VerifyLoading({ duration = 5000, onComplete }: VerifyLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <Card>
      <CardContent className="py-12">
        <div className="space-y-6 text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Analyzing Product Authenticity</h3>
            <p className="text-sm text-muted-foreground">
              This may take a few moments...
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-muted h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

