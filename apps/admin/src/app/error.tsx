"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center p-6">
      <div className="border border-border bg-surface rounded-2xl p-8 max-w-lg text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-6">{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
