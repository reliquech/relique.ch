"use client";

import { motion } from "framer-motion";
import { VerifyInput } from "@/components/inputs/VerifyInput";
import { StatusDefinitionsList } from "@/components/lists/StatusDefinitionsList";

interface VerifyFormSectionProps {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Verify form section wrapper
 * Contains input form and status definitions
 */
export function VerifyFormSection({
  query,
  loading,
  onQueryChange,
  onSubmit,
}: VerifyFormSectionProps) {
  return (
    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
      <h1 className="text-3xl font-semibold tracking-tight mb-8 leading-none">
        Authenticity <span className="text-primaryBlue">Verification</span>
      </h1>
      <p className="text-textSec text-xs mb-8 leading-relaxed">
        Relique.ch allows immediate verification of any authenticated Memorabilia via a
        product code or QR scan. Each item is assigned an unique identifier, linking it to a
        comprehensive assessment.
      </p>

      <VerifyInput
        value={query}
        onChange={onQueryChange}
        onSubmit={onSubmit}
        loading={loading}
      />

      <StatusDefinitionsList />
    </motion.div>
  );
}
