import {
  ENGINEERING_CONSTANTS,
  ENGINEERING_LIMITS,
} from "@/lib/engineering/engineeringConstants";

import type {
  CompartmentDimensions,
  DividerConfiguration,
} from "@/lib/engineering/types";

const CALCULATION_PRECISION = 3;
const DIVIDER_POSITION_PRECISION = 6;

function roundDimension(value: number) {
  return Number(value.toFixed(CALCULATION_PRECISION));
}

function roundDividerPosition(value: number) {
  return Number(value.toFixed(DIVIDER_POSITION_PRECISION));
}

/* -------------------------------------------------------------------------- */
/* Compartment geometry                                                       */
/* -------------------------------------------------------------------------- */

export function calculateCompartmentDimensions(
  trayUsableWidth: number,
  trayUsableDepth: number,
  rows: number,
  columns: number,
): CompartmentDimensions {
  const dividerThickness = ENGINEERING_CONSTANTS.divider.thickness;

  const totalVerticalDividerThickness = (columns - 1) * dividerThickness;

  const totalHorizontalDividerThickness = (rows - 1) * dividerThickness;

  const width = roundDimension(
    (trayUsableWidth - totalVerticalDividerThickness) / columns,
  );

  const depth = roundDimension(
    (trayUsableDepth - totalHorizontalDividerThickness) / rows,
  );

  if (width <= 0 || depth <= 0) {
    throw new Error(
      "The selected dimensions are too small for the requested grid and divider thickness.",
    );
  }

  return {
    width,
    depth,
    height: null,
  };
}

export function calculateTrayUsableWidthFromCompartment(
  compartmentWidth: number,
  columns: number,
) {
  return roundDimension(
    columns * compartmentWidth +
      (columns - 1) * ENGINEERING_CONSTANTS.divider.thickness,
  );
}

export function calculateTrayUsableDepthFromCompartment(
  compartmentDepth: number,
  rows: number,
) {
  return roundDimension(
    rows * compartmentDepth +
      (rows - 1) * ENGINEERING_CONSTANTS.divider.thickness,
  );
}

/* -------------------------------------------------------------------------- */
/* Divider positions                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Calculates normalised divider centre positions between 0 and 1.
 *
 * The available clear space is divided into equal compartments.
 * Divider thickness is inserted between those compartments.
 */
function calculateEqualDividerPositions(
  usableLength: number,
  compartmentCount: number,
) {
  if (compartmentCount <= 1) {
    return [];
  }

  const dividerThickness = ENGINEERING_CONSTANTS.divider.thickness;

  const dividerCount = compartmentCount - 1;

  const availableCompartmentLength =
    usableLength - dividerCount * dividerThickness;

  const compartmentLength = availableCompartmentLength / compartmentCount;

  if (compartmentLength <= 0) {
    throw new Error(
      "The usable dimension is too small for the requested number of compartments.",
    );
  }

  return Array.from({ length: dividerCount }, (_, index) => {
    const dividerNumber = index + 1;

    const dividerCentrePosition =
      dividerNumber * compartmentLength +
      (dividerNumber - 0.5) * dividerThickness;

    return roundDividerPosition(dividerCentrePosition / usableLength);
  });
}

function createDividerToggles(
  activeDividerCount: number,
  maximumDividerCount: number,
) {
  return Array.from({ length: maximumDividerCount }, (_, index) =>
    index < activeDividerCount ? 1 : 0,
  );
}

export function calculateEqualDividerConfiguration(
  trayUsableWidth: number,
  trayUsableDepth: number,
  rows: number,
  columns: number,
): DividerConfiguration {
  const maximumVerticalDividers = ENGINEERING_LIMITS.grid.maximumColumns - 1;

  const maximumHorizontalDividers = ENGINEERING_LIMITS.grid.maximumRows - 1;

  const verticalPositions = calculateEqualDividerPositions(
    trayUsableWidth,
    columns,
  );

  const horizontalPositions = calculateEqualDividerPositions(
    trayUsableDepth,
    rows,
  );

  return {
    verticalPositions,
    horizontalPositions,

    verticalToggles: createDividerToggles(
      verticalPositions.length,
      maximumVerticalDividers,
    ),

    horizontalToggles: createDividerToggles(
      horizontalPositions.length,
      maximumHorizontalDividers,
    ),
  };
}
