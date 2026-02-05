"use client";

import React from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <div className="border border-border bg-surface rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Admin error</h2>
        <p className="text-gray-400 text-sm mb-6">{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
