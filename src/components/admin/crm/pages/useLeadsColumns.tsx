"use client";

import { useMemo, useRef, useEffect } from "react";
import type { Lead } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";

interface UseLeadsColumnsOptions {
  items: Lead[];
  selectedIds: string[];
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: string, checked: boolean) => void;
}

export function useLeadsColumns({
  items,
  selectedIds,
  allSelected,
  someSelected,
  onToggleAll,
  onToggleOne,
}: UseLeadsColumnsOptions) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected, selectedIds]);

  return useMemo(() => {
    const headerCheckbox = (
      <input
        ref={selectAllRef}
        type="checkbox"
        checked={allSelected}
        onChange={(e) => onToggleAll(e.target.checked)}
        className="h-4 w-4"
        aria-label="Select all leads"
      />
    );

    return [
      {
        header: headerCheckbox,
        accessor: "select",
        render: (r: Lead) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(r.id)}
            onChange={(e) => onToggleOne(r.id, e.target.checked)}
            className="h-4 w-4"
            aria-label={`Select lead ${r.full_name}`}
          />
        ),
      },
      {
        header: "Name",
        accessor: "full_name",
        render: (r: Lead) => <span className="font-semibold text-white">{r.full_name}</span>,
      },
      {
        header: "Email",
        accessor: "email",
        render: (r: Lead) => <span className="text-gray-300">{r.email ?? "—"}</span>,
      },
      {
        header: "Company",
        accessor: "company",
        render: (r: Lead) => <span className="text-gray-300">{r.company ?? "—"}</span>,
      },
      { header: "Status", accessor: "status", render: (r: Lead) => getStatusPill(r.status) },
      {
        header: "Score",
        accessor: "score",
        render: (r: Lead) => <span className="text-gray-300">{r.score ?? 0}</span>,
      },
      {
        header: "Created",
        accessor: "created_at",
        render: (r: Lead) => (
          <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
        ),
      },
    ];
  }, [allSelected, items, onToggleAll, onToggleOne, selectedIds]);
}
