import type { CalculationResult } from "@/lib/engineering/types";

import type { MakerWorldModelProfile } from "./types";

function validateDividerParameterNames(profile: MakerWorldModelProfile): void {
  const { maximumVerticalDividers, maximumHorizontalDividers } =
    profile.capabilities;

  const verticalParameterSlots =
    profile.parameterNames.dividers.vertical.length;

  const horizontalParameterSlots =
    profile.parameterNames.dividers.horizontal.length;

  if (verticalParameterSlots !== maximumVerticalDividers) {
    throw new Error(
      `MakerWorld profile "${profile.id}" defines ` +
        `${verticalParameterSlots} vertical divider parameter slots, ` +
        `but its configured maximum is ${maximumVerticalDividers}.`,
    );
  }

  if (horizontalParameterSlots !== maximumHorizontalDividers) {
    throw new Error(
      `MakerWorld profile "${profile.id}" defines ` +
        `${horizontalParameterSlots} horizontal divider parameter slots, ` +
        `but its configured maximum is ${maximumHorizontalDividers}.`,
    );
  }
}

function validateRequiredDividerCapacity(
  result: CalculationResult,
  profile: MakerWorldModelProfile,
): void {
  if (!result.dividers) {
    return;
  }

  if (!profile.capabilities.supportsDividerParameters) {
    throw new Error(
      `MakerWorld model "${profile.displayName}" does not support divider parameters.`,
    );
  }

  const requiredVerticalDividers = result.dividers.verticalPositions.length;
  const requiredHorizontalDividers = result.dividers.horizontalPositions.length;

  const { maximumVerticalDividers, maximumHorizontalDividers } =
    profile.capabilities;

  if (requiredVerticalDividers > maximumVerticalDividers) {
    throw new Error(
      `This configuration requires ${requiredVerticalDividers} vertical ` +
        `dividers, but MakerWorld model "${profile.displayName}" supports ` +
        `a maximum of ${maximumVerticalDividers}.`,
    );
  }

  if (requiredHorizontalDividers > maximumHorizontalDividers) {
    throw new Error(
      `This configuration requires ${requiredHorizontalDividers} horizontal ` +
        `dividers, but MakerWorld model "${profile.displayName}" supports ` +
        `a maximum of ${maximumHorizontalDividers}.`,
    );
  }
}

function validateSupportedResultSections(
  result: CalculationResult,
  profile: MakerWorldModelProfile,
): void {
  if (result.tray && !profile.capabilities.supportsTrayParameters) {
    throw new Error(
      `MakerWorld model "${profile.displayName}" does not support tray parameters.`,
    );
  }

  const hasGridConfiguration = result.rows !== null || result.columns !== null;

  if (hasGridConfiguration && !profile.capabilities.supportsGridParameters) {
    throw new Error(
      `MakerWorld model "${profile.displayName}" does not support grid parameters.`,
    );
  }
}

export function validateMakerWorldModelProfile(
  profile: MakerWorldModelProfile,
): void {
  if (!profile.id.trim()) {
    throw new Error("A MakerWorld model profile requires a stable id.");
  }

  if (!profile.version.trim()) {
    throw new Error(`MakerWorld profile "${profile.id}" requires a version.`);
  }

  if (!profile.displayName.trim()) {
    throw new Error(
      `MakerWorld profile "${profile.id}" requires a display name.`,
    );
  }

  const { maximumVerticalDividers, maximumHorizontalDividers } =
    profile.capabilities;

  if (
    !Number.isInteger(maximumVerticalDividers) ||
    maximumVerticalDividers < 0
  ) {
    throw new Error(
      `MakerWorld profile "${profile.id}" has an invalid maximumVerticalDividers value.`,
    );
  }

  if (
    !Number.isInteger(maximumHorizontalDividers) ||
    maximumHorizontalDividers < 0
  ) {
    throw new Error(
      `MakerWorld profile "${profile.id}" has an invalid maximumHorizontalDividers value.`,
    );
  }

  validateDividerParameterNames(profile);
}

export function validateMakerWorldParameterGeneration(
  result: CalculationResult,
  profile: MakerWorldModelProfile,
): void {
  validateMakerWorldModelProfile(profile);
  validateSupportedResultSections(result, profile);
  validateRequiredDividerCapacity(result, profile);
}
