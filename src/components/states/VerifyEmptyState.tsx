"use client";

import { EmptyState } from "@/lib/ui/states/empty-state";
import { Button } from "@/components/ui/button";
import { QrCode, FileText } from "lucide-react";
import Link from "next/link";

export function VerifyEmptyState() {
  return (
    <EmptyState
      title="No Verifications Yet"
      description="Start by verifying a product ID or scanning a QR code to check authenticity"
      icon={<QrCode className="w-12 h-12 text-muted-foreground" />}
      action={
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/verify">Verify Now</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </div>
      }
    />
  );
}

