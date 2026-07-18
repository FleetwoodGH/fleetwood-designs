export const ENGINEERING_CONSTANTS = {
  box: {
    // One shared construction thickness is used for the left, right and front walls.
    wallThickness: 4,
    backWallThickness: 5,
    // Reserved for the future standalone box height model.
    bottomThickness: 3,
    lidHeight: 13,
  },

  tray: {
    boxClearancePerSide: 0.4,
    wallThickness: 2.5,
    bottomThickness: 2.5,
    lateralAirGapPerSide: 2,
    lidHeightContribution: 4,
    verticalOverlap: 2,
  },

  divider: {
    thickness: 2,
  },

  base: {
    topAllowance: 1,
  },

  construction: {
    hingeDepthClearancePerPart: 0.1,
  },
} as const;

export const ENGINEERING_LIMITS = {
  grid: {
    minimumRows: 1,
    maximumRows: 6,
    minimumColumns: 1,
    maximumColumns: 6,
  },

  trays: {
    minimum: 1,
    maximum: 10,
  },

  trayHeight: {
    minimumUsableExclusive: 0,
    minimumOutsideExclusive:
      ENGINEERING_CONSTANTS.tray.bottomThickness +
      ENGINEERING_CONSTANTS.tray.lidHeightContribution,
  },
} as const;
