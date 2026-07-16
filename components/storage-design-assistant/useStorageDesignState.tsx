"use client";

import { useState } from "react";

import { calculateStorageDesign } from "@/lib/engineering/calculations";
import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";

import type {
  BuildType,
  CalculationState,
  DimensionStrategy,
  DimensionTarget,
  DividerLayout,
  TrayType,
} from "@/components/storage-design-assistant/types";

import type { CalculationInput } from "@/lib/engineering/types";

const MIN_WIDTH = 20;
const MIN_DEPTH = 20;
const MIN_HEIGHT = 10;

function isWholeNumber(value: string) {
  return value === "" || /^\d+$/.test(value);
}

export function useStorageDesignState() {
  const [buildType, setBuildType] = useState<BuildType>(null);
  const [trayType, setTrayType] = useState<TrayType>(null);
  const [dividerLayout, setDividerLayout] = useState<DividerLayout>(null);

  const [dimensionStrategy, setDimensionStrategy] =
    useState<DimensionStrategy>(null);

  const [trayNumber, setTrayNumber] = useState<number>(
    ENGINEERING_LIMITS.trays.minimum,
  );

  const [trayNumberConfirmed, setTrayNumberConfirmed] =
    useState<boolean>(false);

  const [rows, setRows] = useState<number>(2);
  const [columns, setColumns] = useState<number>(2);
  const [gridConfirmed, setGridConfirmed] = useState<boolean>(false);

  const [requestedWidth, setRequestedWidth] = useState<string>("");
  const [requestedDepth, setRequestedDepth] = useState<string>("");
  const [requestedHeight, setRequestedHeight] = useState<string>("");

  const equalGridSelected =
    trayType === "dividers" && dividerLayout === "equal";

  const customGridSelected =
    trayType === "dividers" && dividerLayout === "custom";

  const trayConfigurationComplete =
    buildType === "system" && trayType !== null && trayNumberConfirmed;

  const designPhaseComplete =
    buildType === "box" ||
    (trayConfigurationComplete && trayType !== "dividers") ||
    (trayConfigurationComplete && customGridSelected) ||
    (trayConfigurationComplete && equalGridSelected && gridConfirmed);

  const requestedWidthValue =
    requestedWidth === "" ? null : Number(requestedWidth);

  const requestedDepthValue =
    requestedDepth === "" ? null : Number(requestedDepth);

  const requestedHeightValue =
    requestedHeight === "" ? null : Number(requestedHeight);

  const widthIsValid =
    requestedWidthValue !== null &&
    Number.isInteger(requestedWidthValue) &&
    requestedWidthValue >= MIN_WIDTH;

  const depthIsValid =
    requestedDepthValue !== null &&
    Number.isInteger(requestedDepthValue) &&
    requestedDepthValue >= MIN_DEPTH;

  const heightIsValid =
    requestedHeightValue !== null &&
    Number.isInteger(requestedHeightValue) &&
    requestedHeightValue >= MIN_HEIGHT;

  const widthHasError = requestedWidth !== "" && !widthIsValid;
  const depthHasError = requestedDepth !== "" && !depthIsValid;
  const heightHasError = requestedHeight !== "" && !heightIsValid;

  const calculationState: CalculationState = (() => {
    if (
      !heightIsValid ||
      buildType === null ||
      dimensionStrategy === null ||
      requestedWidthValue === null ||
      requestedDepthValue === null ||
      requestedHeightValue === null
    ) {
      return {
        result: null,
        error: null,
      };
    }

    if (buildType === "system" && trayType === null) {
      return {
        result: null,
        error: null,
      };
    }

    if (trayType === "dividers" && dividerLayout === null) {
      return {
        result: null,
        error: null,
      };
    }

    const calculationInput: CalculationInput = {
      buildType,
      trayNumber,
      rows,
      columns,
      strategy: dimensionStrategy,
      width: requestedWidthValue,
      depth: requestedDepthValue,
      height: requestedHeightValue,
      ...(trayType !== null ? { trayType } : {}),
      ...(dividerLayout !== null ? { dividerLayout } : {}),
    };

    try {
      return {
        result: calculateStorageDesign(calculationInput),
        error: null,
      };
    } catch (error) {
      return {
        result: null,
        error:
          error instanceof Error
            ? error.message
            : "The engineering calculation could not be completed.",
      };
    }
  })();

  function resetHeight() {
    setRequestedHeight("");
  }

  function resetDepthAndHeight() {
    setRequestedDepth("");
    resetHeight();
  }

  function resetDimensionParameters() {
    setRequestedWidth("");
    resetDepthAndHeight();
  }

  function resetDimensions() {
    setDimensionStrategy(null);
    resetDimensionParameters();
  }

  function resetGrid() {
    setRows(2);
    setColumns(2);
    setGridConfirmed(false);
    resetDimensions();
  }

  function resetTrayConfiguration() {
    setTrayNumber(ENGINEERING_LIMITS.trays.minimum);
    setTrayNumberConfirmed(false);
    setDividerLayout(null);
    resetGrid();
  }

  function handleBuildTypeSelect(optionId: string) {
    if (optionId !== "box" && optionId !== "system") {
      return;
    }

    setBuildType(optionId);
    setTrayType(null);
    resetTrayConfiguration();
  }

  function handleTrayTypeSelect(optionId: string) {
    if (optionId !== "open" && optionId !== "lid" && optionId !== "dividers") {
      return;
    }

    setTrayType(optionId);
    resetTrayConfiguration();
  }

  function handleTrayNumberChange(value: number) {
    const minimum = ENGINEERING_LIMITS.trays.minimum;
    const maximum = ENGINEERING_LIMITS.trays.maximum;

    const nextTrayNumber = Math.min(maximum, Math.max(minimum, value));

    setTrayNumber(nextTrayNumber);
    setTrayNumberConfirmed(false);
    setDividerLayout(null);
    resetGrid();
  }

  function handleTrayNumberConfirm() {
    setTrayNumberConfirmed(true);
  }

  function handleDividerLayoutSelect(optionId: string) {
    if (optionId !== "equal" && optionId !== "custom") {
      return;
    }

    setDividerLayout(optionId);
    resetGrid();
  }

  function handleDimensionStrategySelect(optionId: string) {
    if (optionId !== "outside-led" && optionId !== "usable-space-led") {
      return;
    }

    setDimensionStrategy(optionId);
    resetDimensionParameters();
  }

  function handleRowsChange(value: number) {
    const minimum = ENGINEERING_LIMITS.grid.minimumRows;
    const maximum = ENGINEERING_LIMITS.grid.maximumRows;

    const nextRows = Math.min(maximum, Math.max(minimum, value));

    setRows(nextRows);
    setGridConfirmed(false);
    resetDimensions();
  }

  function handleColumnsChange(value: number) {
    const minimum = ENGINEERING_LIMITS.grid.minimumColumns;
    const maximum = ENGINEERING_LIMITS.grid.maximumColumns;

    const nextColumns = Math.min(maximum, Math.max(minimum, value));

    setColumns(nextColumns);
    setGridConfirmed(false);
    resetDimensions();
  }

  function handleGridConfirm() {
    setGridConfirmed(true);
  }

  function handleWidthChange(value: string) {
    if (!isWholeNumber(value)) {
      return;
    }

    setRequestedWidth(value);
    resetDepthAndHeight();
  }

  function handleDepthChange(value: string) {
    if (!isWholeNumber(value)) {
      return;
    }

    setRequestedDepth(value);
    resetHeight();
  }

  function handleHeightChange(value: string) {
    if (!isWholeNumber(value)) {
      return;
    }

    setRequestedHeight(value);
  }

  function getDimensionTarget(): DimensionTarget {
    if (!dimensionStrategy) {
      return null;
    }

    if (dimensionStrategy === "outside-led") {
      return buildType === "box" ? "box-outside" : "system-outside";
    }

    if (buildType === "box") {
      return "box-inside";
    }

    if (equalGridSelected) {
      return "compartment-inside";
    }

    if (customGridSelected) {
      return "custom-tray-inside";
    }

    return "tray-inside";
  }

  const dimensionTarget = getDimensionTarget();

  return {
    designWorkflow: {
      buildType,
      trayType,
      dividerLayout,

      trayNumber,
      trayNumberConfirmed,

      rows,
      columns,
      gridConfirmed,

      equalGridSelected,
      customGridSelected,

      trayMinimum: ENGINEERING_LIMITS.trays.minimum,
      trayMaximum: ENGINEERING_LIMITS.trays.maximum,
      gridMinimum: ENGINEERING_LIMITS.grid.minimumRows,
      gridMaximum: ENGINEERING_LIMITS.grid.maximumRows,

      onBuildTypeSelect: handleBuildTypeSelect,
      onTrayTypeSelect: handleTrayTypeSelect,
      onTrayNumberChange: handleTrayNumberChange,
      onTrayNumberConfirm: handleTrayNumberConfirm,
      onDividerLayoutSelect: handleDividerLayoutSelect,
      onRowsChange: handleRowsChange,
      onColumnsChange: handleColumnsChange,
      onGridConfirm: handleGridConfirm,
    },

    dimensionWorkflow: {
      designPhaseComplete,

      dimensionStrategy,
      dimensionTarget,

      trayNumber,
      rows,
      columns,

      requestedWidth,
      requestedDepth,
      requestedHeight,

      minWidth: MIN_WIDTH,
      minDepth: MIN_DEPTH,
      minHeight: MIN_HEIGHT,

      widthIsValid,
      depthIsValid,
      heightIsValid,

      widthHasError,
      depthHasError,
      heightHasError,

      onDimensionStrategySelect: handleDimensionStrategySelect,
      onWidthChange: handleWidthChange,
      onDepthChange: handleDepthChange,
      onHeightChange: handleHeightChange,
    },

    calculationSection: {
      calculationState,
    },
  };
}
