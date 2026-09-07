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

export const STORAGE_BOX_LID_BASE_CONSTANTS = {
  usableOffsets: {
    width: 8,
    depth: 9.1,
    // The base lip extends 2 mm above the visible outside seam.
    baseHeight: 2,
    // The matching lid recess and closing margin consume 6.1 mm.
    lidHeight: 6.1,
  },
} as const;

const STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS = {
  boxWidth: { minimum: 95, maximum: 350 },
  boxDepth: { minimum: 25, maximum: 350 },
  baseHeight: { minimum: 17, maximum: 350 },
  lidHeight: { minimum: 13, maximum: 350 },
} as const;

const storageBoxUsableLimits = {
  width: {
    minimum:
      STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS.boxWidth.minimum -
      STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets.width,
    maximum:
      STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS.boxWidth.maximum -
      STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets.width,
  },
  depth: {
    minimum:
      STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS.boxDepth.minimum -
      STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets.depth,
    maximum:
      STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS.boxDepth.maximum -
      STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets.depth,
  },
  baseHeight: {
    minimum:
      STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS.baseHeight.minimum -
      STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets.baseHeight,
    maximum:
      STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS.baseHeight.maximum -
      STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets.baseHeight,
  },
  lidHeight: {
    minimum:
      STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS.lidHeight.minimum -
      STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets.lidHeight,
    maximum:
      STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS.lidHeight.maximum -
      STORAGE_BOX_LID_BASE_CONSTANTS.usableOffsets.lidHeight,
  },
} as const;

const MINIMUM_FUSION_TRAY_OUTSIDE_HEIGHT = 15;

export const ENGINEERING_LIMITS = {
  validity: {
    dimensions: {
      minimumExclusive: 0,
    },

    trayHeight: {
      minimumUsableExclusive: 0,
    },
  },

  design: {
    boxWidth: {
      minimum: 95,
    },

    boxDepth: {
      minimum: 40,
    },

    trayOutsideHeight: {
      minimum: MINIMUM_FUSION_TRAY_OUTSIDE_HEIGHT,
    },
  },

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

  storageBoxLidBase: {
    outside: STORAGE_BOX_LID_BASE_OUTSIDE_LIMITS,
    usable: storageBoxUsableLimits,
  },
} as const;
