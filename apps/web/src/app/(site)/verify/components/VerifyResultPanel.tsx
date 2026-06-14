"use client";

import { motion } from "framer-motion";
import type { VerifyResult as VerifyResultType } from "@relique/shared/domain";
import { VerifyResultDisplay } from "@/components/results/VerifyResultDisplay";
import {
  VerifyLoadingState,
  VerifyNotFoundState,
  VerifyEmptyStateSimple,
} from "@/components/states/VerifyStates";

interface VerifyResultPanelProps {
  result: VerifyResultType | "not_found" | null;
  loading: boolean;
  productId: string;
}

/**
 * Verify result panel wrapper
 * Handles all result states (loading, empty, error, success)
 */
export function VerifyResultPanel({ result, loading, productId }: VerifyResultPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-cardDark border border-white/5 p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primaryBlue/5 -mr-16 -mt-16 rotate-45" />

      {loading && <VerifyLoadingState />}

      {result === "not_found" && <VerifyNotFoundState />}

      {!result && !loading && <VerifyEmptyStateSimple />}

      {result && result !== "not_found" && !loading && (
        <VerifyResultDisplay result={result} productId={productId} />
      )}
    </motion.div>
  );
}
