"use client";

import { useState } from "react";

import {
  calculateMinimumSystemOutsideHeight,
  calculateMinimumUsableTrayHeight,
  calculateStorageDesign,
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

const MINIMUM_POSITIVE_DIMENSION = 0.001;

function isDecimalNumber(value: string) {
  return value === "" || /^\d*(?:\.\d*)?$/.test(value);
}

function createEmptyValues(count: number) {
  return Array.from({ length: count }, () => "");
}

function parsePositiveValues(values: string[]) {
  const parsed = values.map(Number);
  return values.every((value) => value !== "") &&
    parsed.every((value) => Number.isFinite(value) && value > 0)
    ? parsed
    : null;
}

function getDistribution(values: string[], segmentCount: number) {
  if (segmentCount === 1) {
    return [100];
  }

  const entered = parsePositiveValues(values);
  if (!entered) {
    return null;
  }

  const remainder = Number(
    (100 - entered.reduce((sum, value) => sum + value, 0)).toFixed(3),
  );
  return remainder > 0 ? [...entered, remainder] : null;
}

export function useTrayStorageSystemState() {
  const [trayType, setTrayType] = useState<TrayType>(null);
  const [dividerLayout, setDividerLayout] = useState<DividerLayout>(null);
  const [dimensionStrategy, setDimensionStrategy] =
    useState<DimensionStrategy>(null);
  const [trayNumber, setTrayNumber] = useState<number>(
    STORAGE_DESIGN_WORKFLOW_DEFAULTS.trayNumber,
  );
  const [trayNumberConfirmed, setTrayNumberConfirmed] = useState(false);
  const [rows, setRows] = useState<number>(
    STORAGE_DESIGN_WORKFLOW_DEFAULTS.equalGrid.rows,
  );
  const [columns, setColumns] = useState<number>(
    STORAGE_DESIGN_WORKFLOW_DEFAULTS.equalGrid.columns,
  );
  const [gridConfirmed, setGridConfirmed] = useState(false);
  const [requestedWidth, setRequestedWidth] = useState("");
  const [requestedDepth, setRequestedDepth] = useState("");
  const [requestedTrayHeight, setRequestedTrayHeight] = useState("");
  const [columnPercentages, setColumnPercentages] = useState<string[]>(
    createEmptyValues(columns - 1),
  );
  const [rowPercentages, setRowPercentages] = useState<string[]>(
    createEmptyValues(rows - 1),
  );
  const [usableColumnWidths, setUsableColumnWidths] = useState<string[]>(
    createEmptyValues(columns),
  );
  const [usableRowDepths, setUsableRowDepths] = useState<string[]>(
    createEmptyValues(rows),
  );

  const equalGridSelected =
    trayType === "dividers" && dividerLayout === "equal";
  const customGridSelected =
    trayType === "dividers" && dividerLayout === "custom";
  const trayConfigurationComplete = trayType !== null && trayNumberConfirmed;
  const designPhaseComplete =
    trayConfigurationComplete &&
    (trayType !== "dividers" ||
      ((equalGridSelected || customGridSelected) && gridConfirmed));
  const outsideLed = dimensionStrategy === "outside-led";

  const requestedWidthValue =
    requestedWidth === "" ? null : Number(requestedWidth);
  const requestedDepthValue =
    requestedDepth === "" ? null : Number(requestedDepth);
  const requestedTrayHeightValue =
    requestedTrayHeight === "" ? null : Number(requestedTrayHeight);
  const minimumWidth = outsideLed
    ? ENGINEERING_LIMITS.design.boxWidth.minimum
    : MINIMUM_POSITIVE_DIMENSION;
  const minimumDepth = outsideLed
    ? ENGINEERING_LIMITS.design.boxDepth.minimum
    : MINIMUM_POSITIVE_DIMENSION;
  const minimumTrayHeight = outsideLed
    ? calculateMinimumSystemOutsideHeight(trayNumber)
    : trayType
      ? calculateMinimumUsableTrayHeight(trayType)
      : MINIMUM_POSITIVE_DIMENSION;
  const widthIsValid =
    requestedWidthValue !== null && requestedWidthValue >= minimumWidth;
  const depthIsValid =
    requestedDepthValue !== null && requestedDepthValue >= minimumDepth;
  const trayHeightIsValid =
    requestedTrayHeightValue !== null &&
    requestedTrayHeightValue >= minimumTrayHeight;
  const widthHasError = requestedWidth !== "" && !widthIsValid;
  const depthHasError = requestedDepth !== "" && !depthIsValid;
  const trayHeightHasError = requestedTrayHeight !== "" && !trayHeightIsValid;
  const completeColumnPercentages = getDistribution(columnPercentages, columns);
  const completeRowPercentages = getDistribution(rowPercentages, rows);
  const parsedColumnWidths = parsePositiveValues(usableColumnWidths);
  const parsedRowDepths = parsePositiveValues(usableRowDepths);

  const calculationState: CalculationState = (() => {
    if (
      dimensionStrategy === null ||
      trayType === null ||
      !trayHeightIsValid ||
      requestedTrayHeightValue === null
    ) {
      return { result: null, error: null };
    }

    const base = {
      buildType: "system" as const,
      trayType,
      trayNumber,
      rows,
      columns,
      ...(dividerLayout ? { dividerLayout } : {}),
    };
    let calculationInput: CalculationInput;

    if (dimensionStrategy === "outside-led") {
      if (
        !widthIsValid ||
        !depthIsValid ||
        requestedWidthValue === null ||
        requestedDepthValue === null ||
        (customGridSelected &&
          (!completeColumnPercentages || !completeRowPercentages))
      ) {
        return { result: null, error: null };
      }
      calculationInput = {
        ...base,
        strategy: "outside-led",
        width: requestedWidthValue,
        depth: requestedDepthValue,
        heights: { systemOutsideHeight: requestedTrayHeightValue },
        ...(customGridSelected
          ? {
              customLayout: {
                columnPercentages: completeColumnPercentages!,
                rowPercentages: completeRowPercentages!,
              },
            }
          : {}),
      };
    } else if (customGridSelected) {
      if (!parsedColumnWidths || !parsedRowDepths) {
        return { result: null, error: null };
      }
      calculationInput = {
        ...base,
        strategy: "usable-space-led",
        width: parsedColumnWidths[0],
        depth: parsedRowDepths[0],
        heights: { usableTrayHeight: requestedTrayHeightValue },
        customLayout: {
          usableColumnWidths: parsedColumnWidths,
          usableRowDepths: parsedRowDepths,
        },
      };
    } else {
      if (
        !widthIsValid ||
        !depthIsValid ||
        requestedWidthValue === null ||
        requestedDepthValue === null
      ) {
        return { result: null, error: null };
      }
      calculationInput = {
        ...base,
        strategy: "usable-space-led",
        width: requestedWidthValue,
        depth: requestedDepthValue,
        heights: { usableTrayHeight: requestedTrayHeightValue },
      };
    }

    try {
      return { result: calculateStorageDesign(calculationInput), error: null };
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

  function resetCustomValues(nextRows = rows, nextColumns = columns) {
    setColumnPercentages(createEmptyValues(nextColumns - 1));
    setRowPercentages(createEmptyValues(nextRows - 1));
    setUsableColumnWidths(createEmptyValues(nextColumns));
    setUsableRowDepths(createEmptyValues(nextRows));
  }

  function resetDimensions(nextRows = rows, nextColumns = columns) {
    setDimensionStrategy(null);
    setRequestedWidth("");
    setRequestedDepth("");
    setRequestedTrayHeight("");
    resetCustomValues(nextRows, nextColumns);
  }

  function resetGrid() {
    const defaults = STORAGE_DESIGN_WORKFLOW_DEFAULTS.equalGrid;
    setRows(defaults.rows);
    setColumns(defaults.columns);
    setGridConfirmed(false);
    resetDimensions(defaults.rows, defaults.columns);
  }

  function handleTrayTypeSelect(optionId: string) {
    if (optionId !== "open" && optionId !== "lid" && optionId !== "dividers")
      return;
    setTrayType(optionId);
    setTrayNumber(STORAGE_DESIGN_WORKFLOW_DEFAULTS.trayNumber);
    setTrayNumberConfirmed(false);
    setDividerLayout(null);
    resetGrid();
  }

  function handleTrayNumberChange(value: number) {
    setTrayNumber(
      Math.min(
        ENGINEERING_LIMITS.trays.maximum,
        Math.max(ENGINEERING_LIMITS.trays.minimum, value),
      ),
    );
    setTrayNumberConfirmed(false);
    setDividerLayout(null);
    resetGrid();
  }

  function handleDividerLayoutSelect(optionId: string) {
    if (optionId !== "equal" && optionId !== "custom") return;
    setDividerLayout(optionId);
    resetGrid();
  }

  function handleRowsChange(value: number) {
    const next = Math.min(
      ENGINEERING_LIMITS.grid.maximumRows,
      Math.max(1, value),
    );
    setRows(next);
    setGridConfirmed(false);
    resetDimensions(next, columns);
  }

  function handleColumnsChange(value: number) {
    const next = Math.min(
      ENGINEERING_LIMITS.grid.maximumColumns,
      Math.max(1, value),
    );
    setColumns(next);
    setGridConfirmed(false);
    resetDimensions(rows, next);
  }

  function handleDimensionStrategySelect(optionId: string) {
    if (optionId !== "outside-led" && optionId !== "usable-space-led") return;
    setDimensionStrategy(optionId);
    setRequestedWidth("");
    setRequestedDepth("");
    setRequestedTrayHeight("");
    resetCustomValues();
  }

  function updateDecimal(setter: (value: string) => void, value: string) {
    if (isDecimalNumber(value)) setter(value);
  }

  function updateArrayValue(
    values: string[],
    setter: (values: string[]) => void,
    index: number,
    value: string,
    percentage = false,
  ) {
    if (!isDecimalNumber(value)) return;
    if (percentage && value !== "") {
      const otherTotal = values.reduce(
        (sum, current, currentIndex) =>
          currentIndex === index || current === ""
            ? sum
            : sum + Number(current),
        0,
      );
      if (
        (Number(value) <= 0 && !/^0\.?$/.test(value)) ||
        Number(value) >= 100 - otherTotal
      ) {
        return;
      }
    }
    const next = [...values];
    next[index] = value;
    setter(next);
  }

  const dimensionTarget: DimensionTarget = !dimensionStrategy
    ? null
    : outsideLed
      ? "system-outside"
      : equalGridSelected
        ? "compartment-inside"
        : customGridSelected
          ? "custom-tray-inside"
          : "tray-inside";

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
      rowMinimum: ENGINEERING_LIMITS.grid.minimumRows,
      rowMaximum: ENGINEERING_LIMITS.grid.maximumRows,
      columnMinimum: ENGINEERING_LIMITS.grid.minimumColumns,
      columnMaximum: ENGINEERING_LIMITS.grid.maximumColumns,
      onTrayTypeSelect: handleTrayTypeSelect,
      onTrayNumberChange: handleTrayNumberChange,
      onTrayNumberConfirm: () => setTrayNumberConfirmed(true),
      onDividerLayoutSelect: handleDividerLayoutSelect,
      onRowsChange: handleRowsChange,
      onColumnsChange: handleColumnsChange,
      onGridConfirm: () => setGridConfirmed(true),
    },
    dimensionWorkflow: {
      designPhaseComplete,
      dimensionStrategy,
      dimensionTarget,
      trayNumber,
      rows,
      columns,
      customGridSelected,
      requestedWidth,
      requestedDepth,
      requestedTrayHeight,
      columnPercentages,
      rowPercentages,
      completeColumnPercentages,
      completeRowPercentages,
      usableColumnWidths,
      usableRowDepths,
      calculationResult: calculationState.result,
      minWidth: minimumWidth,
      minDepth: minimumDepth,
      minimumTrayHeight,
      widthRequirement: outsideLed
        ? `Minimum supported system width: ${ENGINEERING_LIMITS.design.boxWidth.minimum} mm.`
        : "Enter the usable width your items require.",
      depthRequirement: outsideLed
        ? `Minimum supported system depth: ${ENGINEERING_LIMITS.design.boxDepth.minimum} mm.`
        : "Enter the usable depth your items require.",
      trayHeightRequirement: outsideLed
        ? `Minimum system height for ${trayNumber} ${trayNumber === 1 ? "tray" : "trays"}: ${minimumTrayHeight} mm.`
        : `Minimum usable tray height: ${minimumTrayHeight} mm.`,
      widthIsValid,
      depthIsValid,
      trayHeightIsValid,
      widthHasError,
      depthHasError,
      trayHeightHasError,
      onDimensionStrategySelect: handleDimensionStrategySelect,
      onWidthChange: (value: string) => updateDecimal(setRequestedWidth, value),
      onDepthChange: (value: string) => updateDecimal(setRequestedDepth, value),
      onTrayHeightChange: (value: string) =>
        updateDecimal(setRequestedTrayHeight, value),
      onColumnPercentageChange: (index: number, value: string) =>
        updateArrayValue(
          columnPercentages,
          setColumnPercentages,
          index,
          value,
          true,
        ),
      onRowPercentageChange: (index: number, value: string) =>
        updateArrayValue(rowPercentages, setRowPercentages, index, value, true),
      onUsableColumnWidthChange: (index: number, value: string) =>
        updateArrayValue(
          usableColumnWidths,
          setUsableColumnWidths,
          index,
          value,
        ),
      onUsableRowDepthChange: (index: number, value: string) =>
        updateArrayValue(usableRowDepths, setUsableRowDepths, index, value),
    },
    calculationSection: { calculationState },
  };
}
