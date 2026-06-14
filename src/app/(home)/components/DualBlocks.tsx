import { VerificationBlock } from "./dual-blocks/VerificationBlock";
import { ConsignmentBlock } from "./dual-blocks/ConsignmentBlock";

/**
 * Dual blocks section - showcases verification and consignment services
 * Refactored from 118 lines to use composable components
 */
export function DualBlocks() {
  return (
    <section className="flex flex-col md:flex-row min-h-[400px] sm:min-h-[500px] md:min-h-[600px] overflow-hidden" style={{
      minHeight: "80dvh",
      height: "90dvh",
    }}>
      <VerificationBlock />
      <ConsignmentBlock />
    </section>
  );
}
