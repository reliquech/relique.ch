import type { DetailSpecRow } from "@/lib/utils/marketplaceDetail";

interface DetailSpecGridProps {
  rows: DetailSpecRow[];
}

/** Two-column spec list for marketplace detail sections. */
export function DetailSpecGrid({ rows }: DetailSpecGridProps) {
  if (rows.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
      {rows.map((row) => (
        <div key={`${row.label}-${row.value}`}>
          <dt className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50 mb-2">
            {row.label}
          </dt>
          <dd className="text-sm font-semibold text-white/90 leading-relaxed">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
