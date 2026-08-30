import {
  calculateBaseHeight,
  calculateClosedOutsideHeight,
  calculateOutsideLed,
  calculateTrayOutsideHeightFromSystemHeight,
  calculateUsableSpaceLed,
} from "@/lib/engineering/calculations";
import { generateMakerWorldParameters } from "@/lib/engineering/makerworld";

import type {
  OutsideLedStorageSystemCalculationInput,
  UsableSpaceLedStorageSystemCalculationInput,
} from "@/lib/engineering/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertClose(actual: number, expected: number, message: string) {
  assert(
    Math.abs(actual - expected) < 0.00001,
    `${message}: expected ${expected}, received ${actual}.`,
  );
}

function expectRejected(run: () => unknown, message: string) {
  try {
    run();
  } catch (error) {
    assert(
      error instanceof Error && error.message.includes(message),
      `Expected error containing “${message}”.`,
    );
    return;
  }
  throw new Error(`Expected calculation to reject with “${message}”.`);
}

/**
 * Runs the engineering verification cases that protect the Tray Storage System
 * calculations and MakerWorld mapping. An exception intentionally fails the
 * calling development or build process.
 */
export function runEngineeringValidation() {
  const outsideBase: OutsideLedStorageSystemCalculationInput = {
    buildType: "system",
    trayType: "open",
    trayNumber: 3,
    rows: 1,
    columns: 1,
    strategy: "outside-led",
    width: 160,
    depth: 100,
    heights: { systemOutsideHeight: 85 },
  };

  const usableBase: UsableSpaceLedStorageSystemCalculationInput = {
    buildType: "system",
    trayType: "open",
    trayNumber: 3,
    rows: 1,
    columns: 1,
    strategy: "usable-space-led",
    width: 80,
    depth: 60,
    heights: { usableTrayHeight: 20.5 },
  };

  // Height model: one tray, multiple trays, inverse calculation, and round trips.
  assertClose(
    calculateTrayOutsideHeightFromSystemHeight(39, 1),
    25,
    "One-tray inverse height",
  );
  assertClose(
    calculateTrayOutsideHeightFromSystemHeight(85, 3),
    25,
    "Multi-tray inverse height",
  );
  for (const trayNumber of [1, 3, 10]) {
    for (const trayHeight of [15, 25, 42.375]) {
      const systemHeight = calculateClosedOutsideHeight(
        calculateBaseHeight(trayHeight, trayNumber),
        13,
      );
      assertClose(
        calculateTrayOutsideHeightFromSystemHeight(systemHeight, trayNumber),
        trayHeight,
        "Height round trip",
      );
    }
  }

  // Representative open and lidded tray flows.
  const openOutside = calculateOutsideLed(outsideBase);
  const openUsable = calculateUsableSpaceLed(usableBase);
  const lidOutside = calculateOutsideLed({ ...outsideBase, trayType: "lid" });
  const lidUsable = calculateUsableSpaceLed({
    ...usableBase,
    trayType: "lid",
    heights: { usableTrayHeight: 18.5 },
  });
  for (const result of [openOutside, openUsable, lidOutside, lidUsable]) {
    assert(
      result.tray && result.heights,
      "Open/lidded flow must produce tray and height results.",
    );
    assertClose(result.box.outsideHeight, 85, "Complete system height");
    assertClose(result.heights.trayOutsideHeight, 25, "Derived tray height");
  }

  // Equal grid: outside-led, compartment-usable-led, and maximum integration capacity.
  const equalOutside = calculateOutsideLed({
    ...outsideBase,
    trayType: "dividers",
    dividerLayout: "equal",
    rows: 3,
    columns: 4,
  });
  const equalUsable = calculateUsableSpaceLed({
    ...usableBase,
    trayType: "dividers",
    dividerLayout: "equal",
    rows: 3,
    columns: 4,
    width: 30,
    depth: 20,
    heights: { usableTrayHeight: 18.5 },
  });
  assert(
    equalOutside.compartment && equalOutside.dividers,
    "Outside-led equal grid must produce compartments and dividers.",
  );
  assert(
    equalUsable.compartment && equalUsable.dividers,
    "Usable-led equal grid must produce compartments and dividers.",
  );
  assertClose(equalUsable.compartment.width, 30, "Usable-led compartment width");
  assertClose(equalUsable.compartment.depth, 20, "Usable-led compartment depth");

  const maximumGrid = calculateOutsideLed({
    ...outsideBase,
    trayType: "dividers",
    dividerLayout: "equal",
    rows: 4,
    columns: 6,
  });
  assert(
    maximumGrid.dividers?.verticalPositions.length === 5,
    "Maximum grid must contain five vertical dividers.",
  );
  assert(
    maximumGrid.dividers?.horizontalPositions.length === 3,
    "Maximum grid must contain three horizontal dividers.",
  );
  const maximumMakerWorld = generateMakerWorldParameters(maximumGrid);
  assert(
    maximumMakerWorld.groups.flatMap((group) => group.parameters).length === 21,
    "MakerWorld output must contain all 21 parameters.",
  );

  // Asymmetric custom layout, outside-led. Final percentages represent calculated remainders.
  const customOutside = calculateOutsideLed({
    ...outsideBase,
    trayType: "dividers",
    dividerLayout: "custom",
    rows: 2,
    columns: 3,
    customLayout: {
      columnPercentages: [25, 35, 40],
      rowPercentages: [40, 60],
    },
  });
  assert(
    customOutside.layoutSegments && customOutside.dividers,
    "Outside-led custom layout must produce segment dimensions and dividers.",
  );
  assert(
    JSON.stringify(customOutside.layoutSegments.usableColumnWidths) ===
      JSON.stringify([34.55, 48.37, 55.28]),
    "Outside-led custom column widths changed unexpectedly.",
  );
  assert(
    JSON.stringify(customOutside.layoutSegments.usableRowDepths) ===
      JSON.stringify([33.24, 49.86]),
    "Outside-led custom row depths changed unexpectedly.",
  );
  assert(
    JSON.stringify(customOutside.dividers.verticalPositions) ===
      JSON.stringify([0.25, 0.604219]),
    "Outside-led custom vertical ratios changed unexpectedly.",
  );
  assert(
    JSON.stringify(customOutside.dividers.horizontalToggles) ===
      JSON.stringify([1, 0, 0]),
    "Outside-led custom horizontal toggles changed unexpectedly.",
  );

  // Asymmetric custom layout, usable-led.
  const customUsable = calculateUsableSpaceLed({
    ...usableBase,
    trayType: "dividers",
    dividerLayout: "custom",
    rows: 2,
    columns: 3,
    heights: { usableTrayHeight: 18.5 },
    customLayout: {
      usableColumnWidths: [30, 45, 60],
      usableRowDepths: [40, 70],
    },
  });
  assert(
    customUsable.layoutSegments && customUsable.dividers && customUsable.tray,
    "Usable-led custom layout must produce a complete result.",
  );
  assertClose(customUsable.tray.usableWidth, 139, "Custom usable tray width");
  assertClose(customUsable.tray.usableDepth, 112, "Custom usable tray depth");
  assert(
    JSON.stringify(customUsable.dividers.verticalPositions) ===
      JSON.stringify([0.223022, 0.561151]),
    "Usable-led custom vertical ratios changed unexpectedly.",
  );
  assert(
    JSON.stringify(customUsable.dividers.verticalToggles) ===
      JSON.stringify([1, 1, 0, 0, 0]),
    "Usable-led custom toggles changed unexpectedly.",
  );

  // Validation and no-silent-truncation safeguards.
  expectRejected(
    () =>
      calculateOutsideLed({
        ...outsideBase,
        heights: { systemOutsideHeight: 54.999 },
      }),
    "System outside height must be at least 55 mm",
  );
  expectRejected(
    () =>
      calculateOutsideLed({
        ...outsideBase,
        trayType: "dividers",
        dividerLayout: "equal",
        rows: 5,
      }),
    "Rows must be between 1 and 4",
  );
  expectRejected(
    () =>
      calculateOutsideLed({
        ...outsideBase,
        trayType: "dividers",
        dividerLayout: "custom",
        rows: 2,
        columns: 3,
        customLayout: {
          columnPercentages: [25, 35, 39],
          rowPercentages: [40, 60],
        },
      }),
    "Column percentages must total 100%",
  );
  expectRejected(
    () =>
      calculateUsableSpaceLed({
        ...usableBase,
        trayType: "dividers",
        dividerLayout: "custom",
        rows: 2,
        columns: 3,
        customLayout: {
          usableColumnWidths: [30, 0, 60],
          usableRowDepths: [40, 70],
        },
      }),
    "Column width must be greater than zero",
  );

  const customMakerWorld = generateMakerWorldParameters(customOutside);
  const parameterByName = new Map(
    customMakerWorld.groups
      .flatMap((group) => group.parameters)
      .map((parameter) => [parameter.name, parameter.value]),
  );
  assertClose(
    parameterByName.get("dividerV1") ?? -1,
    customOutside.dividers.verticalPositions[0],
    "MakerWorld dividerV1",
  );
  assertClose(
    parameterByName.get("toggleV2") ?? -1,
    customOutside.dividers.verticalToggles[1],
    "MakerWorld toggleV2",
  );
}
