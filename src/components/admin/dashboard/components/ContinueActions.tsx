"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { verifyService } from "@/lib/legacy/verifyService";
import { consignService } from "@/lib/legacy/consignService";
import { FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function ContinueActions() {
  const [hasLatestDraft, setHasLatestDraft] = useState(false);
  const [hasLatestVerify, setHasLatestVerify] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const drafts = await consignService.drafts.list();
      const history = await verifyService.history.list();

      setHasLatestDraft(drafts.length > 0);
      setHasLatestVerify(history.length > 0);
    };

    loadData();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {hasLatestDraft && (
        <Link href="/admin/submissions?tab=consignments&draft=latest">
          <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-semibold">Resume Draft</span>
            </div>
            <p className="text-sm text-muted-foreground">Continue your latest consignment draft</p>
            <ArrowRight className="h-4 w-4 ml-auto mt-2" />
          </Button>
        </Link>
      )}

      {hasLatestVerify && (
        <Link href="/admin/submissions?tab=verifications&latest=true">
          <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold">View Latest Verify</span>
            </div>
            <p className="text-sm text-muted-foreground">See your most recent verification result</p>
            <ArrowRight className="h-4 w-4 ml-auto mt-2" />
          </Button>
        </Link>
      )}
    </div>
  );
}

