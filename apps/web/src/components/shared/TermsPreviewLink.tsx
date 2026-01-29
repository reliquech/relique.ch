"use client";

import { useState } from "react";
import Link from "next/link";

const TERMS_HREF = "/terms-policies";

/**
 * Inline link to Terms & Policies with hover preview of the actual page (iframe).
 */
export function TermsPreviewLink() {
  const [hovered, setHovered] = useState(false);
  const showPreview = hovered;

  return (
    <span
      className="group/link relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={TERMS_HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-primaryBlue hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-primaryBlue"
      >
        Terms & Policies
      </Link>
      {showPreview && (
        <span
          aria-hidden
          className="absolute bottom-full left-0 z-50 mb-0.5 hidden w-[min(90vw,360px)] flex-col overflow-hidden rounded border border-white/10 bg-cardDark shadow-xl md:flex"
        >
          <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden bg-bgDark">
            {showPreview && (
              <iframe
                src={`${TERMS_HREF}?preview=1`}
                title="Terms & Policies preview"
                className="pointer-events-none absolute inset-0 h-full w-full border-0"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cardDark/60 via-transparent to-transparent" />
          </div>
          <div className="border-t border-white/5 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primaryBlue">
              Terms & Policies
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60">
              View page →
            </p>
          </div>
        </span>
      )}
    </span>
  );
}
