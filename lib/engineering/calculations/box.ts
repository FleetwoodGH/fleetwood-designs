import { ENGINEERING_CONSTANTS } from "@/lib/engineering/engineeringConstants";

const CALCULATION_PRECISION = 3;

function roundDimension(value: number) {
  return Number(value.toFixed(CALCULATION_PRECISION));
}

export function calculateBoxInsideWidth(boxOutsideWidth: number) {
  return roundDimension(
    boxOutsideWidth - 2 * ENGINEERING_CONSTANTS.box.wallThickness,
  );
}

export function calculateBoxOutsideWidth(boxInsideWidth: number) {
  return roundDimension(
    boxInsideWidth + 2 * ENGINEERING_CONSTANTS.box.wallThickness,
  );
}

export function calculateBoxInsideDepth(boxOutsideDepth: number) {
  return roundDimension(
    boxOutsideDepth -
      ENGINEERING_CONSTANTS.construction.hingeDepthClearancePerPart -
      ENGINEERING_CONSTANTS.box.wallThickness -
      ENGINEERING_CONSTANTS.box.backWallThickness,
  );
}

export function calculateBoxOutsideDepth(boxInsideDepth: number) {
  return roundDimension(
    boxInsideDepth +
      ENGINEERING_CONSTANTS.box.wallThickness +
      ENGINEERING_CONSTANTS.box.backWallThickness +
      ENGINEERING_CONSTANTS.construction.hingeDepthClearancePerPart,
  );
}
