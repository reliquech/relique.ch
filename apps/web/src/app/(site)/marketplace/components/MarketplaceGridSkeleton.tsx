"use client";

export function MarketplaceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-cardDark border border-white/10 p-8 animate-pulse space-y-6 h-[550px]"
        >
          <div className="aspect-square bg-white/5" />
          <div className="h-5 w-1/2 bg-white/5" />
          <div className="h-8 w-3/4 bg-white/5" />
          <div className="h-16 w-full bg-white/5 mt-auto" />
        </div>
      ))}
    </div>
  );
}
