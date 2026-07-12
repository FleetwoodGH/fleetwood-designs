"use client";

import { useState } from "react";
import DecisionStep from "@/components/DecisionStep";
import DimensionInputs from "@/components/DimensionInputs";
import EqualGridInput from "@/components/EqualGridInput";

type BuildType = "box" | "system" | null;
type TrayType = "open" | "lid" | "dividers" | null;
type DividerLayout = "equal" | "custom" | null;
type DimensionStrategy = "outside-led" | "usable-space-led" | null;

type DimensionTarget =
  | "box-outside"
  | "box-inside"
  | "system-outside"
  | "tray-inside"
  | "compartment-inside"
  | "custom-tray-inside"
  | null;

const MIN_GRID_SIZE = 1;
const MAX_GRID_SIZE = 6;

const MIN_WIDTH = 20;
const MIN_DEPTH = 20;
const MIN_HEIGHT = 10;

const buildOptions = [
  {
    id: "box",
    title: "Storage Box",
    description: "A simple configurable storage box without trays.",
    icon: "📦",
  },
  {
    id: "system",
    title: "Storage System",
    description:
      "A configurable storage system with one or more storage trays.",
    icon: "🗃️",
  },
];

const trayOptions = [
  {
    id: "open",
    title: "Open Trays",
    description: "Stackable trays with easy access to their contents.",
    icon: "▱",
  },
  {
    id: "lid",
    title: "Trays with Lids",
    description: "Individual trays that can be closed and used separately.",
    icon: "▰",
  },
  {
    id: "dividers",
    title: "Trays with Dividers",
    description: "Organise smaller items in separate compartments.",
    icon: "▦",
  },
];

const dividerLayoutOptions = [
  {
    id: "equal",
    title: "Equal Grid",
    description: "Create evenly sized compartments automatically.",
    icon: "⬚",
  },
  {
    id: "custom",
    title: "Custom Layout",
    description:
      "Create compartments of different sizes. Manual guidance included.",
    icon: "◫",
  },
];

const dimensionStrategyOptions = [
  {
    id: "outside-led",
    title: "Overall Outside Size",
    description:
      "Start with the maximum outside size of the complete storage solution. Internal dimensions will be calculated automatically.",
    icon: "⬜",
  },
  {
    id: "usable-space-led",
    title: "Required Usable Space",
    description:
      "Start with the usable space required for the stored items. The overall outside dimensions will be calculated automatically.",
    icon: "◻️",
  },
];

function isWholeNumber(value: string) {
  return value === "" || /^\d+$/.test(value);
}

function getBuildTypeLabel(buildType: BuildType) {
  if (buildType === "box") {
    return "Storage Box";
  }

  if (buildType === "system") {
    return "Storage System";
  }

  return "";
}

function getTrayTypeLabel(trayType: TrayType) {
  if (trayType === "open") {
    return "Open Trays";
  }

  if (trayType === "lid") {
    return "Trays with Lids";
  }

  if (trayType === "dividers") {
    return "Trays with Dividers";
  }

  return "";
}

function getDividerLayoutLabel(dividerLayout: DividerLayout) {
  if (dividerLayout === "equal") {
    return "Equal Grid";
  }

  if (dividerLayout === "custom") {
    return "Custom Layout";
  }

  return "";
}

function getDimensionStrategyLabel(dimensionStrategy: DimensionStrategy) {
  if (dimensionStrategy === "outside-led") {
    return "Overall Outside Size";
  }

  if (dimensionStrategy === "usable-space-led") {
    return "Required Usable Space";
  }

  return "";
}

