import { Status, getStatusBadgeClasses } from "@/data/marketplace.data";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

/**
 * Reusable status badge component with backdrop blur effect
 * Used in marketplace cards to display item authentication status
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const badgeClasses = getStatusBadgeClasses(status);
  
  return (
    <span className={`${badgeClasses} ${className}`}>
      {status}
    </span>
  );
}
