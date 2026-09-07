import {
  ENGINEERING_LIMITS,
  STORAGE_BOX_LID_BASE_CONSTANTS,
} from "@/lib/engineering/engineeringConstants";
import { roundDimension } from "@/lib/engineering/calculations/numeric";
import type { DimensionStrategy } from "@/lib/engineering/types";

export type StorageBoxLidBaseDimensions = {
  width: number;
  depth: number;
  baseHeight: number;
  lidHeight: number;
};

export type StorageBoxLidBaseCalculationInput = {
  strategy: DimensionStrategy;
  dimensions: StorageBoxLidBaseDimensions;
};

export type StorageBoxLidBaseCalculationResult = {
  strategy: DimensionStrategy;
  outside: StorageBoxLidBaseDimensions;
  usable: StorageBoxLidBaseDimensions;
  totalOutsideHeight: number;
  makerWorldInputs: {
    boxWidth: number;
    boxDepth: number;
    baseHeight: number;
    lidHeight: number;
  };
};

type DimensionKey = keyof StorageBoxLidBaseDimensions;

const LABELS: Record<DimensionKey, string> = {
  width: "box width",
  depth: "box depth",
  baseHeight: "base outside height",
  lidHeight: "lid outside height",
};

function validateDimensions(
  dimensions: StorageBoxLidBaseDimensions,
  strategy: DimensionStrategy,
) {
  const outsideLimits = ENGINEERING_LIMITS.storageBoxLidBase.outside;
  const usableLimits = ENGINEERING_LIMITS.storageBoxLidBase.usable;
  const values =
    strategy === "outside-led"
      ? {
          width: {
            value: dimensions.width,
            limit: outsideLimits.boxWidth,
            label: LABELS.width,
          },
          depth: {
            value: dimensions.depth,
            limit: outsideLimits.boxDepth,
            label: LABELS.depth,
          },
          baseHeight: {
            value: dimensions.baseHeight,
            limit: outsideLimits.baseHeight,
            label: LABELS.baseHeight,
          },
          lidHeight: {
            value: dimensions.lidHeight,
            limit: outsideLimits.lidHeight,
            label: LABELS.lidHeight,
          },
        }
      : {
          width: {
            value: dimensions.width,
            limit: usableLimits.width,
            label: "usable box width",
          },
          depth: {
            value: dimensions.depth,
            limit: usableLimits.depth,
            label: "usable box depth",
          },
          baseHeight: {
            value: dimensions.baseHeight,
            limit: usableLimits.baseHeight,
            label: "usable base height",
          },
          lidHeight: {
            value: dimensions.lidHeight,
            limit: usableLimits.lidHeight,
            label: "usable lid height",
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
  dimensions: StorageBoxLidBaseDimensions,
  direction: 1 | -1,
): StorageBoxLidBaseDimensions {
  const offsets = STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets;

  return {
    width: roundDimension(dimensions.width + direction * offsets.width),
    depth: roundDimension(dimensions.depth + direction * offsets.depth),
    baseHeight: roundDimension(
      dimensions.baseHeight + direction * offsets.baseHeight,
    ),
    lidHeight: roundDimension(
      dimensions.lidHeight + direction * offsets.lidHeight,
    ),
  };
}

export function calculateStorageBoxLidBase(
  input: StorageBoxLidBaseCalculationInput,
): StorageBoxLidBaseCalculationResult {
  validateDimensions(input.dimensions, input.strategy);

  const outside =
    input.strategy === "outside-led"
      ? Object.fromEntries(
          Object.entries(input.dimensions).map(([key, value]) => [
            key,
            roundDimension(value),
          ]),
        ) as StorageBoxLidBaseDimensions
      : offsetDimensions(input.dimensions, 1);
  const usable =
    input.strategy === "usable-space-led"
      ? Object.fromEntries(
          Object.entries(input.dimensions).map(([key, value]) => [
            key,
            roundDimension(value),
          ]),
        ) as StorageBoxLidBaseDimensions
      : offsetDimensions(input.dimensions, -1);

  return {
    strategy: input.strategy,
    outside,
    usable,
    totalOutsideHeight: roundDimension(
      outside.baseHeight + outside.lidHeight,
    ),
    makerWorldInputs: {
      boxWidth: outside.width,
      boxDepth: outside.depth,
      baseHeight: outside.baseHeight,
      lidHeight: outside.lidHeight,
    },
  };
}