export default function StorageDesignAssistant() {
  const [buildType, setBuildType] = useState<BuildType>(null);
  const [trayType, setTrayType] = useState<TrayType>(null);
  const [dividerLayout, setDividerLayout] = useState<DividerLayout>(null);
  const [dimensionStrategy, setDimensionStrategy] =
    useState<DimensionStrategy>(null);

  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);
  const [gridConfirmed, setGridConfirmed] = useState(false);

  const [requestedWidth, setRequestedWidth] = useState("");
  const [requestedDepth, setRequestedDepth] = useState("");
  const [requestedHeight, setRequestedHeight] = useState("");

  const equalGridSelected =
    trayType === "dividers" && dividerLayout === "equal";

  const customGridSelected =
    trayType === "dividers" && dividerLayout === "custom";

  const designPhaseComplete =
    buildType === "box" ||
    (buildType === "system" && trayType !== null && trayType !== "dividers") ||
    customGridSelected ||
    (equalGridSelected && gridConfirmed);

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

  function handleBuildTypeSelect(optionId: string) {
    if (optionId !== "box" && optionId !== "system") {
      return;
    }

    setBuildType(optionId);
    setTrayType(null);
    setDividerLayout(null);
    resetGrid();
  }

  function handleTrayTypeSelect(optionId: string) {
    if (optionId !== "open" && optionId !== "lid" && optionId !== "dividers") {
      return;
    }

    setTrayType(optionId);
    setDividerLayout(null);
    resetGrid();
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

  function updateRows(value: number) {
    setRows(Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, value)));
    setGridConfirmed(false);
    resetDimensions();
  }

  function updateColumns(value: number) {
    setColumns(Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, value)));
    setGridConfirmed(false);
    resetDimensions();
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

  function getDimensionStrategyDescription() {
    switch (dimensionTarget) {
      case "box-outside":
        return "You will specify the total outside dimensions of the storage box. Its usable inside dimensions will be calculated automatically.";

      case "system-outside":
        return "You will specify the total outside dimensions of the complete storage system. Tray, usable-space and compartment dimensions will be calculated automatically.";

      case "box-inside":
        return "You will specify the usable inside dimensions required in the storage box. The outside dimensions will be calculated automatically.";

      case "tray-inside":
        return "You will specify the usable dimensions required inside one tray. The tray and complete storage-system dimensions will be calculated automatically.";

      case "compartment-inside":
        return `You will specify the usable dimensions required for one compartment. The complete ${rows} × ${columns} grid, tray and storage-system dimensions will be calculated automatically.`;

      case "custom-tray-inside":
        return "You will specify the usable dimensions required inside the tray. Custom divider positions will be configured separately.";

      default:
        return "";
    }
  }

  function getDimensionTitle() {
    switch (dimensionTarget) {
      case "box-outside":
        return "Specify the outside box dimensions";

      case "system-outside":
        return "Specify the overall system dimensions";

      case "box-inside":
        return "Specify the usable box dimensions";

      case "tray-inside":
        return "Specify the usable tray dimensions";

      case "compartment-inside":
        return "Specify the compartment dimensions";

      case "custom-tray-inside":
        return "Specify the usable tray dimensions";

      default:
        return "Specify the dimensions";
    }
  }

  function getDimensionDescription() {
    switch (dimensionTarget) {
      case "box-outside":
        return "Enter the maximum outside width, depth and height of the storage box.";

      case "system-outside":
        return "Enter the maximum outside width, depth and height of the complete storage system.";

      case "box-inside":
        return "Enter the usable width, depth and height required inside the storage box.";

      case "tray-inside":
        return "Enter the usable width, depth and height required inside one tray.";

      case "compartment-inside":
        return `Enter the usable width, depth and height required for one compartment in the ${rows} × ${columns} grid.`;

      case "custom-tray-inside":
        return "Enter the usable width, depth and height required inside the divided tray.";

      default:
        return "";
    }
  }

  function getWidthLabel() {
    switch (dimensionTarget) {
      case "box-outside":
        return "Outside box width";

      case "system-outside":
        return "Overall system width";

      case "box-inside":
        return "Usable box width";

      case "tray-inside":
      case "custom-tray-inside":
        return "Usable tray width";

      case "compartment-inside":
        return "Compartment width";

      default:
        return "Width";
    }
  }

  function getDepthLabel() {
    switch (dimensionTarget) {
      case "box-outside":
        return "Outside box depth";

      case "system-outside":
        return "Overall system depth";

      case "box-inside":
        return "Usable box depth";

      case "tray-inside":
      case "custom-tray-inside":
        return "Usable tray depth";

      case "compartment-inside":
        return "Compartment depth";

      default:
        return "Depth";
    }
  }

  function getHeightLabel() {
    switch (dimensionTarget) {
      case "box-outside":
        return "Outside box height";

      case "system-outside":
        return "Overall system height";

      case "box-inside":
        return "Usable box height";

      case "tray-inside":
      case "custom-tray-inside":
        return "Usable tray height";

      case "compartment-inside":
        return "Compartment height";

      default:
        return "Height";
    }
  }

  function getSpecifiedDimensionLabel() {
    switch (dimensionTarget) {
      case "box-outside":
        return "Outside box dimensions";

      case "system-outside":
        return "Overall system dimensions";

      case "box-inside":
        return "Usable box dimensions";

      case "tray-inside":
        return "Usable dimensions of one tray";

      case "compartment-inside":
        return "Usable dimensions of one compartment";

      case "custom-tray-inside":
        return "Usable tray dimensions";

      default:
        return "Specified dimensions";
    }
  }

  return (
    <div className="space-y-12">
      <DecisionStep
        question="What would you like to build?"
        options={buildOptions}
        selectedOption={buildType}
        onSelect={handleBuildTypeSelect}
      />

      {buildType === "system" && (
        <DecisionStep
          question="Which type of tray would you like to use?"
          options={trayOptions}
          selectedOption={trayType}
          onSelect={handleTrayTypeSelect}
        />
      )}

      {buildType === "box" && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Storage box selected
          </h2>

          <p className="mt-2 text-neutral-600">
            Continue below to determine whether the outside size or the required
            usable space should lead the design.
          </p>
        </section>
      )}

      {trayType === "dividers" && (
        <DecisionStep
          question="How would you like to organise the compartments?"
          options={dividerLayoutOptions}
          selectedOption={dividerLayout}
          onSelect={handleDividerLayoutSelect}
        />
      )}

      {trayType && trayType !== "dividers" && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Tray type selected
          </h2>

          <p className="mt-2 text-neutral-600">
            Continue below to determine whether the overall outside size or the
            required usable tray space should lead the design.
          </p>
        </section>
      )}

      {equalGridSelected && (
        <EqualGridInput
          rows={rows}
          columns={columns}
          min={MIN_GRID_SIZE}
          max={MAX_GRID_SIZE}
          confirmed={gridConfirmed}
          onRowsChange={updateRows}
          onColumnsChange={updateColumns}
          onConfirm={() => setGridConfirmed(true)}
        />
      )}

      {customGridSelected && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Custom layout selected
          </h2>

          <p className="mt-2 text-neutral-600">
            The tray dimensions can be configured below. Manual guidance for
            custom divider positions will be added separately.
          </p>
        </section>
      )}

      {gridConfirmed && equalGridSelected && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Equal grid configured
          </h2>

          <p className="mt-2 text-neutral-600">
            The tray will contain {rows} rows and {columns} columns, creating{" "}
            {rows * columns} equally sized compartments.
          </p>
        </section>
      )}

      {designPhaseComplete && (
        <section className="space-y-8 border-t border-neutral-200 pt-12">
          <header>
            <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Phase 2
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              Dimensions
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
              Choose whether the overall outside size or the required usable
              space should determine the design.
            </p>
          </header>

          <DecisionStep
            question="Which dimensions should lead the design?"
            options={dimensionStrategyOptions}
            selectedOption={dimensionStrategy}
            onSelect={handleDimensionStrategySelect}
          />
        </section>
      )}

      {dimensionStrategy && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            {dimensionStrategy === "outside-led"
              ? "Overall outside size selected"
              : "Required usable space selected"}
          </h2>

          <p className="mt-2 leading-7 text-neutral-600">
            {getDimensionStrategyDescription()}
          </p>
        </section>
      )}

      {dimensionStrategy && (
        <DimensionInputs
          title={getDimensionTitle()}
          description={getDimensionDescription()}
          width={requestedWidth}
          depth={requestedDepth}
          height={requestedHeight}
          widthLabel={getWidthLabel()}
          depthLabel={getDepthLabel()}
          heightLabel={getHeightLabel()}
          minWidth={MIN_WIDTH}
          minDepth={MIN_DEPTH}
          minHeight={MIN_HEIGHT}
          widthIsValid={widthIsValid}
          depthIsValid={depthIsValid}
          heightIsValid={heightIsValid}
          widthHasError={widthHasError}
          depthHasError={depthHasError}
          heightHasError={heightHasError}
          onWidthChange={handleWidthChange}
          onDepthChange={handleDepthChange}
          onHeightChange={handleHeightChange}
        />
      )}

      {heightIsValid && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            Dimension input complete
          </h2>

          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Configuration
              </h3>

              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm text-neutral-500">Build type</dt>
                  <dd className="font-medium text-neutral-900">
                    {getBuildTypeLabel(buildType)}
                  </dd>
                </div>

                {buildType === "system" && (
                  <div>
                    <dt className="text-sm text-neutral-500">Tray type</dt>
                    <dd className="font-medium text-neutral-900">
                      {getTrayTypeLabel(trayType)}
                    </dd>
                  </div>
                )}

                {trayType === "dividers" && (
                  <div>
                    <dt className="text-sm text-neutral-500">Divider layout</dt>
                    <dd className="font-medium text-neutral-900">
                      {getDividerLayoutLabel(dividerLayout)}
                    </dd>
                  </div>
                )}

                {equalGridSelected && (
                  <div>
                    <dt className="text-sm text-neutral-500">Grid</dt>
                    <dd className="font-medium text-neutral-900">
                      {rows} rows × {columns} columns
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Sizing
              </h3>

              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm text-neutral-500">Sizing method</dt>
                  <dd className="font-medium text-neutral-900">
                    {getDimensionStrategyLabel(dimensionStrategy)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-neutral-500">
                    {getSpecifiedDimensionLabel()}
                  </dt>
                  <dd className="font-medium text-neutral-900">
                    {requestedWidthValue} × {requestedDepthValue} ×{" "}
                    {requestedHeightValue} mm
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
