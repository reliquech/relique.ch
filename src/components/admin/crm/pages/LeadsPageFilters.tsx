"use client";

import { Search, Plus } from "lucide-react";
import { LeadsBulkActions } from "./LeadsBulkActions";

interface LeadsPageFiltersProps {
  searchQuery: string;
  statusFilter: string;
  selectedCount: number;
  canEdit: boolean;
  canBulkDelete: boolean;
  userId: string | null;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCreate: () => void;
  onAssignToMe: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
}

export function LeadsPageFilters({
  searchQuery,
  statusFilter,
  selectedCount,
  canEdit,
  canBulkDelete,
  userId,
  onSearchChange,
  onStatusChange,
  onCreate,
  onAssignToMe,
  onBulkStatusChange,
  onBulkDelete,
}: LeadsPageFiltersProps) {
  return (
    <>
      <LeadsBulkActions
        selectedCount={selectedCount}
        canEdit={canEdit}
        canBulkDelete={canBulkDelete}
        userId={userId}
        onAssignToMe={onAssignToMe}
        onBulkStatusChange={onBulkStatusChange}
        onBulkDelete={onBulkDelete}
      />
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
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white"
      >
        <option value="">All status</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="unqualified">Unqualified</option>
      </select>
      {canEdit ? (
        <button
          type="button"
          onClick={onCreate}
          className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" /> Create Lead
        </button>
      ) : null}
    </>
  );
}
