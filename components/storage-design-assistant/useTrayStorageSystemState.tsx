"use client";

import { useState } from "react";

import {
  calculateMinimumUsableTrayHeight,
  calculateStorageDesign,
  calculateTrayOutsideHeightValidityBoundary,
} from "@/lib/engineering/calculations";
import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";
import { STORAGE_DESIGN_WORKFLOW_DEFAULTS } from "@/components/storage-design-assistant/workflowDefaults";

import type {
  CalculationState,
  DimensionStrategy,
  DimensionTarget,
  DividerLayout,
  TrayType,
} from "@/components/storage-design-assistant/types";

import type { CalculationInput } from "@/lib/engineering/types";

const MINIMUM_POSITIVE_WHOLE_DIMENSION = 1;

function isWholeNumber(value: string) {
  return value === "" || /^\d+$/.test(value);
}

function isDecimalNumber(value: string) {
  return value === "" || /^\d*(?:\.\d*)?$/.test(value);
}

export function useTrayStorageSystemState() {
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
  const [requestedTrayHeight, setRequestedTrayHeight] = useState<string>("");

  const equalGridSelected =
    trayType === "dividers" && dividerLayout === "equal";

  const customGridSelected =
    trayType === "dividers" && dividerLayout === "custom";

  const trayConfigurationComplete =
    trayType !== null && trayNumberConfirmed;

  const designPhaseComplete =
    (trayConfigurationComplete && trayType !== "dividers") ||
    (trayConfigurationComplete && customGridSelected) ||
    (trayConfigurationComplete && equalGridSelected && gridConfirmed);

  const requestedWidthValue =
    requestedWidth === "" ? null : Number(requestedWidth);

  const requestedDepthValue =
    requestedDepth === "" ? null : Number(requestedDepth);

  const requestedTrayHeightValue =
    requestedTrayHeight === "" ? null : Number(requestedTrayHeight);

  const outsideLed = dimensionStrategy === "outside-led";

  const minimumWidth = outsideLed
    ? ENGINEERING_LIMITS.design.boxWidth.minimum
    : MINIMUM_POSITIVE_WHOLE_DIMENSION;

  const minimumDepth = outsideLed
    ? ENGINEERING_LIMITS.design.boxDepth.minimum
    : MINIMUM_POSITIVE_WHOLE_DIMENSION;

  const minimumTrayHeight = outsideLed
    ? ENGINEERING_LIMITS.design.trayOutsideHeight.minimum
    : trayType === null
      ? ENGINEERING_LIMITS.validity.trayHeight.minimumUsableExclusive
      : calculateMinimumUsableTrayHeight(trayType);

  const widthRequirement = outsideLed
    ? `Minimum supported box outside width: ${ENGINEERING_LIMITS.design.boxWidth.minimum} mm.`
    : `The calculated box outside width must be at least ${ENGINEERING_LIMITS.design.boxWidth.minimum} mm.`;

  const depthRequirement = outsideLed
    ? `Minimum supported box outside depth: ${ENGINEERING_LIMITS.design.boxDepth.minimum} mm.`
    : `The calculated box outside depth must be at least ${ENGINEERING_LIMITS.design.boxDepth.minimum} mm.`;

  const trayHeightRequirement = outsideLed
    ? `Minimum supported tray outside height: ${ENGINEERING_LIMITS.design.trayOutsideHeight.minimum} mm.`
    : `Must produce a tray outside height of at least ${ENGINEERING_LIMITS.design.trayOutsideHeight.minimum} mm.`;

  const minimumTrayHeightValidityBoundary =
    dimensionStrategy === "outside-led"
      ? trayType === null
        ? ENGINEERING_LIMITS.validity.trayHeight.minimumUsableExclusive
        : calculateTrayOutsideHeightValidityBoundary(trayType)
      : ENGINEERING_LIMITS.validity.trayHeight.minimumUsableExclusive;

  const widthIsValid =
    requestedWidthValue !== null &&
    Number.isInteger(requestedWidthValue) &&
    requestedWidthValue >= minimumWidth;

  const depthIsValid =
    requestedDepthValue !== null &&
    Number.isInteger(requestedDepthValue) &&
    requestedDepthValue >= minimumDepth;

  const trayHeightIsValid =
    requestedTrayHeightValue !== null &&
    Number.isFinite(requestedTrayHeightValue) &&
    requestedTrayHeightValue > minimumTrayHeightValidityBoundary &&
    requestedTrayHeightValue >= minimumTrayHeight;

  const widthHasError = requestedWidth !== "" && !widthIsValid;
  const depthHasError = requestedDepth !== "" && !depthIsValid;
  const trayHeightHasError =
    requestedTrayHeight !== "" && !trayHeightIsValid;

  const calculationState: CalculationState = (() => {
    if (
      !widthIsValid ||
      !depthIsValid ||
      dimensionStrategy === null ||
      requestedWidthValue === null ||
      requestedDepthValue === null
    ) {
      return {
        result: null,
        error: null,
      };
    }

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
      buildType: "system",
      trayType,
      trayNumber,
      rows,
      columns,
      width: requestedWidthValue,
      depth: requestedDepthValue,
      ...(dividerLayout !== null ? { dividerLayout } : {}),
    } as const;

    const calculationInput: CalculationInput =
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
  }

  function handleDepthChange(value: string) {
    if (!isWholeNumber(value)) {
      return;
    }

    setRequestedDepth(value);
    resetTrayHeight();
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
      return "system-outside";
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
      requestedTrayHeight,

      minWidth: minimumWidth,
      minDepth: minimumDepth,
      widthRequirement,
      depthRequirement,
      minimumTrayHeight,
      trayHeightRequirement,

      widthIsValid,
      depthIsValid,
      trayHeightIsValid,

      widthHasError,
      depthHasError,
      trayHeightHasError,

      onDimensionStrategySelect: handleDimensionStrategySelect,
      onWidthChange: handleWidthChange,
      onDepthChange: handleDepthChange,
      onTrayHeightChange: handleTrayHeightChange,
    },

    calculationSection: {
      calculationState,
    },
  };
}
