import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";

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

export function validateCalculationInput(input: CalculationInput) {
  requirePositiveValue(input.width, "Width");
  requirePositiveValue(input.depth, "Depth");

  if (input.buildType === "box") {
    requirePositiveValue(input.boxHeight, "Box height");
    return;
  }

  if (input.strategy === "outside-led") {
    requirePositiveValue(
      input.heights.trayOutsideHeight,
      "Tray outside height",
    );

    if (
      input.heights.trayOutsideHeight <=
      ENGINEERING_LIMITS.trayHeight.minimumOutsideExclusive
    ) {
      throw new Error(
        `Tray outside height must be greater than ${ENGINEERING_LIMITS.trayHeight.minimumOutsideExclusive} mm ` +
          "to provide positive usable height after the tray bottom and lid assembly.",
      );
    }
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
}
