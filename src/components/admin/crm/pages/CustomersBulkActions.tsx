"use client";

interface CustomersBulkActionsProps {
  selectedCount: number;
  canEdit: boolean;
  canBulkDelete: boolean;
  userId: string | null;
  onAssignToMe: () => void;
  onBulkStatusChange: (status: "active" | "inactive") => void;
  onBulkDelete: () => void;
}

export function CustomersBulkActions({
  selectedCount,
  canEdit,
  canBulkDelete,
  userId,
  onAssignToMe,
  onBulkStatusChange,
  onBulkDelete,
}: CustomersBulkActionsProps) {
  if (!canEdit || selectedCount === 0) return null;

  return (
    <>
      {userId ? (
        <button
          type="button"
          onClick={onAssignToMe}
          className="bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-bold"
        >
          Assign to me ({selectedCount})
        </button>
      ) : null}
      <select
        onChange={(e) => {
          if (e.target.value) {
            onBulkStatusChange(e.target.value as "active" | "inactive");
            e.target.value = "";
          }
        }}
        className="bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white"
        defaultValue=""
      >
        <option value="" disabled>
          Set status
        </option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
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
