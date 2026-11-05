export const STACKABLE_AXES = ["width", "depth", "height"] as const;
export type StackableDimensions = Record<(typeof STACKABLE_AXES)[number], number>;
export const STACKABLE_STANDARD_UNITS: StackableDimensions = { width: 42, depth: 42, height: 14 };
export const STACKABLE_MINIMUM_UNITS: StackableDimensions = { width: 30, depth: 30, height: 14 };
export const STACKABLE_CLEARANCES: StackableDimensions = { width: 7.08, depth: 4.46, height: 6 };
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
    const step = axis === "height" ? 1 : 0.5;
    if (!Number.isFinite(count) || count < 1 || count > 6 || !Number.isInteger(count / step)) {
      throw new Error(`Grid ${axis} must be 1–6 in steps of ${step}.`);
    }
    const clearance = STACKABLE_CLEARANCES[axis];
    const required = input.mode === "custom" ? input.dimensions[axis] : 0;
    if (input.mode === "custom" && (!Number.isFinite(required) || required <= 0)) {
      throw new Error(`Enter a positive ${axis} in millimeters.`);
    }
    const usableLed = input.mode === "custom" && input.strategy === "usable";
    const target = input.mode === "standard" ? STACKABLE_STANDARD_UNITS[axis] * count
      : required + (usableLed ? clearance : 0);
    if (target > 252) throw new Error(`Nominal outside ${axis} must be at most 252 mm. Reduce the requested size.`);
    if (target / count < STACKABLE_MINIMUM_UNITS[axis]) {
      throw new Error(`Unit ${axis} must be at least ${STACKABLE_MINIMUM_UNITS[axis]} mm. Increase the requested ${axis} or reduce its grid count.`);
    }
    let unit = target / count;
    // The serialized unit must reconstruct enough space, including after subtraction.
    while (unit * count < target || (usableLed && unit * count - clearance < required)) unit = nextUp(unit);
    if (unit * count > 252) throw new Error(`This grid count cannot represent the requested ${axis} within 252 mm. Reduce the size or choose another count.`);
    units[axis] = unit;
    outside[axis] = unit * count;
    usable[axis] = outside[axis] - clearance;
  }
  return {
    outside, usable, units, counts: { ...input.counts },
    drawerOpening: units.depth * input.counts.depth - 18.64,
    maximumUsableHeight: outside.height - 5.1,
    overallHeightIncludingStuds: outside.height + 1,
  };
}
export type StackableBoxResult = ReturnType<typeof calculateStackableSmallPartsBox>;
