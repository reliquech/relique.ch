import type { DetailSpecRow } from "@/lib/utils/marketplaceDetail";

interface DetailQuickFactsProps {
  facts: DetailSpecRow[];
}

/** Scannable trust + asset facts shown directly under the title. */
export function DetailQuickFacts({ facts }: DetailQuickFactsProps) {
  if (facts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {facts.map((fact) => (
        <div
          key={`${fact.label}-${fact.value}`}
          className="border border-white/10 bg-white/[0.03] px-4 py-3 min-w-[140px]"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/45 mb-1">
            {fact.label}
          </p>
          <p className="text-sm font-bold text-white/90">{fact.value}</p>
        </div>
      ))}
    </div>
  );
}
