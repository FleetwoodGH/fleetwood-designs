import {
  calculateCompartmentDimensions,
  calculateCustomDividerConfiguration,
  calculateEqualDividerConfiguration,
  calculateTrayUsableLengthFromSegments,
  calculateUsableSegmentsFromPercentages,
} from "@/lib/engineering/calculations/divider";
import { roundDimension } from "@/lib/engineering/calculations/numeric";
import {
  ENGINEERING_CONSTANTS,
  ENGINEERING_LIMITS,
  PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS,
} from "@/lib/engineering/engineeringConstants";
import type {
  DimensionStrategy,
  DividerConfiguration,
} from "@/lib/engineering/types";

type EqualLayoutBase = {
  method: "equal";
  rows: number;
  columns: number;
};

type CustomLayoutBase = {
  method: "custom";
  rows: number;
  columns: number;
};

export type OutsideLedHalfLayoutInput =
  | EqualLayoutBase
  | (CustomLayoutBase & {
      columnPercentages: number[];
      rowPercentages: number[];
    });

export type UsableLedHalfLayoutInput =
  | (EqualLayoutBase & {
      requiredCompartmentWidth: number;
      requiredCompartmentDepth: number;
    })
  | (CustomLayoutBase & {
      requiredColumnWidths: number[];
      requiredRowDepths: number[];
    });

export type CompartmentBoxHalfLayoutInput =
  | OutsideLedHalfLayoutInput
  | UsableLedHalfLayoutInput;

type LidLayoutInput<TLayout> =
  | { mode: "same-as-base" }
  | { mode: "separate"; layout: TLayout };

export type PrintInPlaceCompartmentBoxCalculationInput =
  | {
      strategy: "outside-led";
      dimensions: { width: number; depth: number; height: number };
      baseLayout: OutsideLedHalfLayoutInput;
      lidLayout: LidLayoutInput<OutsideLedHalfLayoutInput>;
    }
  | {
      strategy: "usable-space-led";
      requiredHeights: { base: number; lid: number };
      baseLayout: UsableLedHalfLayoutInput;
      lidLayout: LidLayoutInput<UsableLedHalfLayoutInput>;
    };

export type CompartmentBoxHalfLayoutResult = {
  method: "equal" | "custom";
  rows: number;
  columns: number;
  usableColumnWidths: number[];
  usableRowDepths: number[];
  dividers: DividerConfiguration;
};

export type PrintInPlaceCompartmentBoxCalculationResult = {
  strategy: DimensionStrategy;
  outside: { width: number; depth: number; height: number };
  usable: {
    width: number;
    depth: number;
    baseHeight: number;
    lidHeight: number;
  };
  requestedUsableHeights: { base: number; lid: number } | null;
  baseLayout: CompartmentBoxHalfLayoutResult;
  lidLayout: CompartmentBoxHalfLayoutResult;
  lidUsesBaseLayout: boolean;
  makerWorldInputs: {
    boxWidth: number;
    boxHeight: number;
    boxDepth: number;
  };
};

const limits = ENGINEERING_LIMITS.printInPlaceStorageBoxCompartments;
const constants = PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS;

function assertWithinLimits(
  value: number,
  limit: { minimum: number; maximum: number },
  label: string,
) {
  if (!Number.isFinite(value)) throw new Error(`${label} must be a number.`);
  if (value < limit.minimum) {
    throw new Error(`Minimum supported ${label.toLowerCase()} is ${limit.minimum} mm.`);
  }
  if (value > limit.maximum) {
    throw new Error(`Maximum supported ${label.toLowerCase()} is ${limit.maximum} mm.`);
  }
}

function validateGrid(layout: { rows: number; columns: number }) {
  if (
    !Number.isInteger(layout.rows) ||
    layout.rows < limits.grid.minimumRows ||
    layout.rows > limits.grid.maximumRows
  ) {
    throw new Error(
      `Rows must be between ${limits.grid.minimumRows} and ${limits.grid.maximumRows}.`,
    );
  }
  if (
    !Number.isInteger(layout.columns) ||
    layout.columns < limits.grid.minimumColumns ||
    layout.columns > limits.grid.maximumColumns
  ) {
    throw new Error(
      `Columns must be between ${limits.grid.minimumColumns} and ${limits.grid.maximumColumns}.`,
    );
  }
}

function validatePositiveValues(
  values: number[],
  expectedCount: number,
  label: string,
) {
  if (values.length !== expectedCount) {
    throw new Error(`${label} must contain ${expectedCount} values.`);
  }
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error(`${label} values must all be greater than zero.`);
  }
}

