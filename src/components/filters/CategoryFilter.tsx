import { CATEGORY_OPTIONS } from "@/lib/utils/marketplace";

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Reusable category filter dropdown
 * Can be used in marketplace listing, search pages, etc.
 */
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-cardDark border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest focus:border-highlightIce outline-none text-white"
    >
      {CATEGORY_OPTIONS.map((category) => (
        <option key={category}>{category}</option>
      ))}
    </select>
  );
}
