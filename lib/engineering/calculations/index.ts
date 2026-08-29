import {
  calculateBoxInsideDepth,
  calculateBoxInsideWidth,
  calculateBoxOutsideDepth,
  calculateBoxOutsideWidth,
} from "@/lib/engineering/calculations/box";

import {
  calculateCompartmentDimensions,
  calculateCustomDividerConfiguration,
  calculateEqualDividerConfiguration,
  calculateTrayUsableLengthFromSegments,
  calculateTrayUsableDepthFromCompartment,
  calculateTrayUsableWidthFromCompartment,
  calculateUsableSegmentsFromPercentages,
} from "@/lib/engineering/calculations/divider";

import { calculateStorageSystemHeights } from "@/lib/engineering/calculations/height";
import { roundDimension } from "@/lib/engineering/calculations/numeric";

import {
  calculateBoxInsideDepthFromTray,
  calculateBoxInsideWidthFromTray,
  calculateTrayOutsideDepth,
  calculateTrayOutsideDepthFromUsableDepth,
  calculateTrayOutsideWidth,
  calculateTrayOutsideWidthFromUsableWidth,
  calculateTrayUsableDepth,
  calculateTrayUsableWidth,
  createTrayDimensions,
} from "@/lib/engineering/calculations/tray";

import {
  validateBoxOutsideDesignLimits,
  validateCalculationInput,
  validateTrayOutsideHeightDesignLimit,
} from "@/lib/engineering/calculations/validation";

import type {
  CalculationInput,
  CalculationResult,
  CompartmentDimensions,
} from "@/lib/engineering/types";

/* -------------------------------------------------------------------------- */
/* Outside-led calculation                                                    */
/* -------------------------------------------------------------------------- */

