"use client";

import { ResultTable } from "@/components/shared/ResultTable";
import { StatusExplanations } from "@/components/lists/StatusExplanations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type VerifyStatus = "qualified" | "inconclusive" | "disqualified";

interface VerifyResultProps {
  productId: string;
  itemName: string;
  signatures: number;
  status: VerifyStatus;
  date: string;
}

export function VerifyResult({
  productId,
  itemName,
  signatures,
  status,
  date,
}: VerifyResultProps) {
  const statusConfig = {
    qualified: {
      label: "Qualified",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    inconclusive: {
      label: "Inconclusive",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    disqualified: {
      label: "Disqualified",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  };

  const config = statusConfig[status];

  const handleShare = () => {
    const url = `${window.location.origin}/verify?code=${encodeURIComponent(productId)}&result=${status}`;
    if (navigator.share) {
      navigator.share({
        title: `Verification Result: ${itemName}`,
        text: `Product ${productId} verification result: ${config.label}`,
        url,
      }).catch(() => {
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Link copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-h2">Authentication Result</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
      <h2 className="text-h2 mb-6 hidden print:block">Authentication Result</h2>
      <div className="print:break-inside-avoid">
        <ResultTable
          rows={[
            { label: "Product ID", value: productId },
            { label: "Item Name", value: itemName },
            { label: "Number of Signatures", value: signatures.toString() },
            {
              label: "Result Status",
              value: (
                <Badge className={cn("border-0", config.className)}>
                  {config.label}
                </Badge>
              ),
            },
            { label: "Date of Analysis", value: new Date(date).toLocaleDateString() },
          ]}
        />
      </div>
      <div className="print:break-inside-avoid">
        <StatusExplanations />
      </div>
    </div>
  );
}

