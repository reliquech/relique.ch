"use client";

import { useState } from "react";
import { ResultTable } from "@/components/shared/ResultTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/lib/ui/shadcn/ui/accordion";
import { Progress } from "@/lib/ui/shadcn/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Printer, Download, Copy, Pin, PinOff, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { VerifyResult as VerifyResultType } from "@/lib/domain";

type VerifyStatus = "qualified" | "inconclusive" | "disqualified";

interface VerifyResultEnhancedProps {
  result: VerifyResultType;
  onSave?: () => void;
  onPin?: (pinned: boolean) => void;
  isPinned?: boolean;
  saved?: boolean;
}

export function VerifyResultEnhanced({
  result,
  onSave,
  onPin,
  isPinned = false,
  saved = false,
}: VerifyResultEnhancedProps) {
  const [copied, setCopied] = useState(false);

  const statusConfig = {
    qualified: {
      label: "Qualified",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      confidence: 94,
    },
    inconclusive: {
      label: "Inconclusive",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      confidence: 65,
    },
    disqualified: {
      label: "Disqualified",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      confidence: 12,
    },
  };

  const config = statusConfig[result.status];
  const verificationLink = `${typeof window !== "undefined" ? window.location.origin : ""}/verify?code=${encodeURIComponent(result.productId)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationLink).then(() => {
      setCopied(true);
      toast.success("Verification link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Verification Result: ${result.itemName}`,
        text: `Product ${result.productId} verification result: ${config.label}`,
        url: verificationLink,
      }).catch(() => {
        handleCopyLink();
      });
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate printable HTML
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Verification Summary - ${result.productId}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
            h1 { border-bottom: 2px solid #000; padding-bottom: 0.5rem; }
            table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .status { padding: 0.25rem 0.5rem; border-radius: 4px; display: inline-block; }
            .qualified { background: #dcfce7; color: #166534; }
            .inconclusive { background: #fef3c7; color: #92400e; }
            .disqualified { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>Verification Summary</h1>
          <table>
            <tr><th>Product ID</th><td>${result.productId}</td></tr>
            <tr><th>Item Name</th><td>${result.itemName}</td></tr>
            <tr><th>Signatures</th><td>${result.signatures}</td></tr>
            <tr><th>Status</th><td><span class="status ${result.status}">${config.label}</span></td></tr>
            <tr><th>Confidence</th><td>${config.confidence}%</td></tr>
            <tr><th>Date</th><td>${new Date(result.date).toLocaleDateString()}</td></tr>
          </table>
          <p><strong>Verification Link:</strong> ${verificationLink}</p>
        </body>
      </html>
    `;
    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-${result.productId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Verification summary downloaded");
  };

  const handlePin = () => {
    onPin?.(!isPinned);
    toast.success(isPinned ? "Unpinned from vault" : "Pinned to vault");
  };

  // Mock breakdown data
  const breakdown = {
    pattern: { score: 85, status: "match" },
    stroke: { score: 92, status: "match" },
    velocity: { score: 78, status: "partial" },
    pressure: { score: 88, status: "match" },
    consistency: { score: 91, status: "match" },
  };

  return (
    <div className="space-y-6">
      {/* Result Header with Confidence Meter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">Authentication Result</CardTitle>
              <CardDescription>Product ID: {result.productId}</CardDescription>
            </div>
            <Badge className={cn("text-sm px-3 py-1", config.className)}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence Score</span>
              <span className="font-semibold">{config.confidence}%</span>
            </div>
            <Progress value={config.confidence} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {config.confidence >= 90
                ? "High confidence in authenticity"
                : config.confidence >= 70
                ? "Moderate confidence - additional review recommended"
                : "Low confidence - likely not authentic"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Result Table */}
      <Card>
        <CardContent className="pt-6">
          <ResultTable
            rows={[
              { label: "Product ID", value: result.productId },
              { label: "Item Name", value: result.itemName },
              { label: "Number of Signatures", value: result.signatures.toString() },
              {
                label: "Result Status",
                value: (
                  <Badge className={cn("border-0", config.className)}>
                    {config.label}
                  </Badge>
                ),
              },
              { label: "Date of Analysis", value: new Date(result.date).toLocaleDateString() },
            ]}
          />
        </CardContent>
      </Card>

      {/* Explain This Result Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Explain This Result</CardTitle>
          <CardDescription>Detailed breakdown of authentication analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="breakdown">
              <AccordionTrigger>View Analysis Breakdown</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {Object.entries(breakdown).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{key}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{value.score}%</span>
                          <Badge
                            variant={value.status === "match" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {value.status}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={value.score} className="h-1.5" />
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Analysis based on pattern matching, stroke analysis, velocity curves, pressure points, and consistency checks.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {onSave && (
          <Button
            onClick={onSave}
            disabled={saved}
            variant={saved ? "outline" : "default"}
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Saved" : "Save to Vault"}
          </Button>
        )}
        {onPin && (
          <Button
            onClick={handlePin}
            variant={isPinned ? "default" : "outline"}
          >
            {isPinned ? (
              <>
                <PinOff className="w-4 h-4 mr-2" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="w-4 h-4 mr-2" />
                Pin
              </>
            )}
          </Button>
        )}
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" onClick={handleCopyLink}>
          <Copy className="w-4 h-4 mr-2" />
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
}

