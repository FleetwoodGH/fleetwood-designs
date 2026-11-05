import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateStackableSmallPartsBox as calculate, STACKABLE_AXES, STACKABLE_CLEARANCES, type StackableDimensions } from "../calculations/stackableSmallPartsBox";
import { generateStackableSmallPartsBoxParameters as parameters, STACKABLE_PARAMETER_ORDER } from "../makerworld/generateStackableSmallPartsBoxParameters";

const one = { width: 1, depth: 1, height: 1 };
const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} ≠ ${expected}`);
const custom = (dimensions: StackableDimensions, counts = one, strategy: "outside" | "usable" = "outside") => calculate({ mode: "custom", strategy, dimensions, counts });

test("standard defaults, conservative height, deeper region and studs", () => {
  const result = calculate({ mode: "standard", counts: one });
  assert.deepEqual(result.outside, { width: 42, depth: 42, height: 14 });
  close(result.usable.width, 34.92);
  close(result.usable.depth, 37.54);
  close(result.usable.height, 8);
  close(result.maximumUsableHeight, 8.9);
  close(result.overallHeightIncludingStuds, 15);
  const output = parameters(result).groups[0].parameters;
  assert.deepEqual(output.map(p => p.name), [...STACKABLE_PARAMETER_ORDER]);
  assert.deepEqual(output.map(p => p.displayValue), ["42", "42", "14", "1", "1", "1"]);
  assert.deepEqual(output.map(p => p.unit), ["mm", "mm", "mm", undefined, undefined, undefined]);
});

test("half-step counts and whole height counts", () => {
  const result = calculate({ mode: "standard", counts: { width: 1.5, depth: 2.5, height: 3 } });
  assert.deepEqual(result.outside, { width: 63, depth: 105, height: 42 });
  for (const axis of STACKABLE_AXES) {
    for (const bad of [0, 0.5, 6.5, NaN, Infinity, axis === "height" ? 1.5 : 1.25]) {
      assert.throws(() => calculate({ mode: "standard", counts: { ...one, [axis]: bad } }), /Grid/);
    }
  }
});

test("custom counts preserve total dimensions and derive units", () => {
  const dimensions = { width: 150, depth: 180, height: 84 };
  const first = custom(dimensions);
  const second = custom(dimensions, { width: 2.5, depth: 3, height: 6 });
  assert.deepEqual(first.outside, second.outside);
  assert.deepEqual(second.units, { width: 60, depth: 60, height: 14 });
  assert.deepEqual(dimensions, { width: 150, depth: 180, height: 84 });
});

test("usable inverse uses conservative clearances", () => {
  const result = custom({ width: 100, depth: 90, height: 40 }, { width: 2, depth: 2.5, height: 3 }, "usable");
  close(result.outside.width, 107.08);
  close(result.outside.depth, 94.46);
  close(result.outside.height, 46);
  close(result.maximumUsableHeight, 40.9);
  close(result.overallHeightIncludingStuds, 47);
});

test("unit minimums, nominal maximums and non-finite inputs", () => {
  assert.deepEqual(custom({ width: 30, depth: 30, height: 14 }).units, { width: 30, depth: 30, height: 14 });
  const max = custom({ width: 252, depth: 252, height: 252 });
  assert.equal(max.overallHeightIncludingStuds, 253);
  assert.deepEqual(calculate({ mode: "standard", counts: { width: 6, depth: 6, height: 6 } }).outside, { width: 252, depth: 252, height: 84 });
  for (const axis of STACKABLE_AXES) {
    for (const bad of [0, -1, NaN, Infinity, 252.00001]) {
      assert.throws(() => custom({ width: 42, depth: 42, height: 14, [axis]: bad }));
    }
    assert.throws(() => custom({ width: 30, depth: 30, height: 14 }, { ...one, [axis]: 2 }), /Unit/);
    assert.throws(() => custom({ width: 252 - 7.08, depth: 252 - 4.46, height: 246, [axis]: 253 - STACKABLE_CLEARANCES[axis] }, one, "usable"), /252/);
  }
});

test("serialized parameters never underdeliver required usable space", () => {
  for (const count of [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]) {
    for (const fraction of [0, 0.000001, 0.123456789, 0.999999999]) {
      const required = { width: 200 + fraction, depth: 200 + fraction, height: 100 + fraction };
      const result = custom(required, { width: count, depth: count, height: Math.floor(count) }, "usable");
      const output = Object.fromEntries(parameters(result).groups[0].parameters.map(p => [p.name, Number(p.displayValue)]));
      for (const axis of STACKABLE_AXES) {
        const suffix = axis[0].toUpperCase() + axis.slice(1);
        const reconstructed = output[`unit${suffix}`] * output[`unitNumber${suffix}`];
        assert.ok(reconstructed - STACKABLE_CLEARANCES[axis] >= required[axis]);
        assert.ok(reconstructed <= 252);
        assert.ok(reconstructed >= result.outside[axis]);
        assert.ok(reconstructed - result.outside[axis] < 0.061);
        assert.match(String(output[`unit${suffix}`]), /^\d+(\.\d{1,2})?$/);
      }
    }
  }
});


test("two-decimal MakerWorld units reject an overflow at the nominal limit", () => {
  const result = custom({ width: 252, depth: 42, height: 14 }, { width: 5.5, depth: 1, height: 1 });
  assert.throws(() => parameters(result), /Two-decimal MakerWorld unit width/);
});


test("drawer opening follows total depth in standard and both custom strategies", () => {
  close(calculate({ mode: "standard", counts: one }).drawerOpening, 23.36);
  close(calculate({ mode: "standard", counts: { ...one, depth: 2.5 } }).drawerOpening, 86.36);
  const dimensions = { width: 100, depth: 120, height: 42 };
  close(custom(dimensions).drawerOpening, 101.36);
  close(custom(dimensions, { ...one, depth: 2.5 }).drawerOpening, 101.36);
  close(custom(dimensions, one, "usable").drawerOpening, 105.82);
  assert.equal(custom({ ...dimensions, depth: 120.123 }).drawerOpening.toFixed(2), "101.48");
});
