import type {
  DividerConfiguration,
  CalculationResult,
} from "@/lib/engineering/types";

import type {
  GenerateMakerWorldParameterSetOptions,
  MakerWorldDividerSlotParameterNames,
  MakerWorldModelProfile,
  MakerWorldParameter,
  MakerWorldParameterSet,
} from "./types";

import { validateMakerWorldParameterGeneration } from "./validation";

function createDimensionParameter(
  name: string,
  value: number,
  group: MakerWorldParameter["group"],
): MakerWorldParameter {
  return {
    name,
    value,
    group,
    unit: "mm",
  };
}

function createNumberParameter(
  name: string,
  value: number,
  group: MakerWorldParameter["group"],
): MakerWorldParameter {
  return {
    name,
    value,
    group,
  };
}

function createStringParameter(
  name: string,
  value: string,
  group: MakerWorldParameter["group"],
): MakerWorldParameter {
  return {
    name,
    value,
    group,
  };
}

function getSlotPosition(positions: number[], slotIndex: number): number {
  return positions[slotIndex] ?? 0;
}

function getSlotToggle(
  toggles: number[],
  positions: number[],
  slotIndex: number,
): number {
  const configuredToggle = toggles[slotIndex];

  if (configuredToggle !== undefined) {
    return configuredToggle;
  }

  return positions[slotIndex] !== undefined ? 1 : 0;
}

function createDividerSlotParameters(
  slots: MakerWorldDividerSlotParameterNames[],
  positions: number[],
  toggles: number[],
  group: "vertical-dividers" | "horizontal-dividers",
): MakerWorldParameter[] {
  return slots.flatMap((slot, slotIndex) => [
    createNumberParameter(
      slot.position,
      getSlotPosition(positions, slotIndex),
      group,
    ),
    createNumberParameter(
      slot.toggle,
      getSlotToggle(toggles, positions, slotIndex),
      group,
    ),
  ]);
}

function createEmptyDividerConfiguration(): DividerConfiguration {
  return {
    verticalPositions: [],
    horizontalPositions: [],
    verticalToggles: [],
    horizontalToggles: [],
  };
}

function createDesignParameters(
  result: CalculationResult,
  profile: MakerWorldModelProfile,
): MakerWorldParameter[] {
  const strategyParameterName = profile.parameterNames.strategy;

  if (!strategyParameterName) {
    return [];
  }

  return [
    createStringParameter(strategyParameterName, result.strategy, "design"),
  ];
}

function createBoxParameters(
  result: CalculationResult,
  profile: MakerWorldModelProfile,
): MakerWorldParameter[] {
  const names = profile.parameterNames.box;

  return [
    createDimensionParameter(
      names.outsideWidth,
      result.box.outsideWidth,
      "box",
    ),
    createDimensionParameter(
      names.outsideDepth,
      result.box.outsideDepth,
      "box",
    ),
    createDimensionParameter(names.insideWidth, result.box.insideWidth, "box"),
    createDimensionParameter(names.insideDepth, result.box.insideDepth, "box"),
  ];
}

function createTrayParameters(
  result: CalculationResult,
  profile: MakerWorldModelProfile,
): MakerWorldParameter[] {
  if (!result.tray || !profile.capabilities.supportsTrayParameters) {
    return [];
  }

  const names = profile.parameterNames.tray;

  return [
    createDimensionParameter(
      names.outsideWidth,
      result.tray.outsideWidth,
      "tray",
    ),
    createDimensionParameter(
      names.outsideDepth,
      result.tray.outsideDepth,
      "tray",
    ),
    createDimensionParameter(
      names.usableWidth,
      result.tray.usableWidth,
      "tray",
    ),
    createDimensionParameter(
      names.usableDepth,
      result.tray.usableDepth,
      "tray",
    ),
  ];
}

function createGridParameters(
  result: CalculationResult,
  profile: MakerWorldModelProfile,
): MakerWorldParameter[] {
  if (!profile.capabilities.supportsGridParameters) {
    return [];
  }

  const names = profile.parameterNames.grid;

  return [
    createNumberParameter(names.trayNumber, result.trayNumber, "grid"),
    createNumberParameter(names.rows, result.rows ?? 1, "grid"),
    createNumberParameter(names.columns, result.columns ?? 1, "grid"),
  ];
}

function createDividerParameters(
  result: CalculationResult,
  profile: MakerWorldModelProfile,
): MakerWorldParameter[] {
  if (!profile.capabilities.supportsDividerParameters) {
    return [];
  }

  const dividers = result.dividers ?? createEmptyDividerConfiguration();

  const verticalParameters = createDividerSlotParameters(
    profile.parameterNames.dividers.vertical,
    dividers.verticalPositions,
    dividers.verticalToggles,
    "vertical-dividers",
  );

  const horizontalParameters = createDividerSlotParameters(
    profile.parameterNames.dividers.horizontal,
    dividers.horizontalPositions,
    dividers.horizontalToggles,
    "horizontal-dividers",
  );

  return [...verticalParameters, ...horizontalParameters];
}

export function generateMakerWorldParameterSet({
  result,
  profile,
}: GenerateMakerWorldParameterSetOptions): MakerWorldParameterSet {
  validateMakerWorldParameterGeneration(result, profile);

  const parameters: MakerWorldParameter[] = [
    ...createDesignParameters(result, profile),
    ...createBoxParameters(result, profile),
    ...createTrayParameters(result, profile),
    ...createGridParameters(result, profile),
    ...createDividerParameters(result, profile),
  ];

  return {
    profileId: profile.id,
    profileVersion: profile.version,
    profileDisplayName: profile.displayName,
    productFamily: profile.productFamily,

    strategy: result.strategy,

    parameters,
    warnings: [...result.warnings],
  };
}