function validatePercentages(
  percentages: number[],
  expectedCount: number,
  label: string,
) {
  validatePositiveValues(percentages, expectedCount, label);
  const total = roundDimension(
    percentages.reduce((sum, value) => sum + value, 0),
  );
  if (total !== 100) throw new Error(`${label} must total 100%.`);
}

function calculateUsableHeights(boxHeight: number) {
  return {
    baseHeight: roundDimension(
      boxHeight / 2 - constants.usableHeight.baseOffsetFromHalfHeight,
    ),
    lidHeight: roundDimension(
      boxHeight / 2 - constants.usableHeight.lidOffsetFromHalfHeight,
    ),
  };
}

function requiredTotalHeight(baseHeight: number, lidHeight: number) {
  if (!Number.isFinite(baseHeight) || baseHeight <= 0) {
    throw new Error("Required usable base height must be greater than zero.");
  }
  if (!Number.isFinite(lidHeight) || lidHeight <= 0) {
    throw new Error("Required usable lid height must be greater than zero.");
  }

  return roundDimension(
    Math.max(
      limits.outside.boxHeight.minimum,
      2 * (baseHeight + constants.usableHeight.baseOffsetFromHalfHeight),
      2 * (lidHeight + constants.usableHeight.lidOffsetFromHalfHeight),
    ),
  );
}

function requiredLayoutDimensions(layout: UsableLedHalfLayoutInput) {
  validateGrid(layout);
  if (layout.method === "equal") {
    if (
      !Number.isFinite(layout.requiredCompartmentWidth) ||
      layout.requiredCompartmentWidth <= 0 ||
      !Number.isFinite(layout.requiredCompartmentDepth) ||
      layout.requiredCompartmentDepth <= 0
    ) {
      throw new Error("Required compartment dimensions must be greater than zero.");
    }
    return {
      width: roundDimension(
        layout.columns * layout.requiredCompartmentWidth +
          (layout.columns - 1) * ENGINEERING_CONSTANTS.divider.thickness,
      ),
      depth: roundDimension(
        layout.rows * layout.requiredCompartmentDepth +
          (layout.rows - 1) * ENGINEERING_CONSTANTS.divider.thickness,
      ),
    };
  }

  validatePositiveValues(
    layout.requiredColumnWidths,
    layout.columns,
    "Required column widths",
  );
  validatePositiveValues(
    layout.requiredRowDepths,
    layout.rows,
    "Required row depths",
  );
  return {
    width: calculateTrayUsableLengthFromSegments(layout.requiredColumnWidths),
    depth: calculateTrayUsableLengthFromSegments(layout.requiredRowDepths),
  };
}

function expandSegmentsToLength(segments: number[], usableLength: number) {
  const dividerTotal =
    (segments.length - 1) * ENGINEERING_CONSTANTS.divider.thickness;
  const requestedClearLength = segments.reduce((sum, value) => sum + value, 0);
  const availableClearLength = usableLength - dividerTotal;
  const scale = availableClearLength / requestedClearLength;
  const expanded = segments.map((value) => roundDimension(value * scale));
  const preceding = expanded
    .slice(0, -1)
    .reduce((sum, value) => sum + value, 0);
  expanded[expanded.length - 1] = roundDimension(
    availableClearLength - preceding,
  );
  return expanded;
}

function createLayoutResult(
  layout: CompartmentBoxHalfLayoutInput,
  usableWidth: number,
  usableDepth: number,
  strategy: DimensionStrategy,
): CompartmentBoxHalfLayoutResult {
  validateGrid(layout);
  let usableColumnWidths: number[];
  let usableRowDepths: number[];

  if (layout.method === "equal") {
    const compartment = calculateCompartmentDimensions(
      usableWidth,
      usableDepth,
      layout.rows,
      layout.columns,
    );
    usableColumnWidths = Array.from(
      { length: layout.columns },
      () => compartment.width,
    );
    usableRowDepths = Array.from({ length: layout.rows }, () => compartment.depth);
  } else if (strategy === "outside-led") {
    const percentageLayout = layout as OutsideLedHalfLayoutInput & {
      method: "custom";
    };
    validatePercentages(
      percentageLayout.columnPercentages,
      layout.columns,
      "Column percentages",
    );
    validatePercentages(
      percentageLayout.rowPercentages,
      layout.rows,
      "Row percentages",
    );
    usableColumnWidths = calculateUsableSegmentsFromPercentages(
      usableWidth,
      percentageLayout.columnPercentages,
    );
    usableRowDepths = calculateUsableSegmentsFromPercentages(
      usableDepth,
      percentageLayout.rowPercentages,
    );
  } else {
    const usableLayout = layout as UsableLedHalfLayoutInput & {
      method: "custom";
    };
    usableColumnWidths = expandSegmentsToLength(
      usableLayout.requiredColumnWidths,
      usableWidth,
    );
    usableRowDepths = expandSegmentsToLength(
      usableLayout.requiredRowDepths,
      usableDepth,
    );
  }

  const dividers =
    layout.method === "equal"
      ? calculateEqualDividerConfiguration(
          usableWidth,
          usableDepth,
          layout.rows,
          layout.columns,
          constants.separatorCapacity.vertical,
          constants.separatorCapacity.horizontal,
        )
      : calculateCustomDividerConfiguration(
          usableColumnWidths,
          usableRowDepths,
          constants.separatorCapacity.vertical,
          constants.separatorCapacity.horizontal,
        );

  return {
    method: layout.method,
    rows: layout.rows,
    columns: layout.columns,
    usableColumnWidths,
    usableRowDepths,
    dividers,
  };
}

