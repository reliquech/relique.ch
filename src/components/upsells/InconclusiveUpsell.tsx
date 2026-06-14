"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Mail } from "lucide-react";
import Link from "next/link";

export function InconclusiveUpsell() {
  return (
    <Card className="border-yellow-500/50 bg-yellow-500/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg">Need More Information?</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This result is inconclusive. Consider these options for a definitive answer:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
          <li>Submit additional photos or documentation</li>
          <li>Consign the item for professional authentication</li>
          <li>Contact our authentication team for expert review</li>
        </ul>
        <div className="flex gap-2 pt-2">
          <Button asChild>
            <Link href="/consign">
              <FileText className="w-4 h-4 mr-2" />
              Consign Item
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
