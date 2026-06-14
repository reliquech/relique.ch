"use client";

import { useState } from "react";
import Link from "next/link";
import type { VerifyResult } from "@/lib/domain";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils/verify";

interface VerifyResultDisplayProps {
  result: VerifyResult;
  productId: string;
}

/**
 * Verify result display component
 * Shows verification result details
 */
export function VerifyResultDisplay({ result, productId }: VerifyResultDisplayProps) {
  const imageUrl = result.heroImageUrl;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primaryBlue">
          Authentication Result
        </h3>
        <span
          className={`px-3 py-1 ${getStatusColor(result.status)} text-[10px] font-black uppercase tracking-widest`}
        >
          {getStatusLabel(result.status)}
        </span>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase text-textSec">Product ID</span>
          <span className="text-sm font-bold">{result.productId || productId}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase text-textSec">Item Name</span>
          <span className="text-sm font-bold text-right">{result.itemName || "N/A"}</span>
        </div>
        {result.signerNames && result.signerNames.length > 0 && (
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase text-textSec">Signer(s)</span>
            <span className="text-sm font-bold text-right">{result.signerNames.join(", ")}</span>
          </div>
        )}
        {result.itemType && (
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase text-textSec">Item Type</span>
            <span className="text-sm font-bold text-right">{result.itemType}</span>
          </div>
        )}
        {result.grade && (
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase text-textSec">Grade</span>
            <span className="text-sm font-bold">{result.grade}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase text-textSec">Certificate</span>
          <span className="text-sm font-bold font-mono">{result.certificate}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase text-textSec">Analysis Date</span>
          <span className="text-sm font-bold">
            {formatDate(result.date || result.dateOfAnalysis)}
          </span>
        </div>
        {result.marketplaceUrl && (
          <div className="pt-2">
            <Link
              href={result.marketplaceUrl}
              className="text-xs font-black uppercase tracking-widest text-highlightIce hover:text-white transition-colors"
            >
              View marketplace listing →
            </Link>
          </div>
        )}
      </div>
      <div className="aspect-square bg-bgDark border border-white/5 flex items-center justify-center p-8 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={result.itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full border-4 border-primaryBlue/30 flex items-center justify-center relative">
            <span className="text-6xl font-black text-white/20">VALID</span>
          </div>
        )}
      </div>
    </div>
  );
}