export function calculateOutsideLed(
  input: CalculationInput,
): CalculationResult {
  validateCalculationInput(input);

  if (input.strategy !== "outside-led") {
    throw new Error(
      "calculateOutsideLed only accepts outside-led calculation input.",
    );
  }

  const boxInsideWidth = calculateBoxInsideWidth(input.width);
  const boxInsideDepth = calculateBoxInsideDepth(input.depth);

  if (boxInsideWidth <= 0 || boxInsideDepth <= 0) {
    throw new Error(
      "The outside dimensions are too small for the configured box construction.",
    );
  }

  if (input.buildType === "box") {
    const warnings = [
      "Standalone box inside-height calculations are not yet implemented.",
    ];

    return {
      strategy: input.strategy,

      box: {
        outsideWidth: roundDimension(input.width),
        outsideDepth: roundDimension(input.depth),
        outsideHeight: roundDimension(input.boxHeight),

        insideWidth: boxInsideWidth,
        insideDepth: boxInsideDepth,
        insideHeight: null,
      },

      tray: null,
      compartment: null,
      dividers: null,
      layoutSegments: null,
      heights: null,

      trayNumber: 0,
      rows: null,
      columns: null,

      warnings,
    };
  }

  const heights = calculateStorageSystemHeights(input);

  const trayOutsideWidth = calculateTrayOutsideWidth(boxInsideWidth);
  const trayOutsideDepth = calculateTrayOutsideDepth(boxInsideDepth);

  const trayUsableWidth = calculateTrayUsableWidth(trayOutsideWidth);
  const trayUsableDepth = calculateTrayUsableDepth(trayOutsideDepth);

  const tray = createTrayDimensions(
    trayOutsideWidth,
    trayOutsideDepth,
    heights.trayOutsideHeight,
    trayUsableWidth,
    trayUsableDepth,
    heights.usableTrayHeight,
  );

  const equalGridSelected =
    input.trayType === "dividers" && input.dividerLayout === "equal";
  const customGridSelected =
    input.trayType === "dividers" && input.dividerLayout === "custom";

  const layoutSegments =
    customGridSelected && input.customLayout
      ? {
          usableColumnWidths: calculateUsableSegmentsFromPercentages(
            trayUsableWidth,
            input.customLayout.columnPercentages,
          ),
          usableRowDepths: calculateUsableSegmentsFromPercentages(
            trayUsableDepth,
            input.customLayout.rowPercentages,
          ),
        }
      : null;

  const compartment = equalGridSelected
    ? {
        ...calculateCompartmentDimensions(
          trayUsableWidth,
          trayUsableDepth,
          input.rows,
          input.columns,
        ),
        height: heights.usableTrayHeight,
      }
    : null;

  const dividers = equalGridSelected
    ? calculateEqualDividerConfiguration(
        trayUsableWidth,
        trayUsableDepth,
        input.rows,
        input.columns,
      )
    : layoutSegments
      ? calculateCustomDividerConfiguration(
          layoutSegments.usableColumnWidths,
          layoutSegments.usableRowDepths,
        )
      : null;

  return {
    strategy: input.strategy,

    box: {
      outsideWidth: roundDimension(input.width),
      outsideDepth: roundDimension(input.depth),
      outsideHeight: heights.closedOutsideHeight,

      insideWidth: boxInsideWidth,
      insideDepth: boxInsideDepth,
      insideHeight: null,
    },

    tray,
    compartment,
    dividers,
    layoutSegments,
    heights,

    trayNumber: input.trayNumber,
    rows: equalGridSelected || customGridSelected ? input.rows : null,
    columns: equalGridSelected || customGridSelected ? input.columns : null,

    warnings: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Usable-space-led calculation                                               */
/* -------------------------------------------------------------------------- */

export function calculateUsableSpaceLed(
  input: CalculationInput,
): CalculationResult {
  validateCalculationInput(input);

  if (input.strategy !== "usable-space-led") {
    throw new Error(
      "calculateUsableSpaceLed only accepts usable-space-led calculation input.",
    );
  }

  if (input.buildType === "box") {
    const warnings = [
      "Standalone box inside-height calculations are not yet implemented.",
    ];
    const boxOutsideWidth = calculateBoxOutsideWidth(input.width);
    const boxOutsideDepth = calculateBoxOutsideDepth(input.depth);

    validateBoxOutsideDesignLimits(boxOutsideWidth, boxOutsideDepth);

    return {
      strategy: input.strategy,

      box: {
        outsideWidth: boxOutsideWidth,
        outsideDepth: boxOutsideDepth,
        outsideHeight: roundDimension(input.boxHeight),

        insideWidth: roundDimension(input.width),
        insideDepth: roundDimension(input.depth),
        insideHeight: null,
      },

      tray: null,
      compartment: null,
      dividers: null,
      layoutSegments: null,
      heights: null,

      trayNumber: 0,
      rows: null,
      columns: null,

      warnings,
    };
  }

  const heights = calculateStorageSystemHeights(input);

  validateTrayOutsideHeightDesignLimit(heights.trayOutsideHeight);

  const equalGridSelected =
    input.trayType === "dividers" && input.dividerLayout === "equal";
  const customGridSelected =
    input.trayType === "dividers" && input.dividerLayout === "custom";

  const layoutSegments =
    customGridSelected && input.customLayout
      ? {
          usableColumnWidths:
            input.customLayout.usableColumnWidths.map(roundDimension),
          usableRowDepths:
            input.customLayout.usableRowDepths.map(roundDimension),
        }
      : null;

  let trayUsableWidth: number;
  let trayUsableDepth: number;
  let compartment: CompartmentDimensions | null;

  if (equalGridSelected) {
    trayUsableWidth = calculateTrayUsableWidthFromCompartment(
      input.width,
      input.columns,
    );

    trayUsableDepth = calculateTrayUsableDepthFromCompartment(
      input.depth,
      input.rows,
    );

    compartment = {
      width: roundDimension(input.width),
      depth: roundDimension(input.depth),
      height: heights.usableTrayHeight,
    };
  } else if (layoutSegments) {
    trayUsableWidth = calculateTrayUsableLengthFromSegments(
      layoutSegments.usableColumnWidths,
    );
    trayUsableDepth = calculateTrayUsableLengthFromSegments(
      layoutSegments.usableRowDepths,
    );
    compartment = null;
  } else {
    trayUsableWidth = roundDimension(input.width);
    trayUsableDepth = roundDimension(input.depth);
    compartment = null;
  }

  const trayOutsideWidth =
    calculateTrayOutsideWidthFromUsableWidth(trayUsableWidth);

  const trayOutsideDepth =
    calculateTrayOutsideDepthFromUsableDepth(trayUsableDepth);

  const boxInsideWidth = calculateBoxInsideWidthFromTray(trayOutsideWidth);
  const boxInsideDepth = calculateBoxInsideDepthFromTray(trayOutsideDepth);

  const boxOutsideWidth = calculateBoxOutsideWidth(boxInsideWidth);
  const boxOutsideDepth = calculateBoxOutsideDepth(boxInsideDepth);

  validateBoxOutsideDesignLimits(boxOutsideWidth, boxOutsideDepth);

  const tray = createTrayDimensions(
    trayOutsideWidth,
    trayOutsideDepth,
    heights.trayOutsideHeight,
    trayUsableWidth,
    trayUsableDepth,
    heights.usableTrayHeight,
  );

  const dividers = equalGridSelected
    ? calculateEqualDividerConfiguration(
        trayUsableWidth,
        trayUsableDepth,
        input.rows,
        input.columns,
      )
    : layoutSegments
      ? calculateCustomDividerConfiguration(
          layoutSegments.usableColumnWidths,
          layoutSegments.usableRowDepths,
        )
      : null;

  return {
    strategy: input.strategy,

    box: {
      outsideWidth: boxOutsideWidth,
      outsideDepth: boxOutsideDepth,
      outsideHeight: heights.closedOutsideHeight,

      insideWidth: boxInsideWidth,
      insideDepth: boxInsideDepth,
      insideHeight: null,
    },

    tray,
    compartment,
    dividers,
    layoutSegments,
    heights,

    trayNumber: input.trayNumber,
    rows: equalGridSelected || customGridSelected ? input.rows : null,
    columns: equalGridSelected || customGridSelected ? input.columns : null,

    warnings: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Public calculation entry point                                             */
/* -------------------------------------------------------------------------- */

export function calculateStorageDesign(
  input: CalculationInput,
): CalculationResult {
  if (input.strategy === "outside-led") {
    return calculateOutsideLed(input);
  }

  return calculateUsableSpaceLed(input);
}

/* -------------------------------------------------------------------------- */
/* Public engineering exports                                                 */
/* -------------------------------------------------------------------------- */

export * from "./box";
export * from "./divider";
export * from "./height";
export * from "./numeric";
export * from "./tray";
export * from "./validation";
