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

export const PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS = {
  usableOffsets: {
    width: 10,
    depth: 9.1,
    height: 8.1,
  },
} as const;

export const PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS = {
  usableOffsets: {
    width: 8,
    depth: 9.1,
  },
  usableHeight: {
    baseOffsetFromHalfHeight: 6,
    lidOffsetFromHalfHeight: 8.1,
  },
  separatorCapacity: {
    vertical: 6,
    horizontal: 4,
  },
} as const;

export const STACKABLE_SMALL_PARTS_BOX_CONSTANTS = {
  standardUnit: { width: 42, depth: 42, height: 14 },
  minimumUnit: { width: 30, depth: 30, height: 14 },
  // Outside size minus clearance gives the conservative usable drawer space.
  // The height clearance uses the minimum drawer height near the edges.
  clearance: { width: 7.08, depth: 4.46, height: 6 },
  // Nominal outside size per axis, excluding stacking studs.
  maximumOutsideSize: 252,
  // Total depth minus this offset is the drawer opening with the drawer stop.
  drawerOpeningDepthOffset: 18.64,
  // Outside height minus this offset is the usable height in the deeper central region.
  deeperRegionHeightOffset: 5.1,
  studHeight: 1,
  grid: {
    minimumCount: 1,
    maximumCount: 6,
    widthDepthStep: 0.5,
    heightStep: 1,
  },
} as const;

const PRINT_IN_PLACE_COMPARTMENT_BOX_OUTSIDE_LIMITS = {
  boxWidth: { minimum: 92, maximum: 300 },
  boxDepth: { minimum: 25, maximum: 300 },
  boxHeight: { minimum: 35, maximum: 300 },
} as const;

const printInPlaceCompartmentBoxUsableLimits = {
  width: {
    minimum:
      PRINT_IN_PLACE_COMPARTMENT_BOX_OUTSIDE_LIMITS.boxWidth.minimum -
      PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS.usableOffsets.width,
    maximum:
      PRINT_IN_PLACE_COMPARTMENT_BOX_OUTSIDE_LIMITS.boxWidth.maximum -
      PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS.usableOffsets.width,
  },
  depth: {
    minimum:
      PRINT_IN_PLACE_COMPARTMENT_BOX_OUTSIDE_LIMITS.boxDepth.minimum -
      PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS.usableOffsets.depth,
    maximum:
      PRINT_IN_PLACE_COMPARTMENT_BOX_OUTSIDE_LIMITS.boxDepth.maximum -
      PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS.usableOffsets.depth,
  },
  baseHeight: {
    maximum:
      PRINT_IN_PLACE_COMPARTMENT_BOX_OUTSIDE_LIMITS.boxHeight.maximum / 2 -
      PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS.usableHeight
        .baseOffsetFromHalfHeight,
  },
  lidHeight: {
    maximum:
      PRINT_IN_PLACE_COMPARTMENT_BOX_OUTSIDE_LIMITS.boxHeight.maximum / 2 -
      PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS.usableHeight
        .lidOffsetFromHalfHeight,
  },
} as const;

const PRINT_IN_PLACE_STORAGE_BOX_OUTSIDE_LIMITS = {
  boxWidth: { minimum: 92, maximum: 350 },
  boxDepth: { minimum: 25, maximum: 350 },
  boxHeight: { minimum: 35, maximum: 350 },
} as const;

const printInPlaceStorageBoxUsableLimits = {
  width: {
    minimum:
      PRINT_IN_PLACE_STORAGE_BOX_OUTSIDE_LIMITS.boxWidth.minimum -
      PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS.usableOffsets.width,
    maximum:
      PRINT_IN_PLACE_STORAGE_BOX_OUTSIDE_LIMITS.boxWidth.maximum -
      PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS.usableOffsets.width,
  },
  depth: {
    minimum:
      PRINT_IN_PLACE_STORAGE_BOX_OUTSIDE_LIMITS.boxDepth.minimum -
      PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS.usableOffsets.depth,
    maximum:
      PRINT_IN_PLACE_STORAGE_BOX_OUTSIDE_LIMITS.boxDepth.maximum -
      PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS.usableOffsets.depth,
  },
  height: {
    minimum:
      PRINT_IN_PLACE_STORAGE_BOX_OUTSIDE_LIMITS.boxHeight.minimum -
      PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS.usableOffsets.height,
    maximum:
      PRINT_IN_PLACE_STORAGE_BOX_OUTSIDE_LIMITS.boxHeight.maximum -
      PRINT_IN_PLACE_STORAGE_BOX_CONSTANTS.usableOffsets.height,
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

  printInPlaceStorageBox: {
    outside: PRINT_IN_PLACE_STORAGE_BOX_OUTSIDE_LIMITS,
    usable: printInPlaceStorageBoxUsableLimits,
  },

  printInPlaceStorageBoxCompartments: {
    outside: PRINT_IN_PLACE_COMPARTMENT_BOX_OUTSIDE_LIMITS,
    usable: printInPlaceCompartmentBoxUsableLimits,
    grid: {
      minimumRows: 1,
      maximumRows:
        PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS.separatorCapacity.horizontal +
        1,
      minimumColumns: 1,
      maximumColumns:
        PRINT_IN_PLACE_COMPARTMENT_BOX_CONSTANTS.separatorCapacity.vertical +
        1,
    },
  },
} as const;
