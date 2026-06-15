"use client";

import { Search, Plus } from "lucide-react";
import { CustomersBulkActions } from "./CustomersBulkActions";

interface CustomersPageFiltersProps {
  searchQuery: string;
  ownerFilter: string;
  selectedCount: number;
  canEdit: boolean;
  canBulkDelete: boolean;
  userId: string | null;
  onSearchChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onCreate: () => void;
  onAssignToMe: () => void;
  onBulkStatusChange: (status: "active" | "inactive") => void;
  onBulkDelete: () => void;
}

export function CustomersPageFilters({
  searchQuery,
  ownerFilter,
  selectedCount,
  canEdit,
  canBulkDelete,
  userId,
  onSearchChange,
  onOwnerChange,
  onCreate,
  onAssignToMe,
  onBulkStatusChange,
  onBulkDelete,
}: CustomersPageFiltersProps) {
  return (
    <>
      <CustomersBulkActions
        selectedCount={selectedCount}
        canEdit={canEdit}
        canBulkDelete={canBulkDelete}
        userId={userId}
        onAssignToMe={onAssignToMe}
        onBulkStatusChange={onBulkStatusChange}
        onBulkDelete={onBulkDelete}
      />
      <select
        value={ownerFilter}
        onChange={(e) => onOwnerChange(e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white"
      >
        <option value="">All owners</option>
        <option value="me">Me</option>
      </select>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64 text-white placeholder:text-gray-500"
        />
      </div>
      {canEdit ? (
        <button
          type="button"
          onClick={onCreate}
          className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" /> Create Customer
        </button>
      ) : null}
    </>
  );
}
