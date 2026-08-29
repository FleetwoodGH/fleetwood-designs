import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";
import {
  calculateMinimumSystemOutsideHeight,
  calculateTrayOutsideHeightFromSystemHeight,
  calculateTrayOutsideHeightValidityBoundary,
} from "@/lib/engineering/calculations/height";

import type { CalculationInput } from "@/lib/engineering/types";

function requirePositiveValue(value: number, parameterName: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${parameterName} must be greater than zero.`);
  }
}

function requirePositiveInteger(value: number, parameterName: string) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${parameterName} must be a positive whole number.`);
  }
}

export function validateBoxOutsideDesignLimits(
  boxOutsideWidth: number,
  boxOutsideDepth: number,
) {
  if (boxOutsideWidth < ENGINEERING_LIMITS.design.boxWidth.minimum) {
    throw new Error(
      `Box outside width must be at least ${ENGINEERING_LIMITS.design.boxWidth.minimum} mm ` +
        "to remain within the supported Fusion design limits.",
    );
  }

  if (boxOutsideDepth < ENGINEERING_LIMITS.design.boxDepth.minimum) {
    throw new Error(
      `Box outside depth must be at least ${ENGINEERING_LIMITS.design.boxDepth.minimum} mm ` +
        "to remain within the supported Fusion design limits.",
    );
  }
}

export function validateTrayOutsideHeightDesignLimit(
  trayOutsideHeight: number,
) {
  if (trayOutsideHeight < ENGINEERING_LIMITS.design.trayOutsideHeight.minimum) {
    throw new Error(
      `Tray outside height must be at least ${ENGINEERING_LIMITS.design.trayOutsideHeight.minimum} mm ` +
        "to remain within the supported Fusion design limits.",
    );
  }
}

export function validateCalculationInput(input: CalculationInput) {
  requirePositiveValue(input.width, "Width");
  requirePositiveValue(input.depth, "Depth");

  if (input.strategy === "outside-led") {
    validateBoxOutsideDesignLimits(input.width, input.depth);
  }

  if (input.buildType === "box") {
    requirePositiveValue(input.boxHeight, "Box height");
    return;
  }

  if (input.strategy === "outside-led") {
    requirePositiveValue(
      input.heights.systemOutsideHeight,
      "System outside height",
    );

    const minimumSystemHeight = calculateMinimumSystemOutsideHeight(
      input.trayNumber,
    );
    if (input.heights.systemOutsideHeight < minimumSystemHeight) {
      throw new Error(
        `System outside height must be at least ${minimumSystemHeight} mm for ${input.trayNumber} trays.`,
      );
    }

    const trayOutsideHeight = calculateTrayOutsideHeightFromSystemHeight(
      input.heights.systemOutsideHeight,
      input.trayNumber,
    );

    const minimumOutsideHeight = calculateTrayOutsideHeightValidityBoundary(
      input.trayType,
    );

    if (trayOutsideHeight <= minimumOutsideHeight) {
      throw new Error(
        `Tray outside height must be greater than ${minimumOutsideHeight} mm.`,
      );
    }

    validateTrayOutsideHeightDesignLimit(trayOutsideHeight);
  } else {
    requirePositiveValue(input.heights.usableTrayHeight, "Usable tray height");
  }

  requirePositiveInteger(input.rows, "Rows");
  requirePositiveInteger(input.columns, "Columns");

  if (
    input.rows < ENGINEERING_LIMITS.grid.minimumRows ||
    input.rows > ENGINEERING_LIMITS.grid.maximumRows
  ) {
    throw new Error(
      `Rows must be between ${ENGINEERING_LIMITS.grid.minimumRows} and ${ENGINEERING_LIMITS.grid.maximumRows}.`,
    );
  }

  if (
    input.columns < ENGINEERING_LIMITS.grid.minimumColumns ||
    input.columns > ENGINEERING_LIMITS.grid.maximumColumns
  ) {
    throw new Error(
      `Columns must be between ${ENGINEERING_LIMITS.grid.minimumColumns} and ${ENGINEERING_LIMITS.grid.maximumColumns}.`,
    );
  }

  requirePositiveInteger(input.trayNumber, "Tray number");

  if (
    input.trayNumber < ENGINEERING_LIMITS.trays.minimum ||
    input.trayNumber > ENGINEERING_LIMITS.trays.maximum
  ) {
    throw new Error(
      `Tray number must be between ${ENGINEERING_LIMITS.trays.minimum} and ${ENGINEERING_LIMITS.trays.maximum}.`,
    );
  }

  if (input.trayType === "dividers" && !input.dividerLayout) {
    throw new Error("Divider layout is required for trays with dividers.");
  }

  if (input.trayType === "dividers" && input.dividerLayout === "custom") {
    if (!input.customLayout) {
      throw new Error("Custom layout dimensions are required.");
    }

    if (input.strategy === "outside-led") {
      validateDistribution(
        input.customLayout.columnPercentages,
        input.columns,
        "Column",
      );
      validateDistribution(
        input.customLayout.rowPercentages,
        input.rows,
        "Row",
      );
    } else {
      validatePositiveSegments(
        input.customLayout.usableColumnWidths,
        input.columns,
        "Column width",
      );
      validatePositiveSegments(
        input.customLayout.usableRowDepths,
        input.rows,
        "Row depth",
      );
    }
  }
}

function validateDistribution(values: number[], count: number, name: string) {
  validatePositiveSegments(values, count, `${name} percentage`);
  const total = Number(
    values.reduce((sum, value) => sum + value, 0).toFixed(3),
  );
  if (total !== 100) {
    throw new Error(`${name} percentages must total 100%.`);
  }
}

function validatePositiveSegments(
  values: number[],
  count: number,
  name: string,
) {
  if (values.length !== count) {
    throw new Error(`${name} must contain ${count} values.`);
  }
  values.forEach((value) => requirePositiveValue(value, name));
}
