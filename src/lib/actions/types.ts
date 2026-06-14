import type { ReactNode } from "react";

export type ActionGroup =
  | "Navigate"
  | "Create"
  | "Utilities"
  | "Verify"
  | "Marketplace";

export interface ActionContext {
  currentPath?: string;
  router?: {
    push: (path: string) => void;
  };
}

export interface Action {
  id: string;
  label: string;
  keywords: string[];
  group: ActionGroup;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  perform: (context?: ActionContext) => void | Promise<void>;
  contextAware?: boolean;
}

