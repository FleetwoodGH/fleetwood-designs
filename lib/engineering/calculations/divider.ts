import {
  ENGINEERING_CONSTANTS,
  ENGINEERING_LIMITS,
} from "@/lib/engineering/engineeringConstants";
import {
  roundDimension,
  roundDividerPosition,
} from "@/lib/engineering/calculations/numeric";

import type {
  CompartmentDimensions,
  DividerConfiguration,
} from "@/lib/engineering/types";

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
function calculateDividerConfigurationFromSegments(
  segmentLengths: number[],
  usableLength: number,
) {
  if (segmentLengths.length <= 1) {
    return { centrePositions: [], normalizedPositions: [] };
  }

  const dividerThickness = ENGINEERING_CONSTANTS.divider.thickness;
  let precedingLength = 0;
  const rawCentrePositions = segmentLengths
    .slice(0, -1)
    .map((length, index) => {
      precedingLength += length;
      return precedingLength + index * dividerThickness + dividerThickness / 2;
    });

  return {
    centrePositions: rawCentrePositions.map(roundDimension),
    normalizedPositions: rawCentrePositions.map((position) =>
      roundDividerPosition(position / usableLength),
    ),
  };
}

function calculateEqualDividerPositions(
  usableLength: number,
  compartmentCount: number,
) {
  if (compartmentCount <= 1) {
    return { centrePositions: [], normalizedPositions: [] };
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

  return calculateDividerConfigurationFromSegments(
    Array.from({ length: compartmentCount }, () => compartmentLength),
    usableLength,
  );
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

  const vertical = calculateEqualDividerPositions(trayUsableWidth, columns);

  const horizontal = calculateEqualDividerPositions(trayUsableDepth, rows);

  return {
    verticalCentrePositions: vertical.centrePositions,
    horizontalCentrePositions: horizontal.centrePositions,
    verticalPositions: vertical.normalizedPositions,
    horizontalPositions: horizontal.normalizedPositions,

    verticalToggles: createDividerToggles(
      vertical.normalizedPositions.length,
      maximumVerticalDividers,
    ),

    horizontalToggles: createDividerToggles(
      horizontal.normalizedPositions.length,
      maximumHorizontalDividers,
    ),
  };
}

function validateSegments(
  segments: number[],
  expectedCount: number,
  name: string,
) {
  if (segments.length !== expectedCount) {
    throw new Error(`${name} must contain ${expectedCount} values.`);
  }

  if (segments.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error(`${name} values must all be greater than zero.`);
  }
}

export function calculateUsableSegmentsFromPercentages(
  usableLength: number,
  percentages: number[],
) {
  validateSegments(percentages, percentages.length, "Distribution percentage");

  const total = roundDimension(
    percentages.reduce((sum, value) => sum + value, 0),
  );
  if (total !== 100) {
    throw new Error("Distribution percentages must total 100%.");
  }

  const availableSegmentLength =
    usableLength -
    (percentages.length - 1) * ENGINEERING_CONSTANTS.divider.thickness;
  if (availableSegmentLength <= 0) {
    throw new Error(
      "The usable dimension is too small for the requested dividers.",
    );
  }

  const segments = percentages.map((percentage) =>
    roundDimension((availableSegmentLength * percentage) / 100),
  );
  const precedingTotal = segments
    .slice(0, -1)
    .reduce((sum, value) => sum + value, 0);
  segments[segments.length - 1] = roundDimension(
    availableSegmentLength - precedingTotal,
  );
  return segments;
}

export function calculateTrayUsableLengthFromSegments(segments: number[]) {
  validateSegments(segments, segments.length, "Usable segment");
  return roundDimension(
    segments.reduce((sum, value) => sum + value, 0) +
      (segments.length - 1) * ENGINEERING_CONSTANTS.divider.thickness,
  );
}

export function calculateCustomDividerConfiguration(
  usableColumnWidths: number[],
  usableRowDepths: number[],
): DividerConfiguration {
  validateSegments(
    usableColumnWidths,
    usableColumnWidths.length,
    "Column width",
  );
  validateSegments(usableRowDepths, usableRowDepths.length, "Row depth");

  const usableWidth = calculateTrayUsableLengthFromSegments(usableColumnWidths);
  const usableDepth = calculateTrayUsableLengthFromSegments(usableRowDepths);
  const vertical = calculateDividerConfigurationFromSegments(
    usableColumnWidths,
    usableWidth,
  );
  const horizontal = calculateDividerConfigurationFromSegments(
    usableRowDepths,
    usableDepth,
  );

  return {
    verticalCentrePositions: vertical.centrePositions,
    horizontalCentrePositions: horizontal.centrePositions,
    verticalPositions: vertical.normalizedPositions,
    horizontalPositions: horizontal.normalizedPositions,
    verticalToggles: createDividerToggles(
      vertical.normalizedPositions.length,
      ENGINEERING_LIMITS.grid.maximumColumns - 1,
    ),
    horizontalToggles: createDividerToggles(
      horizontal.normalizedPositions.length,
      ENGINEERING_LIMITS.grid.maximumRows - 1,
    ),
  };
}
