import { STACKABLE_SMALL_PARTS_BOX_CONSTANTS as C } from "../engineeringConstants";

export const STACKABLE_AXES = ["width", "depth", "height"] as const;
export type StackableDimensions = Record<(typeof STACKABLE_AXES)[number], number>;
export const STACKABLE_STANDARD_UNITS: StackableDimensions = C.standardUnit;
export const STACKABLE_MINIMUM_UNITS: StackableDimensions = C.minimumUnit;
export const STACKABLE_CLEARANCES: StackableDimensions = C.clearance;
export const STACKABLE_MAXIMUM_OUTSIDE_SIZE = C.maximumOutsideSize;
export const stackableGridStep = (axis: (typeof STACKABLE_AXES)[number]) =>
  axis === "height" ? C.grid.heightStep : C.grid.widthDepthStep;
export type StackableBoxInput = { counts: StackableDimensions } & (
  | { mode: "standard" }
  | { mode: "custom"; strategy: "outside" | "usable"; dimensions: StackableDimensions }
);

// Advance one representable positive number, only when division/addition would
// otherwise underdeliver a requested minimum. Never round units to display precision.
function nextUp(value: number) {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  view.setBigUint64(0, view.getBigUint64(0) + BigInt(1));
  return view.getFloat64(0);
}

export function calculateStackableSmallPartsBox(input: StackableBoxInput) {
  const outside = {} as StackableDimensions;
  const usable = {} as StackableDimensions;
  const units = {} as StackableDimensions;
  for (const axis of STACKABLE_AXES) {
    const count = input.counts[axis];
    const step = stackableGridStep(axis);
    if (!Number.isFinite(count) || count < C.grid.minimumCount || count > C.grid.maximumCount || !Number.isInteger(count / step)) {
      throw new Error(`Grid ${axis} must be ${C.grid.minimumCount}–${C.grid.maximumCount} in steps of ${step}.`);
    }
    const clearance = STACKABLE_CLEARANCES[axis];
    const required = input.mode === "custom" ? input.dimensions[axis] : 0;
    if (input.mode === "custom" && (!Number.isFinite(required) || required <= 0)) {
      throw new Error(`Enter a positive ${axis} in millimeters.`);
    }
    const usableLed = input.mode === "custom" && input.strategy === "usable";
    const target = input.mode === "standard" ? STACKABLE_STANDARD_UNITS[axis] * count
      : required + (usableLed ? clearance : 0);
    if (target > C.maximumOutsideSize) throw new Error(`Nominal outside ${axis} must be at most ${C.maximumOutsideSize} mm. Reduce the requested size.`);
    if (target / count < STACKABLE_MINIMUM_UNITS[axis]) {
      throw new Error(`Unit ${axis} must be at least ${STACKABLE_MINIMUM_UNITS[axis]} mm. Increase the requested ${axis} or reduce its grid count.`);
    }
    let unit = target / count;
    // The serialized unit must reconstruct enough space, including after subtraction.
    while (unit * count < target || (usableLed && unit * count - clearance < required)) unit = nextUp(unit);
    if (unit * count > C.maximumOutsideSize) throw new Error(`This grid count cannot represent the requested ${axis} within ${C.maximumOutsideSize} mm. Reduce the size or choose another count.`);
    units[axis] = unit;
    outside[axis] = unit * count;
    usable[axis] = outside[axis] - clearance;
  }
  return {
    outside, usable, units, counts: { ...input.counts },
    drawerOpening: units.depth * input.counts.depth - C.drawerOpeningDepthOffset,
    maximumUsableHeight: outside.height - C.deeperRegionHeightOffset,
    overallHeightIncludingStuds: outside.height + C.studHeight,
  };
}
export type StackableBoxResult = ReturnType<typeof calculateStackableSmallPartsBox>;
