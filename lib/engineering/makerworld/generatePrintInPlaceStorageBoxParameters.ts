import type { PrintInPlaceStorageBoxCalculationResult } from "@/lib/engineering/calculations/printInPlaceStorageBox";
import type { MakerWorldParameters } from "@/lib/engineering/makerworld/types";

const PARAMETER_ORDER = ["boxWidth", "boxDepth", "boxHeight"] as const;

export function generatePrintInPlaceStorageBoxParameters(
  result: PrintInPlaceStorageBoxCalculationResult,
): MakerWorldParameters {
  return {
    groups: [
      {
        id: "box",
        title: "Box",
        parameters: PARAMETER_ORDER.map((name) => {
          const value = Number(result.makerWorldInputs[name].toFixed(2));

          return {
            name,
            value,
            displayValue: value.toFixed(2),
            unit: "mm" as const,
          };
        }),
      },
    ],
    warnings: [],
  };
}
