import { roundDimension } from "@/lib/engineering/calculations/numeric";
import {
  ENGINEERING_LIMITS,
  PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS,
} from "@/lib/engineering/engineeringConstants";
import type { DimensionStrategy } from "@/lib/engineering/types";

export type PrintInPlaceStorageBoxDimensions = {
  width: number;
  depth: number;
  height: number;
};

export type PrintInPlaceStorageBoxCalculationInput = {
  strategy: DimensionStrategy;
  dimensions: PrintInPlaceStorageBoxDimensions;
};

export type PrintInPlaceStorageBoxCalculationResult = {
  strategy: DimensionStrategy;
  outside: PrintInPlaceStorageBoxDimensions;
  usable: PrintInPlaceStorageBoxDimensions;
  makerWorldInputs: {
    boxWidth: number;
    boxDepth: number;
    boxHeight: number;
  };
};

function validateDimensions(
  dimensions: PrintInPlaceStorageBoxDimensions,
  strategy: DimensionStrategy,
) {
  const outsideLimits = ENGINEERING_LIMITS.printInPlaceStorageBox.outside;
  const usableLimits = ENGINEERING_LIMITS.printInPlaceStorageBox.usable;
  const values =
    strategy === "outside-led"
      ? {
          width: {
            value: dimensions.width,
            limit: outsideLimits.boxWidth,
            label: "box width",
          },
          depth: {
            value: dimensions.depth,
            limit: outsideLimits.boxDepth,
            label: "box depth",
          },
          height: {
            value: dimensions.height,
            limit: outsideLimits.boxHeight,
            label: "box height",
          },
        }
      : {
          width: {
            value: dimensions.width,
            limit: usableLimits.width,
            label: "usable width",
          },
          depth: {
            value: dimensions.depth,
            limit: usableLimits.depth,
            label: "usable depth",
          },
          height: {
            value: dimensions.height,
            limit: usableLimits.height,
            label: "usable height",
          },
        };

  for (const { value, limit, label } of Object.values(values)) {
    if (!Number.isFinite(value)) {
      throw new Error(`${label[0].toUpperCase()}${label.slice(1)} must be a number.`);
    }
    if (value < limit.minimum) {
      throw new Error(`Minimum supported ${label} is ${limit.minimum} mm.`);
    }
    if (value > limit.maximum) {
      throw new Error(`Maximum supported ${label} is ${limit.maximum} mm.`);
    }
  }
}

function offsetDimensions(
  dimensions: PrintInPlaceStorageBoxDimensions,
  direction: 1 | -1,
): PrintInPlaceStorageBoxDimensions {
  const offsets = PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS.usableOffsets;

  return {
    width: roundDimension(dimensions.width + direction * offsets.width),
    depth: roundDimension(dimensions.depth + direction * offsets.depth),
    height: roundDimension(dimensions.height + direction * offsets.height),
  };
}

function roundDimensions(
  dimensions: PrintInPlaceStorageBoxDimensions,
): PrintInPlaceStorageBoxDimensions {
  return Object.fromEntries(
    Object.entries(dimensions).map(([key, value]) => [
      key,
      roundDimension(value),
    ]),
  ) as PrintInPlaceStorageBoxDimensions;
}

export function calculatePrintInPlaceStorageBox(
  input: PrintInPlaceStorageBoxCalculationInput,
): PrintInPlaceStorageBoxCalculationResult {
  validateDimensions(input.dimensions, input.strategy);

  const outside =
    input.strategy === "outside-led"
      ? roundDimensions(input.dimensions)
      : offsetDimensions(input.dimensions, 1);
  const usable =
    input.strategy === "usable-space-led"
      ? roundDimensions(input.dimensions)
      : offsetDimensions(input.dimensions, -1);

  return {
    strategy: input.strategy,
    outside,
    usable,
    makerWorldInputs: {
      boxWidth: outside.width,
      boxDepth: outside.depth,
      boxHeight: outside.height,
    },
  };
}
