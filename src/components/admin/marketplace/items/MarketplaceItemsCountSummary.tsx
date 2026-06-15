interface MarketplaceItemsCountSummaryProps {
  visible: number;
  filtered: number;
  total: number;
  hasFilters: boolean;
}

export function MarketplaceItemsCountSummary({
  visible,
  filtered,
  total,
  hasFilters,
}: MarketplaceItemsCountSummaryProps) {
  return (
    <p className="text-sm text-gray-400">
      {hasFilters
        ? `Showing ${visible} of ${filtered} filtered items`
        : `Showing ${visible} of ${total} items`}
    </p>
  );
}
