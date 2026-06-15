"use client";

import { useMemo, useRef, useEffect } from "react";
import type { Customer } from "@/lib/types/admin";
import { getStatusPill } from "@/lib/utils/admin";

interface UseCustomersColumnsOptions {
  items: Customer[];
  selectedIds: string[];
  allSelected: boolean;
  someSelected: boolean;
  userId: string | null;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: string, checked: boolean) => void;
}

export function useCustomersColumns({
  items,
  selectedIds,
  allSelected,
  someSelected,
  userId,
  onToggleAll,
  onToggleOne,
}: UseCustomersColumnsOptions) {
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
        aria-label="Select all customers"
      />
    );

    return [
      {
        header: headerCheckbox,
        accessor: "select",
        render: (r: Customer) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(r.id)}
            onChange={(e) => onToggleOne(r.id, e.target.checked)}
            className="h-4 w-4"
            aria-label={`Select customer ${r.full_name}`}
          />
        ),
      },
      {
        header: "Name",
        accessor: "full_name",
        render: (r: Customer) => <span className="font-semibold text-white">{r.full_name}</span>,
      },
      {
        header: "Owner",
        accessor: "owner_id",
        render: (r: Customer) => (
          <span className="text-gray-400">{r.owner_id === userId ? "You" : "—"}</span>
        ),
      },
      {
        header: "Email",
        accessor: "email",
        render: (r: Customer) => <span className="text-gray-300">{r.email ?? "—"}</span>,
      },
      {
        header: "Company",
        accessor: "company",
        render: (r: Customer) => <span className="text-gray-300">{r.company ?? "—"}</span>,
      },
      {
        header: "Tags",
        accessor: "tags",
        render: (r: Customer) => (
          <span className="text-gray-400 text-xs">{r.tags?.length ? r.tags.join(", ") : "—"}</span>
        ),
      },
      { header: "Status", accessor: "status", render: (r: Customer) => getStatusPill(r.status) },
      {
        header: "Created",
        accessor: "created_at",
        render: (r: Customer) => (
          <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
        ),
      },
    ];
  }, [allSelected, items, onToggleAll, onToggleOne, selectedIds, userId]);
}
