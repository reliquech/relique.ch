"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { consignService } from "@/lib/services/consignService";
import type { ConsignSubmission } from "@/lib/schemas/consign";
import Link from "next/link";

function ConsignSuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get("id");
  const [submission, setSubmission] = useState<ConsignSubmission | null>(null);

  useEffect(() => {
    if (submissionId) {
      consignService.get(submissionId).then(setSubmission);
    }
  }, [submissionId]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-h2">Submission Successful!</CardTitle>
                <CardDescription>
                  Your consignment request has been submitted
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {submission && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Submission ID: <span className="font-mono">{submission.id}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: <span className="font-medium">{submission.status}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(submission.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <p className="text-body">
                Thank you for submitting your consignment request. Our team will review your submission and contact you shortly.
              </p>
              <p className="text-sm text-muted-foreground">
                You can track your submission status in your account dashboard.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button asChild>
                <Link href="/app/submissions">View Submissions</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/consign">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Submit Another
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ConsignSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16">Loading...</div>}>
      <ConsignSuccessPageContent />
    </Suspense>
  );
}
