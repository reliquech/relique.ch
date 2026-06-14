import { SORT_OPTIONS } from "@/lib/utils/marketplace";

interface SortFilterProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Reusable sort filter dropdown
 * Can be used in marketplace listing, search pages, etc.
 */
export function SortFilter({ value, onChange }: SortFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-cardDark border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest focus:border-highlightIce outline-none text-white"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.label}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
