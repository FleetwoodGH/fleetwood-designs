import {
  calculateBoxInsideDepth,
  calculateBoxInsideWidth,
  calculateBoxOutsideDepth,
  calculateBoxOutsideWidth,
} from "@/lib/engineering/calculations/box";

import {
  calculateCompartmentDimensions,
  calculateEqualDividerConfiguration,
  calculateTrayUsableDepthFromCompartment,
  calculateTrayUsableWidthFromCompartment,
} from "@/lib/engineering/calculations/divider";

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

import { validateCalculationInput } from "@/lib/engineering/calculations/validation";

import type {
  CalculationInput,
  CalculationResult,
  CompartmentDimensions,
} from "@/lib/engineering/types";

const CALCULATION_PRECISION = 3;

function roundDimension(value: number) {
  return Number(value.toFixed(CALCULATION_PRECISION));
}

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

  const warnings = ["Height calculations are not yet implemented."];

  const boxInsideWidth = calculateBoxInsideWidth(input.width);
  const boxInsideDepth = calculateBoxInsideDepth(input.depth);

  if (boxInsideWidth <= 0 || boxInsideDepth <= 0) {
    throw new Error(
      "The outside dimensions are too small for the configured box construction.",
    );
  }

  if (input.buildType === "box") {
    return {
      strategy: input.strategy,

      box: {
        outsideWidth: roundDimension(input.width),
        outsideDepth: roundDimension(input.depth),
        outsideHeight: roundDimension(input.height),

        insideWidth: boxInsideWidth,
        insideDepth: boxInsideDepth,
        insideHeight: null,
      },

      tray: null,
      compartment: null,
      dividers: null,

      trayNumber: 0,
      rows: null,
      columns: null,

      warnings,
    };
  }

  const trayOutsideWidth = calculateTrayOutsideWidth(boxInsideWidth);
  const trayOutsideDepth = calculateTrayOutsideDepth(boxInsideDepth);

  const trayUsableWidth = calculateTrayUsableWidth(trayOutsideWidth);
  const trayUsableDepth = calculateTrayUsableDepth(trayOutsideDepth);

  const tray = createTrayDimensions(
    trayOutsideWidth,
    trayOutsideDepth,
    trayUsableWidth,
    trayUsableDepth,
  );

  const equalGridSelected =
    input.trayType === "dividers" && input.dividerLayout === "equal";

  const compartment = equalGridSelected
    ? calculateCompartmentDimensions(
        trayUsableWidth,
        trayUsableDepth,
        input.rows,
        input.columns,
      )
    : null;

  const dividers = equalGridSelected
    ? calculateEqualDividerConfiguration(
        trayUsableWidth,
        trayUsableDepth,
        input.rows,
        input.columns,
      )
    : null;

  return {
    strategy: input.strategy,

    box: {
      outsideWidth: roundDimension(input.width),
      outsideDepth: roundDimension(input.depth),
      outsideHeight: roundDimension(input.height),

      insideWidth: boxInsideWidth,
      insideDepth: boxInsideDepth,
      insideHeight: null,
    },

    tray,
    compartment,
    dividers,

    trayNumber: input.trayNumber,
    rows: equalGridSelected ? input.rows : null,
    columns: equalGridSelected ? input.columns : null,

    warnings,
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

  const warnings = ["Height calculations are not yet implemented."];

  if (input.buildType === "box") {
    const boxOutsideWidth = calculateBoxOutsideWidth(input.width);
    const boxOutsideDepth = calculateBoxOutsideDepth(input.depth);

    return {
      strategy: input.strategy,

      box: {
        outsideWidth: boxOutsideWidth,
        outsideDepth: boxOutsideDepth,
        outsideHeight: roundDimension(input.height),

        insideWidth: roundDimension(input.width),
        insideDepth: roundDimension(input.depth),
        insideHeight: null,
      },

      tray: null,
      compartment: null,
      dividers: null,

      trayNumber: 0,
      rows: null,
      columns: null,

      warnings,
    };
  }

  const equalGridSelected =
    input.trayType === "dividers" && input.dividerLayout === "equal";

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
      height: null,
    };
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

  const tray = createTrayDimensions(
    trayOutsideWidth,
    trayOutsideDepth,
    trayUsableWidth,
    trayUsableDepth,
  );

  const dividers = equalGridSelected
    ? calculateEqualDividerConfiguration(
        trayUsableWidth,
        trayUsableDepth,
        input.rows,
        input.columns,
      )
    : null;

  return {
    strategy: input.strategy,

    box: {
      outsideWidth: boxOutsideWidth,
      outsideDepth: boxOutsideDepth,
      outsideHeight: roundDimension(input.height),

      insideWidth: boxInsideWidth,
      insideDepth: boxInsideDepth,
      insideHeight: null,
    },

    tray,
    compartment,
    dividers,

    trayNumber: input.trayNumber,
    rows: equalGridSelected ? input.rows : null,
    columns: equalGridSelected ? input.columns : null,

    warnings,
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
export * from "./tray";
export * from "./validation";
