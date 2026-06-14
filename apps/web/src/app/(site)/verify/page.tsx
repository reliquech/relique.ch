"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyService } from "@/lib/services/verifyService";
import type { VerifyResult as VerifyResultType } from "@relique/shared/domain";
import { LoadingState } from "@/components/shared/LoadingState";
import { VerifyFormSection } from "./components/VerifyFormSection";
import { VerifyResultPanel } from "./components/VerifyResultPanel";

/**
 * Verify page content
 * Refactored from 202 lines to use composable components
 * 
 * Architecture:
 * - Reusable components in src/components/verify/
 * - Wrapper components in app/verify/components/
 * - Clean orchestration in page.tsx
 */
function VerifyPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResultType | "not_found" | null>(null);

  // Handle URL params
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setQuery(codeParam);
      handleVerify(codeParam);
    }
  }, [searchParams]);

  const handleVerify = async (code?: string) => {
    const id = code || query;
    if (!id.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const verifyResult = await verifyService.run({
        inputType: "code",
        code: id.trim().toUpperCase(),
      });
      setResult(verifyResult);
    } catch (error) {
      setResult("not_found");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="py-24 bg-bgDark min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-16">
          <VerifyFormSection
            query={query}
            loading={loading}
            onQueryChange={setQuery}
            onSubmit={handleSubmit}
          />

          <VerifyResultPanel result={result} loading={loading} productId={query} />
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyPageContent />
    </Suspense>
  );
}
