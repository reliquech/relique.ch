"use client";

import { useCallback, useEffect } from "react";

export function useUnsavedChangesGuard(dirty: boolean, message = "You have unsaved changes.") {
  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty, message]);

  return useCallback(() => {
    if (!dirty) return true;
    return window.confirm(message);
  }, [dirty, message]);
}
