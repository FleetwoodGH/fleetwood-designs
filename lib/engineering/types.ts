export type BuildType = "box" | "system";

export type TrayType = "open" | "lid" | "dividers";

export type DividerLayout = "equal" | "custom";

export type DimensionStrategy = "outside-led" | "usable-space-led";

export type CalculationInput = {
  buildType: BuildType;
  trayType?: TrayType;
  dividerLayout?: DividerLayout;

  trayNumber: number;
  rows: number;
  columns: number;

  strategy: DimensionStrategy;

  width: number;
  depth: number;
  height: number;
};

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
  outsideHeight: number | null;

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

export type CalculationResult = {
  strategy: DimensionStrategy;

  box: BoxDimensions;
  tray: TrayDimensions | null;
  compartment: CompartmentDimensions | null;
  dividers: DividerConfiguration | null;

  trayNumber: number;
  rows: number | null;
  columns: number | null;

  warnings: string[];
};