export function calculatePrintInPlaceCompartmentBox(
  input: PrintInPlaceCompartmentBoxCalculationInput,
): PrintInPlaceCompartmentBoxCalculationResult {
  const lidUsesBaseLayout = input.lidLayout.mode === "same-as-base";
  let outside: { width: number; depth: number; height: number };
  let requestedUsableHeights: { base: number; lid: number } | null = null;
  let baseInput: CompartmentBoxHalfLayoutInput;
  let lidInput: CompartmentBoxHalfLayoutInput;

  if (input.strategy === "outside-led") {
    baseInput = input.baseLayout;
    lidInput =
      input.lidLayout.mode === "same-as-base"
        ? input.baseLayout
        : input.lidLayout.layout;
    assertWithinLimits(input.dimensions.width, limits.outside.boxWidth, "Box width");
    assertWithinLimits(input.dimensions.depth, limits.outside.boxDepth, "Box depth");
    assertWithinLimits(input.dimensions.height, limits.outside.boxHeight, "Box height");
    outside = {
      width: roundDimension(input.dimensions.width),
      depth: roundDimension(input.dimensions.depth),
      height: roundDimension(input.dimensions.height),
    };
  } else {
    const usableBaseInput = input.baseLayout;
    const usableLidInput =
      input.lidLayout.mode === "same-as-base"
        ? input.baseLayout
        : input.lidLayout.layout;
    const baseRequired = requiredLayoutDimensions(usableBaseInput);
    const lidRequired = requiredLayoutDimensions(usableLidInput);
    baseInput = usableBaseInput;
    lidInput = usableLidInput;
    requestedUsableHeights = { ...input.requiredHeights };
    outside = {
      width: roundDimension(
        Math.max(limits.outside.boxWidth.minimum, baseRequired.width + constants.usableOffsets.width, lidRequired.width + constants.usableOffsets.width),
      ),
      depth: roundDimension(
        Math.max(limits.outside.boxDepth.minimum, baseRequired.depth + constants.usableOffsets.depth, lidRequired.depth + constants.usableOffsets.depth),
      ),
      height: requiredTotalHeight(
        input.requiredHeights.base,
        input.requiredHeights.lid,
      ),
    };
    assertWithinLimits(outside.width, limits.outside.boxWidth, "Box width");
    assertWithinLimits(outside.depth, limits.outside.boxDepth, "Box depth");
    assertWithinLimits(outside.height, limits.outside.boxHeight, "Box height");
  }

  const usableHeights = calculateUsableHeights(outside.height);
  const usableWidth = roundDimension(outside.width - constants.usableOffsets.width);
  const usableDepth = roundDimension(outside.depth - constants.usableOffsets.depth);
  const baseLayout = createLayoutResult(
    baseInput,
    usableWidth,
    usableDepth,
    input.strategy,
  );
  const lidLayout = lidUsesBaseLayout
    ? baseLayout
    : createLayoutResult(lidInput, usableWidth, usableDepth, input.strategy);

  return {
    strategy: input.strategy,
    outside,
    usable: { width: usableWidth, depth: usableDepth, ...usableHeights },
    requestedUsableHeights,
    baseLayout,
    lidLayout,
    lidUsesBaseLayout,
    makerWorldInputs: {
      boxWidth: outside.width,
      boxHeight: outside.height,
      boxDepth: outside.depth,
    },
  };
}
