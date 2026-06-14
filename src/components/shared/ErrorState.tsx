"use client";

import React from "react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="border border-destructive/30 bg-destructive/10 text-destructive px-4 py-6 rounded-lg text-center">
      <h3 className="text-sm font-bold mb-2">{title}</h3>
      <p className="text-sm mb-4">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
