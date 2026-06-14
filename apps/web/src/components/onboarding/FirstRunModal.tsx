"use client";

import { useEffect, useState } from "react";
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
import { storage } from "@/lib/storage";

export function FirstRunModal() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const session = storage.sessionMock.get();
    if (!session) {
      setOpen(true);
    }
  }, []);

  const handleSkip = () => {
    storage.sessionMock.set({
      displayName: "Collector",
      createdAt: Date.now(),
    });
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      storage.sessionMock.set({
        displayName: displayName.trim(),
        createdAt: Date.now(),
      });
      setOpen(false);
    } else {
      handleSkip();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Relique Portal</DialogTitle>
          <DialogDescription>
            Enter a display name to personalize your experience (optional).
            You can change this later in your profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Collector"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

