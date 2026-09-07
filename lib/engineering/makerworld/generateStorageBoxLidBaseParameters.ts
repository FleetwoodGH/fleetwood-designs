import type { StorageBoxLidBaseCalculationResult } from "@/lib/engineering/calculations/storageBoxLidBase";
import type { MakerWorldParameters } from "@/lib/engineering/makerworld/types";

export function generateStorageBoxLidBaseParameters(
  result: StorageBoxLidBaseCalculationResult,
): MakerWorldParameters {
  return {
    groups: [
      {
        id: "box",
        title: "Box",
        parameters: Object.entries(result.makerWorldInputs).map(
          ([name, sourceValue]) => {
            const value = Number(sourceValue.toFixed(2));

            return {
              name,
              value,
              displayValue: value.toFixed(2),
              unit: "mm" as const,
            };
          },
        ),
      },
    ],
    warnings: [],
  };
}
