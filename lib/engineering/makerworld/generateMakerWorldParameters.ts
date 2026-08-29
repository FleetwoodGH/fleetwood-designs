import type { CalculationResult } from "@/lib/engineering/types";

import type {
  MakerWorldParameter,
  MakerWorldParameterGroup,
  MakerWorldParameters,
} from "./types";

const VERTICAL_DIVIDER_PARAMETER_COUNT = 5;
const HORIZONTAL_DIVIDER_PARAMETER_COUNT = 3;

function roundValue(value: number, decimals: number) {
  return Number(value.toFixed(decimals));
}

function createParameter(
  name: string,
  sourceValue: number,
  decimals: number,
  unit?: "mm",
): MakerWorldParameter {
  const value = roundValue(sourceValue, decimals);

  return {
    name,
    value,
    displayValue: value.toFixed(decimals),
    ...(unit ? { unit } : {}),
  };
}

function createDimensionParameter(
  name: string,
  sourceValue: number,
): MakerWorldParameter {
  return createParameter(name, sourceValue, 2, "mm");
}

function createIntegerParameter(
  name: string,
  sourceValue: number,
): MakerWorldParameter {
  return createParameter(name, sourceValue, 0);
}

function createDividerParameters(
  axis: "V" | "H",
  positions: number[],
  toggles: number[],
  parameterCount: number,
): MakerWorldParameter[] {
  return Array.from({ length: parameterCount }, (_, index) => {
    const parameterNumber = index + 1;

    return [
      createParameter(
        `divider${axis}${parameterNumber}`,
        positions[index] ?? 0,
        3,
      ),
      createIntegerParameter(
        `toggle${axis}${parameterNumber}`,
        toggles[index] ?? 0,
      ),
    ];
  }).flat();
}

function createGroup(
  id: MakerWorldParameterGroup["id"],
  title: string,
  parameters: MakerWorldParameter[],
): MakerWorldParameterGroup {
  return { id, title, parameters };
}

/**
 * Maps an engineering result to the editable parameters of the current
 * Tray Storage System model in MakerWorld.
 *
 * This adapter copies already-calculated values and applies MakerWorld display
 * precision only. It intentionally contains no engineering geometry formulas.
 */
export function generateMakerWorldParameters(
  calculationResult: CalculationResult,
): MakerWorldParameters {
  if (!calculationResult.tray || !calculationResult.heights) {
    throw new Error(
      "MakerWorld parameters are available only for a complete Tray Storage System calculation.",
    );
  }

  const verticalPositions = calculationResult.dividers?.verticalPositions ?? [];
  const horizontalPositions =
    calculationResult.dividers?.horizontalPositions ?? [];
  const verticalToggles = calculationResult.dividers?.verticalToggles ?? [];
  const horizontalToggles = calculationResult.dividers?.horizontalToggles ?? [];

  if (
    verticalPositions.length > VERTICAL_DIVIDER_PARAMETER_COUNT ||
    verticalToggles.slice(VERTICAL_DIVIDER_PARAMETER_COUNT).some(Boolean)
  ) {
    throw new Error(
      `The current MakerWorld model supports at most ${VERTICAL_DIVIDER_PARAMETER_COUNT} vertical dividers.`,
    );
  }

  if (
    horizontalPositions.length > HORIZONTAL_DIVIDER_PARAMETER_COUNT ||
    horizontalToggles.slice(HORIZONTAL_DIVIDER_PARAMETER_COUNT).some(Boolean)
  ) {
    throw new Error(
      `The current MakerWorld model supports at most ${HORIZONTAL_DIVIDER_PARAMETER_COUNT} horizontal dividers.`,
    );
  }

  return {
    groups: [
      createGroup("box", "Box", [
        createDimensionParameter(
          "boxWidth",
          calculationResult.box.outsideWidth,
        ),
        createDimensionParameter(
          "boxDepth",
          calculationResult.box.outsideDepth,
        ),
        createDimensionParameter(
          "lidHeight",
          calculationResult.heights.lidHeight,
        ),
      ]),
      createGroup("trays", "Trays", [
        createDimensionParameter(
          "trayHeight",
          calculationResult.heights.trayOutsideHeight,
        ),
        createIntegerParameter("trayNumber", calculationResult.trayNumber),
      ]),
      createGroup(
        "vertical-dividers",
        "Vertical Dividers",
        createDividerParameters(
          "V",
          verticalPositions,
          verticalToggles,
          VERTICAL_DIVIDER_PARAMETER_COUNT,
        ),
      ),
      createGroup(
        "horizontal-dividers",
        "Horizontal Dividers",
        createDividerParameters(
          "H",
          horizontalPositions,
          horizontalToggles,
          HORIZONTAL_DIVIDER_PARAMETER_COUNT,
        ),
      ),
    ],
    warnings: [...calculationResult.warnings],
  };
}
