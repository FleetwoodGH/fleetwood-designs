export type BuildType = "box" | "system";

export type TrayType = "open" | "lid" | "dividers";

export type DividerLayout = "equal" | "custom";

export type DimensionStrategy = "outside-led" | "usable-space-led";

type CalculationInputBase = {
  strategy: DimensionStrategy;
  width: number;
  depth: number;
};

export type StandaloneBoxCalculationInput = CalculationInputBase & {
  buildType: "box";
  boxHeight: number;
};

type StorageSystemCalculationInputBase = Omit<
  CalculationInputBase,
  "strategy"
> & {
  buildType: "system";
  trayType: TrayType;
  dividerLayout?: DividerLayout;

  trayNumber: number;
  rows: number;
  columns: number;
};

export type OutsideLedStorageSystemCalculationInput =
  StorageSystemCalculationInputBase & {
    strategy: "outside-led";
    heights: {
      systemOutsideHeight: number;
    };
    customLayout?: {
      columnPercentages: number[];
      rowPercentages: number[];
    };
  };

export type UsableSpaceLedStorageSystemCalculationInput =
  StorageSystemCalculationInputBase & {
    strategy: "usable-space-led";
    heights: {
      usableTrayHeight: number;
    };
    customLayout?: {
      usableColumnWidths: number[];
      usableRowDepths: number[];
    };
  };

export type StorageSystemCalculationInput =
  | OutsideLedStorageSystemCalculationInput
  | UsableSpaceLedStorageSystemCalculationInput;

export type CalculationInput =
  StandaloneBoxCalculationInput | StorageSystemCalculationInput;

export type BoxDimensions = {
  outsideWidth: number;
  outsideDepth: number;
  outsideHeight: number;

  insideWidth: number;
  insideDepth: number;
  insideHeight: number | null;
};

export type TrayDimensions = {
  outsideWidth: number;
  outsideDepth: number;
  outsideHeight: number;

  usableWidth: number;
  usableDepth: number;
  usableHeight: number | null;
};

export type CompartmentDimensions = {
  width: number;
  depth: number;
  height: number | null;
};

export type DividerConfiguration = {
  /** Absolute divider centre positions in millimetres. */
  verticalCentrePositions: number[];
  horizontalCentrePositions: number[];

  /**
   * Normalised divider centre positions between 0 and 1.
   *
   * Vertical positions are measured from the left inside edge
   * of the usable tray area.
   */
  verticalPositions: number[];

  /**
   * Normalised divider centre positions between 0 and 1.
   *
   * Horizontal positions are measured from the rear inside edge
   * of the usable tray area.
   */
  horizontalPositions: number[];

  /**
   * Fusion-compatible toggle values.
   *
   * The Engineering Calculation Engine may expose more slots than
   * an individual published MakerWorld model supports.
   *
   * The MakerWorld model profile determines which slots are included
   * in the generated parameter set.
   */
  verticalToggles: number[];
  horizontalToggles: number[];
};

export type LayoutSegmentDimensions = {
  usableColumnWidths: number[];
  usableRowDepths: number[];
};

export type StorageSystemHeightResult = {
  trayOutsideHeight: number;
  usableTrayHeight: number;
  lidHeight: number;
  baseHeight: number;
  closedOutsideHeight: number;
};

export type CalculationResult = {
  strategy: DimensionStrategy;

  box: BoxDimensions;
  tray: TrayDimensions | null;
  compartment: CompartmentDimensions | null;
  dividers: DividerConfiguration | null;
  layoutSegments: LayoutSegmentDimensions | null;
  heights: StorageSystemHeightResult | null;

  trayNumber: number;
  rows: number | null;
  columns: number | null;

  warnings: string[];
};
