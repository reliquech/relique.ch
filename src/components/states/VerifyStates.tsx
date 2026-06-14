import { LoadingState } from "@/components/shared/LoadingState";

/**
 * Verify loading state
 */
export function VerifyLoadingState() {
  return (
    <div className="text-center py-20">
      <LoadingState />
    </div>
  );
}

/**
 * Verify not found state
 */
export function VerifyNotFoundState() {
  return (
    <div className="text-center py-20 text-red-400 font-bold">
      Item Not Found
    </div>
  );
}

/**
 * Verify empty state
 */
export function VerifyEmptyStateSimple() {
  return (
    <div className="text-center py-20 text-white/10 font-bold">
      Enter an ID to start
    </div>
  );
}
