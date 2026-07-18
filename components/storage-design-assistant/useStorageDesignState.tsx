"use client";

import { useState } from "react";

import { calculateStorageDesign } from "@/lib/engineering/calculations";
import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";
import { STORAGE_DESIGN_WORKFLOW_DEFAULTS } from "@/components/storage-design-assistant/workflowDefaults";

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
const MIN_ENGINEERING_HEIGHT = 1;

function isWholeNumber(value: string) {
  return value === "" || /^\d+$/.test(value);
}

function isDecimalNumber(value: string) {
  return value === "" || /^\d*(?:\.\d*)?$/.test(value);
}

export function useStorageDesignState() {
  const [buildType, setBuildType] = useState<BuildType>(null);
  const [trayType, setTrayType] = useState<TrayType>(null);
  const [dividerLayout, setDividerLayout] = useState<DividerLayout>(null);

  const [dimensionStrategy, setDimensionStrategy] =
    useState<DimensionStrategy>(null);

  const [trayNumber, setTrayNumber] = useState<number>(
    STORAGE_DESIGN_WORKFLOW_DEFAULTS.trayNumber,
  );

  const [trayNumberConfirmed, setTrayNumberConfirmed] =
    useState<boolean>(false);

  const [rows, setRows] = useState<number>(
    STORAGE_DESIGN_WORKFLOW_DEFAULTS.equalGrid.rows,
  );
  const [columns, setColumns] = useState<number>(
    STORAGE_DESIGN_WORKFLOW_DEFAULTS.equalGrid.columns,
  );
  const [gridConfirmed, setGridConfirmed] = useState<boolean>(false);

  const [requestedWidth, setRequestedWidth] = useState<string>("");
  const [requestedDepth, setRequestedDepth] = useState<string>("");
  const [boxHeight, setBoxHeight] = useState<string>("");
  const [requestedTrayHeight, setRequestedTrayHeight] = useState<string>("");

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

  const boxHeightValue = boxHeight === "" ? null : Number(boxHeight);
  const requestedTrayHeightValue =
    requestedTrayHeight === "" ? null : Number(requestedTrayHeight);

  const widthIsValid =
    requestedWidthValue !== null &&
    Number.isInteger(requestedWidthValue) &&
    requestedWidthValue >= MIN_WIDTH;

  const depthIsValid =
    requestedDepthValue !== null &&
    Number.isInteger(requestedDepthValue) &&
    requestedDepthValue >= MIN_DEPTH;

  const boxHeightIsValid =
    boxHeightValue !== null &&
    Number.isInteger(boxHeightValue) &&
    boxHeightValue >= MIN_ENGINEERING_HEIGHT;

  const trayHeightIsValid =
    requestedTrayHeightValue !== null &&
    Number.isFinite(requestedTrayHeightValue) &&
    requestedTrayHeightValue >= MIN_ENGINEERING_HEIGHT;

  const widthHasError = requestedWidth !== "" && !widthIsValid;
  const depthHasError = requestedDepth !== "" && !depthIsValid;
  const boxHeightHasError = boxHeight !== "" && !boxHeightIsValid;
  const trayHeightHasError =
    requestedTrayHeight !== "" && !trayHeightIsValid;

  const calculationState: CalculationState = (() => {
    if (
      !widthIsValid ||
      !depthIsValid ||
      buildType === null ||
      dimensionStrategy === null ||
      requestedWidthValue === null ||
      requestedDepthValue === null
    ) {
      return {
        result: null,
        error: null,
      };
    }

    let calculationInput: CalculationInput;

    if (buildType === "box") {
      if (!boxHeightIsValid || boxHeightValue === null) {
        return {
          result: null,
          error: null,
        };
      }

      calculationInput = {
        buildType,
        strategy: dimensionStrategy,
        width: requestedWidthValue,
        depth: requestedDepthValue,
        boxHeight: boxHeightValue,
      };
    } else {
      if (
        trayType === null ||
        !trayHeightIsValid ||
        requestedTrayHeightValue === null
      ) {
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

      const systemConfiguration = {
        buildType,
        trayType,
        trayNumber,
        rows,
        columns,
        width: requestedWidthValue,
        depth: requestedDepthValue,
        ...(dividerLayout !== null ? { dividerLayout } : {}),
      } as const;

      calculationInput =
        dimensionStrategy === "outside-led"
          ? {
              ...systemConfiguration,
              strategy: dimensionStrategy,
              heights: {
                trayOutsideHeight: requestedTrayHeightValue,
              },
            }
          : {
              ...systemConfiguration,
              strategy: dimensionStrategy,
              heights: {
                usableTrayHeight: requestedTrayHeightValue,
              },
            };
    }

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

  function resetBoxHeight() {
    setBoxHeight("");
  }

  function resetDepth() {
    setRequestedDepth("");
  }

  function resetTrayHeight() {
    setRequestedTrayHeight("");
  }

  function resetPlanarDimensions() {
    setRequestedWidth("");
    resetDepth();
  }

  function resetDimensions() {
    setDimensionStrategy(null);
    resetPlanarDimensions();
    resetBoxHeight();
    resetTrayHeight();
  }

  function resetGrid() {
    setRows(STORAGE_DESIGN_WORKFLOW_DEFAULTS.equalGrid.rows);
    setColumns(STORAGE_DESIGN_WORKFLOW_DEFAULTS.equalGrid.columns);
    setGridConfirmed(false);
    resetDimensions();
  }

  function resetTrayConfiguration() {
    setTrayNumber(STORAGE_DESIGN_WORKFLOW_DEFAULTS.trayNumber);
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
    resetPlanarDimensions();
    resetTrayHeight();

    if (buildType === "box") {
      resetBoxHeight();
    }
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
    resetDepth();
    resetTrayHeight();

    if (buildType === "box") {
      resetBoxHeight();
    }
  }

  function handleDepthChange(value: string) {
    if (!isWholeNumber(value)) {
      return;
    }

    setRequestedDepth(value);
    resetTrayHeight();

    if (buildType === "box") {
      resetBoxHeight();
    }
  }

  function handleBoxHeightChange(value: string) {
    if (!isWholeNumber(value)) {
      return;
    }

    setBoxHeight(value);
  }

  function handleTrayHeightChange(value: string) {
    if (!isDecimalNumber(value)) {
      return;
    }

    setRequestedTrayHeight(value);
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
      buildType,

      dimensionStrategy,
      dimensionTarget,

      trayNumber,
      rows,
      columns,

      requestedWidth,
      requestedDepth,
      boxHeight,
      requestedTrayHeight,

      minWidth: MIN_WIDTH,
      minDepth: MIN_DEPTH,
      minimumEngineeringHeight: MIN_ENGINEERING_HEIGHT,

      widthIsValid,
      depthIsValid,
      boxHeightIsValid,
      trayHeightIsValid,

      widthHasError,
      depthHasError,
      boxHeightHasError,
      trayHeightHasError,

      onDimensionStrategySelect: handleDimensionStrategySelect,
      onWidthChange: handleWidthChange,
      onDepthChange: handleDepthChange,
      onBoxHeightChange: handleBoxHeightChange,
      onTrayHeightChange: handleTrayHeightChange,
    },

    calculationSection: {
      calculationState,
    },
  };
}
