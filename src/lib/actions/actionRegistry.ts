import type { Action } from "./types";
import { navigationActions } from "./navigationActions";
import { createActions } from "./createActions";
import { utilityActions } from "./utilityActions";
import { verifyActions } from "./verifyActions";
import { marketplaceActions } from "./marketplaceActions";

let allActions: Action[] = [];

export function registerActions(actions: Action[]): void {
  allActions = actions;
}

export function getAllActions(): Action[] {
  return allActions;
}

export function getActionsByGroup(group: Action["group"]): Action[] {
  return allActions.filter((action) => action.group === group);
}

export function searchActions(query: string): Action[] {
  const lowerQuery = query.toLowerCase();
  return allActions.filter((action) => {
    const matchesLabel = action.label.toLowerCase().includes(lowerQuery);
    const matchesKeywords = action.keywords.some((keyword) =>
      keyword.toLowerCase().includes(lowerQuery)
    );
    return matchesLabel || matchesKeywords;
  });
}

export async function initializeActions(currentPath?: string): Promise<void> {
  const [verify, marketplace] = await Promise.all([
    verifyActions(),
    marketplaceActions(),
  ]);
  
  const actions: Action[] = [
    ...navigationActions(currentPath),
    ...createActions(),
    ...utilityActions(),
    ...verify,
    ...marketplace,
  ];
  registerActions(actions);
}

