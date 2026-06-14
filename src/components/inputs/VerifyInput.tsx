"use client";

interface VerifyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

/**
 * Verify input form component
 * Reusable input for product ID verification
 */
export function VerifyInput({ value, onChange, onSubmit, loading }: VerifyInputProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="ENTER PRODUCT ID (RLQ-XXXX-XXXX)"
          className="flex-grow bg-cardDark border border-white/10 p-5 text-sm font-black uppercase tracking-widest focus:border-highlightIce outline-none text-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="bg-primaryBlue px-8 font-black uppercase text-xs tracking-widest hover:bg-accentBlue transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          {loading ? "..." : "Verify"}
        </button>
      </div>
      <p className="text-[10px] text-textSec italic">
        Enter your product ID or certificate code
      </p>
    </form>
  );
}
