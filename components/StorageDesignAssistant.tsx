"use client";

import { useState } from "react";
import DecisionStep from "@/components/DecisionStep";
import DimensionInputs from "@/components/DimensionInputs";
import EqualGridInput from "@/components/EqualGridInput";

type BuildType = "box" | "system" | null;
type TrayType = "open" | "lid" | "dividers" | null;
type DividerLayout = "equal" | "custom" | null;
type DimensionStrategy = "outside-led" | "usable-space-led" | null;

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
      "Start with the maximum outside size of the complete storage solution. Tray and compartment dimensions will be calculated automatically.",
    icon: "⬜",
  },
  {
    id: "usable-space-led",
    title: "Required Usable Space",
    description:
      "Start with the space required for the stored items. The overall outside dimensions will be calculated automatically.",
    icon: "◻️",
  },
];

function isWholeNumber(value: string) {
  return value === "" || /^\d+$/.test(value);
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

  function getUsableSpaceDescription() {
    if (buildType === "box") {
      return "You will specify the required usable inside dimensions of the box. The outside dimensions will be calculated automatically.";
    }

    if (trayType === "open") {
      return "You will specify the required usable dimensions inside an open tray. The tray and overall box dimensions will be calculated automatically.";
    }

    if (trayType === "lid") {
      return "You will specify the required usable dimensions inside a tray with a lid. The tray and overall box dimensions will be calculated automatically.";
    }

    if (equalGridSelected) {
      return `You will specify the required dimensions of one compartment. The complete ${rows} × ${columns} grid, tray and overall box dimensions will be calculated automatically.`;
    }

    if (customGridSelected) {
      return "You will specify the required usable tray area. Custom compartment positions will be configured separately.";
    }

    return "";
  }

  function getDimensionTitle() {
    if (dimensionStrategy === "outside-led") {
      return "Specify the overall dimensions";
    }

    if (equalGridSelected) {
      return "Specify the compartment dimensions";
    }

    if (buildType === "box") {
      return "Specify the usable box dimensions";
    }

    return "Specify the usable tray dimensions";
  }

  function getDimensionDescription() {
    if (dimensionStrategy === "outside-led") {
      return "Enter the maximum outside dimensions of the complete storage solution.";
    }

    if (equalGridSelected) {
      return `Enter the required usable dimensions of one compartment. The complete ${rows} × ${columns} grid and overall storage solution will be calculated automatically.`;
    }

    if (buildType === "box") {
      return "Enter the usable dimensions required inside the storage box.";
    }

    if (trayType === "lid") {
      return "Enter the usable dimensions required inside one tray with a lid.";
    }

    if (trayType === "dividers") {
      return "Enter the usable dimensions required inside the divided tray.";
    }

    return "Enter the usable dimensions required inside one open tray.";
  }

  function getWidthLabel() {
    if (dimensionStrategy === "outside-led") {
      return "Outside width";
    }

    if (equalGridSelected) {
      return "Compartment width";
    }

    if (buildType === "box") {
      return "Inside width";
    }

    return "Tray width";
  }

  function getDepthLabel() {
    if (dimensionStrategy === "outside-led") {
      return "Outside depth";
    }

    if (equalGridSelected) {
      return "Compartment depth";
    }

    if (buildType === "box") {
      return "Inside depth";
    }

    return "Tray depth";
  }

  function getHeightLabel() {
    if (dimensionStrategy === "outside-led") {
      return "Outside height";
    }

    if (equalGridSelected) {
      return "Compartment height";
    }

    if (buildType === "box") {
      return "Inside height";
    }

    return "Tray height";
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
            Configuration selected
          </h2>

          <p className="mt-2 text-neutral-600">
            You have selected a storage box. Continue below to configure its
            dimensions.
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
            Tray configuration selected
          </h2>

          <p className="mt-2 text-neutral-600">
            Continue below to configure the dimensions of your storage system.
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
            Manual guidance for configuring custom divider positions will be
            added here.
          </p>
        </section>
      )}

      {gridConfirmed && equalGridSelected && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Design configuration complete
          </h2>

          <p className="mt-2 text-neutral-600">
            Your tray will contain {rows} rows and {columns} columns, creating{" "}
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
              Choose whether the total outside size or the required usable space
              should determine the design.
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

      {dimensionStrategy === "outside-led" && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Overall outside size selected
          </h2>

          <p className="mt-2 leading-7 text-neutral-600">
            You will specify the overall outside dimensions of the complete
            storage solution. All tray, usable-space and compartment dimensions
            will be calculated from the outside in.
          </p>
        </section>
      )}

      {dimensionStrategy === "usable-space-led" && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Required usable space selected
          </h2>

          <p className="mt-2 leading-7 text-neutral-600">
            {getUsableSpaceDescription()}
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
          <h2 className="text-lg font-semibold text-neutral-900">
            Dimensions specified
          </h2>

          <dl className="mt-4 grid gap-4 text-neutral-600 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-neutral-500">{getWidthLabel()}</dt>
              <dd className="mt-1 font-medium text-neutral-900">
                {requestedWidthValue} mm
              </dd>
            </div>

            <div>
              <dt className="text-sm text-neutral-500">{getDepthLabel()}</dt>
              <dd className="mt-1 font-medium text-neutral-900">
                {requestedDepthValue} mm
              </dd>
            </div>

            <div>
              <dt className="text-sm text-neutral-500">{getHeightLabel()}</dt>
              <dd className="mt-1 font-medium text-neutral-900">
                {requestedHeightValue} mm
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
