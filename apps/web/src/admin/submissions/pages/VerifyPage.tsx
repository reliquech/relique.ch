"use client";

import React from "react";

/**
 * Admin verify queue — placeholder until server-side audit log (Phase 2 D-08).
 */
export default function VerifyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">
          Verification Records
        </h1>
        <p className="text-sm text-textSec mt-2 max-w-xl">
          Public verify lookups are not stored in the admin queue yet. This view will be
          available in a future release.
        </p>
      </div>
      <div className="border border-white/10 bg-cardDark p-12 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-textSec">
          No verification records to display
        </p>
      </div>
    </div>
  );
}
