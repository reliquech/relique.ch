"use client";

interface LeadsBulkActionsProps {
  selectedCount: number;
  canEdit: boolean;
  canBulkDelete: boolean;
  userId: string | null;
  onAssignToMe: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
}

export function LeadsBulkActions({
  selectedCount,
  canEdit,
  canBulkDelete,
  userId,
  onAssignToMe,
  onBulkStatusChange,
  onBulkDelete,
}: LeadsBulkActionsProps) {
  if (!canEdit || selectedCount === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={onAssignToMe}
        disabled={!userId}
        className="bg-white/5 border border-border text-gray-300 px-3 py-2 rounded-lg text-xs hover:text-white"
      >
        Assign to me
      </button>
      <select
        onChange={(e) => {
          if (e.target.value) {
            onBulkStatusChange(e.target.value);
            e.target.value = "";
          }
        }}
        className="bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white"
        defaultValue=""
      >
        <option value="" disabled>
          Set status
        </option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="unqualified">Unqualified</option>
      </select>
      {canBulkDelete ? (
        <button
          type="button"
          onClick={onBulkDelete}
          className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-xs font-bold"
        >
          Delete selected ({selectedCount})
        </button>
      ) : null}
    </>
  );
}
