import type {
  CalculationResult,
  DimensionStrategy,
} from "@/lib/engineering/types";

export type MakerWorldProductFamily = "parametric-storage-system";

export type MakerWorldParameterGroup =
  | "design"
  | "box"
  | "tray"
  | "grid"
  | "vertical-dividers"
  | "horizontal-dividers";

export type MakerWorldParameterValue = number | string | boolean;

export type MakerWorldParameter = {
  /**
   * Exact parameter name shown in MakerWorld.
   */
  name: string;

  /**
   * Value that the user must enter in MakerWorld.
   */
  value: MakerWorldParameterValue;

  /**
   * Logical grouping used by the presentation layer.
   */
  group: MakerWorldParameterGroup;

  /**
   * Optional unit shown alongside the value.
   *
   * This is presentation metadata only and is not used for calculations.
   */
  unit?: "mm";
};

export type MakerWorldBoxParameterNames = {
  outsideWidth: string;
  outsideDepth: string;
  insideWidth: string;
  insideDepth: string;
};

export type MakerWorldTrayParameterNames = {
  outsideWidth: string;
  outsideDepth: string;
  usableWidth: string;
  usableDepth: string;
};

export type MakerWorldGridParameterNames = {
  trayNumber: string;
  rows: string;
  columns: string;
};

export type MakerWorldDividerSlotParameterNames = {
  position: string;
  toggle: string;
};

export type MakerWorldDividerParameterNames = {
  vertical: MakerWorldDividerSlotParameterNames[];
  horizontal: MakerWorldDividerSlotParameterNames[];
};

export type MakerWorldParameterNames = {
  strategy?: string;

  box: MakerWorldBoxParameterNames;
  tray: MakerWorldTrayParameterNames;
  grid: MakerWorldGridParameterNames;
  dividers: MakerWorldDividerParameterNames;
};

export type MakerWorldModelCapabilities = {
  supportsTrayParameters: boolean;
  supportsGridParameters: boolean;
  supportsDividerParameters: boolean;

  maximumVerticalDividers: number;
  maximumHorizontalDividers: number;
};

export type MakerWorldModelProfile = {
  /**
   * Stable internal identifier.
   *
   * This should not change when the display name changes.
   */
  id: string;

  productFamily: MakerWorldProductFamily;

  /**
   * Version of the published MakerWorld model.
   */
  version: string;

  displayName: string;

  capabilities: MakerWorldModelCapabilities;
  parameterNames: MakerWorldParameterNames;
};

export type MakerWorldParameterSet = {
  profileId: string;
  profileVersion: string;
  profileDisplayName: string;
  productFamily: MakerWorldProductFamily;

  strategy: DimensionStrategy;

  /**
   * Complete ordered list of values that the user can manually
   * transfer to the selected MakerWorld model.
   */
  parameters: MakerWorldParameter[];

  /**
   * Engineering warnings are preserved for display next to the
   * MakerWorld parameter set.
   */
  warnings: string[];
};

export type GenerateMakerWorldParameterSetOptions = {
  result: CalculationResult;
  profile: MakerWorldModelProfile;
};
