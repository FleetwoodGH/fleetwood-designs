import CalculationPreview from "@/components/CalculationPreview";

import type { CalculationState } from "@/components/storage-design-assistant/types";

type CalculationSectionProps = {
  calculationState: CalculationState;
};

export default function CalculationSection({
  calculationState,
}: CalculationSectionProps) {
  return (
    <>
      {calculationState.result && (
        <CalculationPreview result={calculationState.result} />
      )}

      {calculationState.error && (
        <section
          className="rounded-xl border border-red-200 bg-red-50 p-6"
          role="alert"
        >
          <h2 className="text-lg font-semibold text-red-950">
            Calculation could not be completed
          </h2>

          <p className="mt-2 leading-7 text-red-800">
            {calculationState.error}
          </p>
        </section>
      )}
    </>
  );
}
