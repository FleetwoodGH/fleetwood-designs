import {
  calculateBaseHeight,
  calculateClosedOutsideHeight,
  calculateOutsideLed,
  calculatePrintInPlaceCompartmentBox,
  calculatePrintInPlaceStorageBox,
  calculateStorageBoxLidBase,
  calculateTrayOutsideHeightFromSystemHeight,
  calculateUsableSpaceLed,
} from "@/lib/engineering/calculations";
import {
  generateMakerWorldParameters,
  generatePrintInPlaceCompartmentBoxParameters,
  generatePrintInPlaceStorageBoxParameters,
  PRINT_IN_PLACE_COMPARTMENT_BOX_PARAMETER_ORDER,
  generateStorageBoxLidBaseParameters,
} from "@/lib/engineering/makerworld";
import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";

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
    rows: 6,
    columns: 6,
  });
  assert(
    maximumGrid.dividers?.verticalPositions.length === 5,
    "Maximum grid must contain five vertical dividers.",
  );
  assert(
    maximumGrid.dividers?.horizontalPositions.length === 5,
    "Maximum grid must contain five horizontal dividers.",
  );
  assert(
    JSON.stringify(maximumGrid.dividers.horizontalCentrePositions) ===
      JSON.stringify([13.517, 28.033, 42.55, 57.067, 71.583]),
    "Maximum grid horizontal divider centres changed unexpectedly.",
  );
  assert(
    JSON.stringify(maximumGrid.dividers.horizontalPositions) ===
      JSON.stringify([0.158833, 0.329416, 0.5, 0.670584, 0.841167]),
    "Maximum grid horizontal divider ratios changed unexpectedly.",
  );
  assert(
    JSON.stringify(maximumGrid.dividers.horizontalToggles) ===
      JSON.stringify([1, 1, 1, 1, 1]),
    "Maximum grid must activate all five horizontal dividers.",
  );
  const maximumMakerWorld = generateMakerWorldParameters(maximumGrid);
  assert(
    maximumMakerWorld.groups.flatMap((group) => group.parameters).length === 25,
    "MakerWorld output must contain all 25 parameters.",
  );
  const maximumParameterByName = new Map(
    maximumMakerWorld.groups
      .flatMap((group) => group.parameters)
      .map((parameter) => [parameter.name, parameter.value]),
  );
  maximumGrid.dividers.horizontalPositions.forEach((position, index) => {
    assertClose(
      maximumParameterByName.get(`dividerH${index + 1}`) ?? -1,
      Number(position.toFixed(3)),
      `Maximum-grid MakerWorld dividerH${index + 1}`,
    );
    assertClose(
      maximumParameterByName.get(`toggleH${index + 1}`) ?? -1,
      1,
      `Maximum-grid MakerWorld toggleH${index + 1}`,
    );
  });

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
      JSON.stringify([1, 0, 0, 0, 0]),
    "Outside-led custom horizontal toggles changed unexpectedly.",
  );

  const sixRowCustomOutside = calculateOutsideLed({
    ...outsideBase,
    trayType: "dividers",
    dividerLayout: "custom",
    rows: 6,
    columns: 3,
    customLayout: {
      columnPercentages: [25, 35, 40],
      rowPercentages: [10, 15, 20, 12, 18, 25],
    },
  });
  assert(
    sixRowCustomOutside.layoutSegments && sixRowCustomOutside.dividers,
    "Six-row outside-led custom layout must produce a complete result.",
  );
  assert(
    JSON.stringify(sixRowCustomOutside.layoutSegments.usableRowDepths) ===
      JSON.stringify([7.51, 11.265, 15.02, 9.012, 13.518, 18.775]),
    "Six-row outside-led row depths changed unexpectedly.",
  );
  assert(
    JSON.stringify(sixRowCustomOutside.dividers.horizontalCentrePositions) ===
      JSON.stringify([8.51, 21.775, 38.795, 49.807, 65.325]),
    "Six-row outside-led horizontal centres changed unexpectedly.",
  );
  assert(
    JSON.stringify(sixRowCustomOutside.dividers.horizontalPositions) ===
      JSON.stringify([0.1, 0.255875, 0.455875, 0.585276, 0.767626]),
    "Six-row outside-led horizontal ratios changed unexpectedly.",
  );
  assert(
    JSON.stringify(sixRowCustomOutside.dividers.horizontalToggles) ===
      JSON.stringify([1, 1, 1, 1, 1]),
    "Six-row outside-led custom layout must activate five dividers.",
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

  const sixRowCustomUsable = calculateUsableSpaceLed({
    ...usableBase,
    trayType: "dividers",
    dividerLayout: "custom",
    rows: 6,
    columns: 3,
    heights: { usableTrayHeight: 18.5 },
    customLayout: {
      usableColumnWidths: [30, 45, 60],
      usableRowDepths: [10, 15, 20, 12, 18, 25],
    },
  });
  assert(
    sixRowCustomUsable.layoutSegments &&
      sixRowCustomUsable.dividers &&
      sixRowCustomUsable.tray,
    "Six-row usable-led custom layout must produce a complete result.",
  );
  assertClose(
    sixRowCustomUsable.tray.usableDepth,
    110,
    "Six-row custom usable tray depth",
  );
  assertClose(
    sixRowCustomUsable.box.outsideDepth,
    124.9,
    "Six-row custom system outside depth",
  );
  assert(
    JSON.stringify(sixRowCustomUsable.dividers.horizontalCentrePositions) ===
      JSON.stringify([11, 28, 50, 64, 84]),
    "Six-row usable-led horizontal centres changed unexpectedly.",
  );
  assert(
    JSON.stringify(sixRowCustomUsable.dividers.horizontalPositions) ===
      JSON.stringify([0.1, 0.254545, 0.454545, 0.581818, 0.763636]),
    "Six-row usable-led horizontal ratios changed unexpectedly.",
  );
  assert(
    JSON.stringify(sixRowCustomUsable.dividers.horizontalToggles) ===
      JSON.stringify([1, 1, 1, 1, 1]),
    "Six-row usable-led custom layout must activate five dividers.",
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
        rows: 7,
      }),
    "Rows must be between 1 and 6",
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
  for (const index of [1, 2, 3, 4]) {
    assertClose(
      parameterByName.get(`dividerH${index + 1}`) ?? -1,
      0,
      `Unused MakerWorld dividerH${index + 1}`,
    );
    assertClose(
      parameterByName.get(`toggleH${index + 1}`) ?? -1,
      0,
      `Unused MakerWorld toggleH${index + 1}`,
    );
  }

  for (const [name, result] of [
    ["outside-led", sixRowCustomOutside],
    ["usable-led", sixRowCustomUsable],
  ] as const) {
    assert(result.dividers, `Six-row ${name} result must contain dividers.`);
    const mappedParameters = new Map(
      generateMakerWorldParameters(result).groups
        .flatMap((group) => group.parameters)
        .map((parameter) => [parameter.name, parameter.value]),
    );
    result.dividers.horizontalPositions.forEach((position, index) => {
      assertClose(
        mappedParameters.get(`dividerH${index + 1}`) ?? -1,
        Number(position.toFixed(3)),
        `Six-row ${name} MakerWorld dividerH${index + 1}`,
      );
      assertClose(
        mappedParameters.get(`toggleH${index + 1}`) ?? -1,
        1,
        `Six-row ${name} MakerWorld toggleH${index + 1}`,
      );
    });
  }

  // Storage Box — Custom Lid & Base: forward, inverse, boundaries and mapping.
  const storageBoxOutside = calculateStorageBoxLidBase({
    strategy: "outside-led",
    dimensions: {
      width: 125,
      depth: 80,
      baseHeight: 57,
      lidHeight: 15,
    },
  });
  assertClose(storageBoxOutside.usable.width, 117, "Storage box usable width");
  assertClose(storageBoxOutside.usable.depth, 70.9, "Storage box usable depth");
  assertClose(
    storageBoxOutside.usable.baseHeight,
    55,
    "Storage box usable base height",
  );
  assertClose(
    storageBoxOutside.usable.lidHeight,
    8.9,
    "Storage box usable lid height",
  );

  const storageBoxUsable = calculateStorageBoxLidBase({
    strategy: "usable-space-led",
    dimensions: {
      width: 117,
      depth: 70.9,
      baseHeight: 55,
      lidHeight: 8.9,
    },
  });
  assertClose(storageBoxUsable.outside.width, 125, "Storage box outside width");
  assertClose(storageBoxUsable.outside.depth, 80, "Storage box outside depth");
  assertClose(
    storageBoxUsable.outside.baseHeight,
    57,
    "Storage box outside base height",
  );
  assertClose(
    storageBoxUsable.outside.lidHeight,
    15,
    "Storage box outside lid height",
  );
  assertClose(
    storageBoxUsable.totalOutsideHeight,
    72,
    "Storage box total outside height",
  );
  for (const key of ["width", "depth", "baseHeight", "lidHeight"] as const) {
    assertClose(
      storageBoxUsable.outside[key],
      storageBoxOutside.outside[key],
      `Storage box outside round trip ${key}`,
    );
  }

  for (const dimensions of [
    { width: 95, depth: 25, baseHeight: 17, lidHeight: 13 },
    { width: 200, depth: 140, baseHeight: 80, lidHeight: 25 },
    { width: 350, depth: 350, baseHeight: 350, lidHeight: 350 },
  ]) {
    const outsideResult = calculateStorageBoxLidBase({
      strategy: "outside-led",
      dimensions,
    });
    const usableResult = calculateStorageBoxLidBase({
      strategy: "usable-space-led",
      dimensions: outsideResult.usable,
    });
    for (const key of ["width", "depth", "baseHeight", "lidHeight"] as const) {
      assertClose(
        usableResult.outside[key],
        outsideResult.outside[key],
        `Storage box boundary round trip ${key}`,
      );
      assertClose(
        outsideResult.usable[key],
        usableResult.usable[key],
        `Storage box usable boundary round trip ${key}`,
      );
    }
  }

  const storageBoxMinimum = calculateStorageBoxLidBase({
    strategy: "outside-led",
    dimensions: { width: 95, depth: 25, baseHeight: 17, lidHeight: 13 },
  });
  assertClose(
    storageBoxMinimum.usable.baseHeight,
    15,
    "Minimum usable base height",
  );
  assertClose(
    storageBoxMinimum.usable.lidHeight,
    6.9,
    "Minimum usable lid height",
  );
  assertClose(
    storageBoxMinimum.usable.depth,
    15.9,
    "Minimum usable depth",
  );

  const storageBoxMaximum = calculateStorageBoxLidBase({
    strategy: "outside-led",
    dimensions: {
      width: 350,
      depth: 350,
      baseHeight: 350,
      lidHeight: 350,
    },
  });
  assertClose(
    storageBoxMaximum.usable.baseHeight,
    348,
    "Maximum usable base height",
  );
  assertClose(
    storageBoxMaximum.usable.lidHeight,
    343.9,
    "Maximum usable lid height",
  );
  assertClose(
    storageBoxMaximum.usable.depth,
    340.9,
    "Maximum usable depth",
  );

  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "outside-led",
        dimensions: { width: 94.999, depth: 80, baseHeight: 57, lidHeight: 13 },
      }),
    "Minimum supported box width is 95 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "outside-led",
        dimensions: { width: 351, depth: 80, baseHeight: 57, lidHeight: 13 },
      }),
    "Maximum supported box width is 350 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "usable-space-led",
        dimensions: {
          width: 86.999,
          depth: 70.9,
          baseHeight: 55,
          lidHeight: 8.9,
        },
      }),
    "Minimum supported usable box width is 87 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "usable-space-led",
        dimensions: {
          width: 343,
          depth: 70.9,
          baseHeight: 55,
          lidHeight: 8.9,
        },
      }),
    "Maximum supported usable box width is 342 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "outside-led",
        dimensions: { width: 125, depth: 80, baseHeight: 16.999, lidHeight: 15 },
      }),
    "Minimum supported base outside height is 17 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "outside-led",
        dimensions: { width: 125, depth: 80, baseHeight: 351, lidHeight: 15 },
      }),
    "Maximum supported base outside height is 350 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "outside-led",
        dimensions: { width: 125, depth: 80, baseHeight: 57, lidHeight: 12.999 },
      }),
    "Minimum supported lid outside height is 13 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "outside-led",
        dimensions: { width: 125, depth: 80, baseHeight: 57, lidHeight: 351 },
      }),
    "Maximum supported lid outside height is 350 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "usable-space-led",
        dimensions: {
          width: 117,
          depth: 70.9,
          baseHeight: 14.999,
          lidHeight: 8.9,
        },
      }),
    "Minimum supported usable base height is 15 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "usable-space-led",
        dimensions: {
          width: 117,
          depth: 70.9,
          baseHeight: 349,
          lidHeight: 8.9,
        },
      }),
    "Maximum supported usable base height is 348 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "usable-space-led",
        dimensions: {
          width: 117,
          depth: 70.9,
          baseHeight: 55,
          lidHeight: 6.899,
        },
      }),
    "Minimum supported usable lid height is 6.9 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "usable-space-led",
        dimensions: {
          width: 117,
          depth: 70.9,
          baseHeight: 55,
          lidHeight: 344,
        },
      }),
    "Maximum supported usable lid height is 343.9 mm",
  );

  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "usable-space-led",
        dimensions: {
          width: 117,
          depth: 15.899,
          baseHeight: 55,
          lidHeight: 8.9,
        },
      }),
    "Minimum supported usable box depth is 15.9 mm",
  );
  expectRejected(
    () =>
      calculateStorageBoxLidBase({
        strategy: "usable-space-led",
        dimensions: {
          width: 117,
          depth: 341,
          baseHeight: 55,
          lidHeight: 8.9,
        },
      }),
    "Maximum supported usable box depth is 340.9 mm",
  );

  const storageBoxParameters = generateStorageBoxLidBaseParameters(
    storageBoxOutside,
  ).groups.flatMap((group) => group.parameters);
  assert(
    JSON.stringify(storageBoxParameters.map((parameter) => parameter.name)) ===
      JSON.stringify(["boxWidth", "boxDepth", "baseHeight", "lidHeight"]),
    "Storage box MakerWorld parameter order changed unexpectedly.",
  );
  assert(
    JSON.stringify(storageBoxParameters.map((parameter) => parameter.value)) ===
      JSON.stringify([125, 80, 57, 15]),
    "Storage box MakerWorld parameter values changed unexpectedly.",
  );

  // Print-in-Place Storage Box: derived limits, forward/inverse calculations,
  // round trips, validation and MakerWorld mapping.
  const printInPlaceLimits = ENGINEERING_LIMITS.printInPlaceStorageBox;
  assertClose(printInPlaceLimits.usable.width.minimum, 82, "Print-in-place minimum usable width");
  assertClose(printInPlaceLimits.usable.width.maximum, 340, "Print-in-place maximum usable width");
  assertClose(printInPlaceLimits.usable.depth.minimum, 15.9, "Print-in-place minimum usable depth");
  assertClose(printInPlaceLimits.usable.depth.maximum, 340.9, "Print-in-place maximum usable depth");
  assertClose(printInPlaceLimits.usable.height.minimum, 26.9, "Print-in-place minimum usable height");
  assertClose(printInPlaceLimits.usable.height.maximum, 341.9, "Print-in-place maximum usable height");

  const printInPlaceOutside = calculatePrintInPlaceStorageBox({
    strategy: "outside-led",
    dimensions: { width: 125, depth: 80, height: 40 },
  });
  assertClose(printInPlaceOutside.usable.width, 115, "Print-in-place usable width");
  assertClose(printInPlaceOutside.usable.depth, 70.9, "Print-in-place usable depth");
  assertClose(printInPlaceOutside.usable.height, 31.9, "Print-in-place usable height");

  const printInPlaceUsable = calculatePrintInPlaceStorageBox({
    strategy: "usable-space-led",
    dimensions: { width: 115, depth: 70.9, height: 31.9 },
  });
  assertClose(printInPlaceUsable.outside.width, 125, "Print-in-place outside width");
  assertClose(printInPlaceUsable.outside.depth, 80, "Print-in-place outside depth");
  assertClose(printInPlaceUsable.outside.height, 40, "Print-in-place outside height");

  for (const outsideDimensions of [
    { width: 92, depth: 25, height: 35 },
    { width: 125, depth: 80, height: 40 },
    { width: 350, depth: 350, height: 350 },
  ]) {
    const outsideResult = calculatePrintInPlaceStorageBox({
      strategy: "outside-led",
      dimensions: outsideDimensions,
    });
    const usableResult = calculatePrintInPlaceStorageBox({
      strategy: "usable-space-led",
      dimensions: outsideResult.usable,
    });

    for (const key of ["width", "depth", "height"] as const) {
      assertClose(
        usableResult.outside[key],
        outsideResult.outside[key],
        `Print-in-place outside round trip ${key}`,
      );
      assertClose(
        usableResult.usable[key],
        outsideResult.usable[key],
        `Print-in-place usable round trip ${key}`,
      );
    }
  }

  expectRejected(
    () =>
      calculatePrintInPlaceStorageBox({
        strategy: "outside-led",
        dimensions: { width: 92, depth: 25, height: 34.999 },
      }),
    "Minimum supported box height is 35 mm",
  );
  expectRejected(
    () =>
      calculatePrintInPlaceStorageBox({
        strategy: "usable-space-led",
        dimensions: { width: 82, depth: 15.9, height: 26.899 },
      }),
    "Minimum supported usable height is 26.9 mm",
  );

  const printInPlaceParameters = generatePrintInPlaceStorageBoxParameters(
    printInPlaceOutside,
  ).groups.flatMap((group) => group.parameters);
  assert(
    JSON.stringify(printInPlaceParameters.map((parameter) => parameter.name)) ===
      JSON.stringify(["boxWidth", "boxDepth", "boxHeight"]),
    "Print-in-place MakerWorld parameter order changed unexpectedly.",
  );
  assert(
    JSON.stringify(printInPlaceParameters.map((parameter) => parameter.value)) ===
      JSON.stringify([125, 80, 40]),
    "Print-in-place MakerWorld parameter values changed unexpectedly.",
  );
  assert(
    JSON.stringify(printInPlaceParameters.map((parameter) => parameter.displayValue)) ===
      JSON.stringify(["125.00", "80.00", "40.00"]),
    "Print-in-place MakerWorld parameter formatting changed unexpectedly.",
  );

  // Print-in-Place Storage Box with Compartments: shared box constraints,
  // independent half layouts, full separator capacity and exact mapping.
  const compartmentBoxLimits =
    ENGINEERING_LIMITS.printInPlaceStorageBoxCompartments;
  assertClose(
    compartmentBoxLimits.usable.width.minimum,
    84,
    "Compartment box minimum usable width",
  );
  assertClose(
    compartmentBoxLimits.usable.width.maximum,
    292,
    "Compartment box maximum usable width",
  );
  assertClose(
    compartmentBoxLimits.usable.depth.minimum,
    15.9,
    "Compartment box minimum usable depth",
  );
  assertClose(
    compartmentBoxLimits.usable.depth.maximum,
    290.9,
    "Compartment box maximum usable depth",
  );
  assertClose(
    compartmentBoxLimits.usable.baseHeight.maximum,
    144,
    "Compartment box maximum usable base height",
  );
  assertClose(
    compartmentBoxLimits.usable.lidHeight.maximum,
    141.9,
    "Compartment box maximum usable lid height",
  );
  assert(
    compartmentBoxLimits.grid.maximumColumns === 7 &&
      compartmentBoxLimits.grid.maximumRows === 5,
    "Compartment box grid capacity changed unexpectedly.",
  );

  const maximumEqualLayout = {
    method: "equal" as const,
    rows: 5,
    columns: 7,
  };
  const compartmentBoxOutside = calculatePrintInPlaceCompartmentBox({
    strategy: "outside-led",
    dimensions: { width: 125, depth: 80, height: 40 },
    baseLayout: maximumEqualLayout,
    lidLayout: { mode: "same-as-base" },
  });
  assertClose(compartmentBoxOutside.usable.width, 117, "Compartment usable width");
  assertClose(compartmentBoxOutside.usable.depth, 70.9, "Compartment usable depth");
  assertClose(
    compartmentBoxOutside.usable.baseHeight,
    14,
    "Compartment usable base height",
  );
  assertClose(
    compartmentBoxOutside.usable.lidHeight,
    11.9,
    "Compartment usable lid height",
  );
  assert(
    compartmentBoxOutside.baseLayout.dividers.verticalPositions.length === 6 &&
      compartmentBoxOutside.baseLayout.dividers.horizontalPositions.length === 4,
    "Maximum compartment grid must create 6 vertical and 4 horizontal separators.",
  );
  assert(
    compartmentBoxOutside.baseLayout.dividers.verticalToggles.every(
      (toggle) => toggle === 1,
    ) &&
      compartmentBoxOutside.baseLayout.dividers.horizontalToggles.every(
        (toggle) => toggle === 1,
      ),
    "Maximum compartment grid must activate every separator slot.",
  );
  assert(
    compartmentBoxOutside.lidLayout === compartmentBoxOutside.baseLayout,
    "Same-layout lid must reuse the base engineering layout result.",
  );

  const compartmentBoxHeight50 = calculatePrintInPlaceCompartmentBox({
    strategy: "outside-led",
    dimensions: { width: 125, depth: 80, height: 50 },
    baseLayout: { method: "equal", rows: 1, columns: 1 },
    lidLayout: { mode: "same-as-base" },
  });
  assertClose(
    compartmentBoxHeight50.usable.baseHeight,
    19,
    "50 mm box usable base height",
  );
  assertClose(
    compartmentBoxHeight50.usable.lidHeight,
    16.9,
    "50 mm box usable lid height",
  );

  const compartmentBoxHeight70 = calculatePrintInPlaceCompartmentBox({
    strategy: "outside-led",
    dimensions: { width: 125, depth: 60, height: 70 },
    baseLayout: { method: "equal", rows: 1, columns: 1 },
    lidLayout: { mode: "same-as-base" },
  });
  assertClose(
    compartmentBoxHeight70.usable.depth,
    50.9,
    "60 mm box usable depth",
  );
  assertClose(
    compartmentBoxHeight70.usable.baseHeight,
    29,
    "70 mm box usable base height",
  );
  assertClose(
    compartmentBoxHeight70.usable.lidHeight,
    26.9,
    "70 mm box usable lid height",
  );

  const representativeRoundTrip = calculatePrintInPlaceCompartmentBox({
    strategy: "usable-space-led",
    requiredHeights: { base: 19, lid: 16.9 },
    baseLayout: {
      method: "equal",
      rows: 1,
      columns: 1,
      requiredCompartmentWidth: 117,
      requiredCompartmentDepth: 50.9,
    },
    lidLayout: { mode: "same-as-base" },
  });
  assertClose(representativeRoundTrip.outside.width, 125, "Round-trip box width");
  assertClose(representativeRoundTrip.outside.depth, 60, "Round-trip box depth");
  assertClose(representativeRoundTrip.outside.height, 50, "Round-trip box height");
  assertClose(
    representativeRoundTrip.usable.depth,
    50.9,
    "Round-trip usable depth",
  );
  assertClose(
    representativeRoundTrip.makerWorldInputs.boxDepth,
    60,
    "MakerWorld must receive the nominal box depth",
  );

  for (const boundary of [
    {
      label: "minimum",
      outside: { width: 92, depth: 25, height: 35 },
      usable: { width: 84, depth: 15.9, baseHeight: 11.5, lidHeight: 9.4 },
    },
    {
      label: "maximum",
      outside: { width: 300, depth: 300, height: 300 },
      usable: { width: 292, depth: 290.9, baseHeight: 144, lidHeight: 141.9 },
    },
  ]) {
    const outsideToUsable = calculatePrintInPlaceCompartmentBox({
      strategy: "outside-led",
      dimensions: boundary.outside,
      baseLayout: { method: "equal", rows: 1, columns: 1 },
      lidLayout: { mode: "same-as-base" },
    });
    assertClose(
      outsideToUsable.usable.depth,
      boundary.usable.depth,
      `${boundary.label} outside-to-usable depth`,
    );

    const usableToOutside = calculatePrintInPlaceCompartmentBox({
      strategy: "usable-space-led",
      requiredHeights: {
        base: boundary.usable.baseHeight,
        lid: boundary.usable.lidHeight,
      },
      baseLayout: {
        method: "equal",
        rows: 1,
        columns: 1,
        requiredCompartmentWidth: boundary.usable.width,
        requiredCompartmentDepth: boundary.usable.depth,
      },
      lidLayout: { mode: "same-as-base" },
    });
    assertClose(
      usableToOutside.outside.width,
      boundary.outside.width,
      `${boundary.label} usable-to-outside width`,
    );
    assertClose(
      usableToOutside.outside.depth,
      boundary.outside.depth,
      `${boundary.label} usable-to-outside depth`,
    );
    assertClose(
      usableToOutside.outside.height,
      boundary.outside.height,
      `${boundary.label} usable-to-outside height`,
    );
  }

  const separateEqualLayouts = calculatePrintInPlaceCompartmentBox({
    strategy: "outside-led",
    dimensions: { width: 125, depth: 80, height: 40 },
    baseLayout: { method: "equal", rows: 2, columns: 3 },
    lidLayout: {
      mode: "separate",
      layout: { method: "equal", rows: 4, columns: 2 },
    },
  });
  assert(
    separateEqualLayouts.baseLayout.dividers.verticalPositions.length === 2 &&
      separateEqualLayouts.baseLayout.dividers.horizontalPositions.length === 1 &&
      separateEqualLayouts.lidLayout.dividers.verticalPositions.length === 1 &&
      separateEqualLayouts.lidLayout.dividers.horizontalPositions.length === 3,
    "Separate equal-grid layouts must remain independent.",
  );

  const asymmetricCustomLayouts = calculatePrintInPlaceCompartmentBox({
    strategy: "outside-led",
    dimensions: { width: 125, depth: 80, height: 40 },
    baseLayout: {
      method: "custom",
      rows: 2,
      columns: 3,
      columnPercentages: [20, 30, 50],
      rowPercentages: [40, 60],
    },
    lidLayout: {
      mode: "separate",
      layout: {
        method: "custom",
        rows: 3,
        columns: 2,
        columnPercentages: [60, 40],
        rowPercentages: [20, 30, 50],
      },
    },
  });
  assertClose(
    asymmetricCustomLayouts.baseLayout.dividers.verticalPositions[0],
    0.201709,
    "Custom base first vertical position",
  );
  assertClose(
    asymmetricCustomLayouts.baseLayout.dividers.verticalPositions[1],
    0.508547,
    "Custom base second vertical position",
  );
  assertClose(
    asymmetricCustomLayouts.baseLayout.dividers.horizontalPositions[0],
    0.402817,
    "Custom base first horizontal position",
  );
  assert(
    JSON.stringify(
      asymmetricCustomLayouts.baseLayout.dividers.verticalToggles,
    ) === JSON.stringify([1, 1, 0, 0, 0, 0]) &&
      JSON.stringify(
        asymmetricCustomLayouts.baseLayout.dividers.horizontalToggles,
      ) === JSON.stringify([1, 0, 0, 0]),
    "Custom base separator slots must be zero-filled.",
  );

  function equalRequiredLayout(
    rows: number,
    columns: number,
    width: number,
    depth: number,
  ) {
    return {
      method: "equal" as const,
      rows,
      columns,
      requiredCompartmentWidth: width,
      requiredCompartmentDepth: depth,
    };
  }

  const baseDeterminesWidth = calculatePrintInPlaceCompartmentBox({
    strategy: "usable-space-led",
    requiredHeights: { base: 10, lid: 10 },
    baseLayout: equalRequiredLayout(1, 3, 40, 20),
    lidLayout: {
      mode: "separate",
      layout: equalRequiredLayout(1, 2, 30, 20),
    },
  });
  assertClose(baseDeterminesWidth.outside.width, 132, "Base-led box width");

  const lidDeterminesWidth = calculatePrintInPlaceCompartmentBox({
    strategy: "usable-space-led",
    requiredHeights: { base: 10, lid: 10 },
    baseLayout: equalRequiredLayout(1, 2, 30, 20),
    lidLayout: {
      mode: "separate",
      layout: equalRequiredLayout(1, 3, 40, 20),
    },
  });
  assertClose(lidDeterminesWidth.outside.width, 132, "Lid-led box width");

  const baseDeterminesDepth = calculatePrintInPlaceCompartmentBox({
    strategy: "usable-space-led",
    requiredHeights: { base: 10, lid: 10 },
    baseLayout: equalRequiredLayout(3, 1, 20, 20),
    lidLayout: {
      mode: "separate",
      layout: equalRequiredLayout(1, 1, 20, 20),
    },
  });
  assertClose(baseDeterminesDepth.outside.depth, 73.1, "Base-led box depth");

  const lidDeterminesDepth = calculatePrintInPlaceCompartmentBox({
    strategy: "usable-space-led",
    requiredHeights: { base: 10, lid: 10 },
    baseLayout: equalRequiredLayout(1, 1, 20, 20),
    lidLayout: {
      mode: "separate",
      layout: equalRequiredLayout(3, 1, 20, 20),
    },
  });
  assertClose(lidDeterminesDepth.outside.depth, 73.1, "Lid-led box depth");

  const baseDeterminesHeight = calculatePrintInPlaceCompartmentBox({
    strategy: "usable-space-led",
    requiredHeights: { base: 20, lid: 10 },
    baseLayout: equalRequiredLayout(1, 1, 84, 16),
    lidLayout: { mode: "same-as-base" },
  });
  assertClose(baseDeterminesHeight.outside.height, 52, "Base-led box height");
  assertClose(baseDeterminesHeight.usable.baseHeight, 20, "Requested base height");
  assertClose(baseDeterminesHeight.usable.lidHeight, 17.9, "Resulting lid height");

  const lidDeterminesHeight = calculatePrintInPlaceCompartmentBox({
    strategy: "usable-space-led",
    requiredHeights: { base: 10, lid: 20 },
    baseLayout: equalRequiredLayout(1, 1, 84, 16),
    lidLayout: { mode: "same-as-base" },
  });
  assertClose(lidDeterminesHeight.outside.height, 56.2, "Lid-led box height");
  assertClose(lidDeterminesHeight.usable.baseHeight, 22.1, "Resulting base height");
  assertClose(lidDeterminesHeight.usable.lidHeight, 20, "Requested lid height");

  const requiredCustomLayouts = calculatePrintInPlaceCompartmentBox({
    strategy: "usable-space-led",
    requiredHeights: { base: 20, lid: 18 },
    baseLayout: {
      method: "custom",
      rows: 2,
      columns: 3,
      requiredColumnWidths: [30, 20, 40],
      requiredRowDepths: [20, 30],
    },
    lidLayout: {
      mode: "separate",
      layout: {
        method: "custom",
        rows: 3,
        columns: 2,
        requiredColumnWidths: [25, 35],
        requiredRowDepths: [15, 20, 25],
      },
    },
  });
  assertClose(requiredCustomLayouts.outside.width, 102, "Custom shared box width");
  assertClose(requiredCustomLayouts.outside.depth, 73.1, "Custom shared box depth");
  assert(
    requiredCustomLayouts.baseLayout.usableColumnWidths.every(
      (value, index) => value >= [30, 20, 40][index],
    ) &&
      requiredCustomLayouts.lidLayout.usableRowDepths.every(
        (value, index) => value >= [15, 20, 25][index],
      ),
    "Non-leading custom layouts must receive at least their requested usable sizes.",
  );

  const compartmentParameters =
    generatePrintInPlaceCompartmentBoxParameters(compartmentBoxOutside).groups.flatMap(
      (group) => group.parameters,
    );
  const compartmentParameterNames = compartmentParameters.map(
    (parameter) => parameter.name,
  );
  const exactCompartmentParameterOrder = [
    "boxWidth",
    "boxHeight",
    "boxDepth",
    "separatorV1",
    "separatorV2",
    "separatorV3",
    "separatorV4",
    "separatorV5",
    "separatorV1_position",
    "separatorV2_position",
    "separatorV3_position",
    "separatorV4_position",
    "separatorV5_position",
    "separatorH1",
    "separatorH2",
    "separatorH3",
    "separatorH1_position",
    "separatorH2_position",
    "separatorH3_position",
    "LIDseparatorV1",
    "LIDseparatorV2",
    "LIDseparatorV3",
    "LIDseparatorV4",
    "LIDseparatorV5",
    "LIDseparatorV1_position",
    "LIDseparatorV2_position",
    "LIDseparatorV3_position",
    "LIDseparatorV4_position",
    "LIDseparatorV5_position",
    "LIDseparatorH1",
    "LIDseparatorH2",
    "LIDseparatorH3",
    "LIDseparatorH1_position",
    "LIDseparatorH2_position",
    "LIDseparatorH3_position",
    "separatorV6",
    "separatorV6_position",
    "LIDseparatorV6",
    "LIDseparatorV6_position",
    "separatorH4",
    "separatorH4_position",
    "LIDseparatorH4",
    "LIDseparatorH4_position",
  ];
  assert(
    JSON.stringify(PRINT_IN_PLACE_COMPARTMENT_BOX_PARAMETER_ORDER) ===
      JSON.stringify(exactCompartmentParameterOrder),
    "Compartment parameter presentation constant must match Fusion creation order.",
  );
  assert(
    JSON.stringify(compartmentParameterNames) ===
      JSON.stringify(exactCompartmentParameterOrder),
    "Compartment MakerWorld parameter order changed unexpectedly.",
  );
  assert(
    new Set(compartmentParameterNames).size === compartmentParameterNames.length,
    "Every compartment MakerWorld parameter must appear exactly once.",
  );
  assert(
    compartmentParameters.length === 43,
    "Compartment MakerWorld mapping must contain all 43 parameters.",
  );
  const compartmentParameterMap = new Map(
    compartmentParameters.map((parameter) => [parameter.name, parameter]),
  );
  for (const axis of ["V", "H"] as const) {
    const count = axis === "V" ? 6 : 4;
    for (let index = 1; index <= count; index += 1) {
      for (const prefix of ["", "LID"] as const) {
        const toggle = compartmentParameterMap.get(
          `${prefix}separator${axis}${index}`,
        );
        const position = compartmentParameterMap.get(
          `${prefix}separator${axis}${index}_position`,
        );
        assert(toggle && position, "Expected separator mapping is missing.");
        assertClose(toggle.value, 1, "Maximum-grid separator toggle");
        assert(
          !position.displayValue.includes("000000000"),
          "Separator position contains a floating-point presentation artifact.",
        );
      }
    }
  }
}
