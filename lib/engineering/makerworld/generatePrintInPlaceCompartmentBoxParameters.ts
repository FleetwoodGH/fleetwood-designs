import type { PrintInPlaceCompartmentBoxCalculationResult } from "@/lib/engineering/calculations/printInPlaceCompartmentBox";
import type {
  MakerWorldParameter,
  MakerWorldParameters,
} from "@/lib/engineering/makerworld/types";

export const PRINT_IN_PLACE_COMPARTMENT_BOX_PARAMETER_ORDER = [
  "boxWidth",
  "boxHeight",
  "boxDepth",
  "separatorV1",
  "separatorV2",
  "separatorV3",
  "separatorV4",
  "separatorV5",
  "separatorV1_position",
  "separatorV2_position",
  "separatorV3_position",
  "separatorV4_position",
  "separatorV5_position",
  "separatorH1",
  "separatorH2",
  "separatorH3",
  "separatorH1_position",
  "separatorH2_position",
  "separatorH3_position",
  "LIDseparatorV1",
  "LIDseparatorV2",
  "LIDseparatorV3",
  "LIDseparatorV4",
  "LIDseparatorV5",
  "LIDseparatorV1_position",
  "LIDseparatorV2_position",
  "LIDseparatorV3_position",
  "LIDseparatorV4_position",
  "LIDseparatorV5_position",
  "LIDseparatorH1",
  "LIDseparatorH2",
  "LIDseparatorH3",
  "LIDseparatorH1_position",
  "LIDseparatorH2_position",
  "LIDseparatorH3_position",
  "separatorV6",
  "separatorV6_position",
  "LIDseparatorV6",
  "LIDseparatorV6_position",
  "separatorH4",
  "separatorH4_position",
  "LIDseparatorH4",
  "LIDseparatorH4_position",
] as const;

function parameter(
  name: string,
  sourceValue: number,
  decimals: number,
  unit?: "mm",
): MakerWorldParameter {
  const value = Number(sourceValue.toFixed(decimals));
  return {
    name,
    value,
    displayValue: value.toFixed(decimals),
    ...(unit ? { unit } : {}),
  };
}

export function generatePrintInPlaceCompartmentBoxParameters(
  result: PrintInPlaceCompartmentBoxCalculationResult,
): MakerWorldParameters {
  const values = new Map<string, MakerWorldParameter>([
    ["boxWidth", parameter("boxWidth", result.makerWorldInputs.boxWidth, 2, "mm")],
    ["boxHeight", parameter("boxHeight", result.makerWorldInputs.boxHeight, 2, "mm")],
    ["boxDepth", parameter("boxDepth", result.makerWorldInputs.boxDepth, 2, "mm")],
  ]);

  for (const [prefix, layout] of [
    ["", result.baseLayout],
    ["LID", result.lidLayout],
  ] as const) {
    for (const [axis, positions, toggles, count] of [
      ["V", layout.dividers.verticalPositions, layout.dividers.verticalToggles, 6],
      ["H", layout.dividers.horizontalPositions, layout.dividers.horizontalToggles, 4],
    ] as const) {
      if (
        positions.length > count ||
        toggles.length > count ||
        toggles.slice(count).some(Boolean)
      ) {
        throw new Error(
          `The compartment box model supports at most ${count} ${axis === "V" ? "vertical" : "horizontal"} separators per half.`,
        );
      }

      for (let index = 0; index < count; index += 1) {
        const number = index + 1;
        const toggleName = `${prefix}separator${axis}${number}`;
        const positionName = `${toggleName}_position`;
        values.set(
          toggleName,
          parameter(toggleName, toggles[index] ?? 0, 0),
        );
        values.set(
          positionName,
          parameter(positionName, positions[index] ?? 0, 3),
        );
      }
    }
  }

  return {
    groups: [
      {
        id: "box",
        title: "Box and separators",
        parameters: PRINT_IN_PLACE_COMPARTMENT_BOX_PARAMETER_ORDER.map(
          (name) => {
            const mapped = values.get(name);
            if (!mapped) throw new Error(`Missing MakerWorld parameter: ${name}.`);
            return mapped;
          },
        ),
      },
    ],
    warnings: [],
  };
}
