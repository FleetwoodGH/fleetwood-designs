import { ENGINEERING_CONSTANTS } from "@/lib/engineering/engineeringConstants";

import type { TrayDimensions } from "@/lib/engineering/types";

const CALCULATION_PRECISION = 3;

function roundDimension(value: number) {
  return Number(value.toFixed(CALCULATION_PRECISION));
}

/* -------------------------------------------------------------------------- */
/* Tray geometry                                                              */
/* -------------------------------------------------------------------------- */

export function calculateTrayOutsideWidth(boxInsideWidth: number) {
  return roundDimension(
    boxInsideWidth - 2 * ENGINEERING_CONSTANTS.tray.clearance,
  );
}

export function calculateBoxInsideWidthFromTray(trayOutsideWidth: number) {
  return roundDimension(
    trayOutsideWidth + 2 * ENGINEERING_CONSTANTS.tray.clearance,
  );
}

export function calculateTrayOutsideDepth(boxInsideDepth: number) {
  return roundDimension(
    boxInsideDepth - 2 * ENGINEERING_CONSTANTS.tray.clearance,
  );
}

export function calculateBoxInsideDepthFromTray(trayOutsideDepth: number) {
  return roundDimension(
    trayOutsideDepth + 2 * ENGINEERING_CONSTANTS.tray.clearance,
  );
}

export function calculateTrayUsableWidth(trayOutsideWidth: number) {
  return roundDimension(
    trayOutsideWidth -
      2 * ENGINEERING_CONSTANTS.tray.wallThickness -
      2 * ENGINEERING_CONSTANTS.tray.sideAirGap,
  );
}

export function calculateTrayOutsideWidthFromUsableWidth(
  trayUsableWidth: number,
) {
  return roundDimension(
    trayUsableWidth +
      2 * ENGINEERING_CONSTANTS.tray.wallThickness +
      2 * ENGINEERING_CONSTANTS.tray.sideAirGap,
  );
}

export function calculateTrayUsableDepth(trayOutsideDepth: number) {
  return roundDimension(
    trayOutsideDepth - 2 * ENGINEERING_CONSTANTS.tray.wallThickness,
  );
}

export function calculateTrayOutsideDepthFromUsableDepth(
  trayUsableDepth: number,
) {
  return roundDimension(
    trayUsableDepth + 2 * ENGINEERING_CONSTANTS.tray.wallThickness,
  );
}

/* -------------------------------------------------------------------------- */
/* Result helper                                                              */
/* -------------------------------------------------------------------------- */

export function createTrayDimensions(
  outsideWidth: number,
  outsideDepth: number,
  usableWidth: number,
  usableDepth: number,
): TrayDimensions {
  if (
    outsideWidth <= 0 ||
    outsideDepth <= 0 ||
    usableWidth <= 0 ||
    usableDepth <= 0
  ) {
    throw new Error(
      "The calculated tray dimensions must be greater than zero.",
    );
  }

  return {
    outsideWidth: roundDimension(outsideWidth),
    outsideDepth: roundDimension(outsideDepth),
    outsideHeight: null,

    usableWidth: roundDimension(usableWidth),
    usableDepth: roundDimension(usableDepth),
    usableHeight: null,
  };
}
