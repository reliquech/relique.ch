import { STATUS_DEFINITIONS } from "@/lib/utils/verify";

/**
 * Status definitions list component
 * Displays all verification status definitions
 */
export function StatusDefinitionsList() {
  return (
    <div className="mt-16 space-y-8">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-highlightIce">
        Status Definitions
      </h3>
      <div className="space-y-6">
        {STATUS_DEFINITIONS.map((definition) => (
          <div key={definition.title} className="flex gap-4">
            <span className={`${definition.color} font-bold`}>{definition.icon}</span>
            <p className="text-xs text-textSec leading-relaxed">
              <span className="text-white font-bold">{definition.title}:</span>{" "}
              {definition.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
