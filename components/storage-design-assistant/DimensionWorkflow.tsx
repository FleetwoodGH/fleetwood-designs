import BoxHeightInput from "@/components/BoxHeightInput";
import DecisionStep from "@/components/DecisionStep";
import DimensionInputs from "@/components/DimensionInputs";
import TrayHeightInput from "@/components/TrayHeightInput";

import { dimensionStrategyOptions } from "@/components/storage-design-assistant/workflowOptions";

import type {
  BuildType,
  DimensionStrategy,
  DimensionTarget,
} from "@/components/storage-design-assistant/types";

import {
  getDepthLabel,
  getDimensionDescription,
  getDimensionStrategyDescription,
  getDimensionTitle,
  getBoxHeightLabel,
  getTrayHeightDescription,
  getTrayHeightLabel,
  getTrayHeightTitle,
  getWidthLabel,
} from "@/components/storage-design-assistant/workflowText";

type DimensionWorkflowProps = {
  designPhaseComplete: boolean;
  buildType: BuildType;

  dimensionStrategy: DimensionStrategy;
  dimensionTarget: DimensionTarget;

  trayNumber: number;
  rows: number;
  columns: number;

  requestedWidth: string;
  requestedDepth: string;
  boxHeight: string;
  requestedTrayHeight: string;

  minWidth: number;
  minDepth: number;
  minimumBoxHeight: number;
  minimumTrayHeightExclusive: number;

  widthIsValid: boolean;
  depthIsValid: boolean;
  boxHeightIsValid: boolean;
  trayHeightIsValid: boolean;

  widthHasError: boolean;
  depthHasError: boolean;
  boxHeightHasError: boolean;
  trayHeightHasError: boolean;

  onDimensionStrategySelect: (optionId: string) => void;
  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onBoxHeightChange: (value: string) => void;
  onTrayHeightChange: (value: string) => void;
};

export default function DimensionWorkflow({
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
  minWidth,
  minDepth,
  minimumBoxHeight,
  minimumTrayHeightExclusive,
  widthIsValid,
  depthIsValid,
  boxHeightIsValid,
  trayHeightIsValid,
  widthHasError,
  depthHasError,
  boxHeightHasError,
  trayHeightHasError,
  onDimensionStrategySelect,
  onWidthChange,
  onDepthChange,
  onBoxHeightChange,
  onTrayHeightChange,
}: DimensionWorkflowProps) {
  const textContext = {
    trayNumber,
    rows,
    columns,
  };

  return (
    <>
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
              Choose whether the overall outside width and depth or the
              required usable width and depth should determine the design.
            </p>
          </header>

          <DecisionStep
            question="Which dimensions should lead the design?"
            options={dimensionStrategyOptions}
            selectedOption={dimensionStrategy}
            onSelect={onDimensionStrategySelect}
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
            {getDimensionStrategyDescription(dimensionTarget, textContext)}
          </p>
        </section>
      )}

      {dimensionStrategy && (
        <DimensionInputs
          title={getDimensionTitle(dimensionTarget)}
          description={getDimensionDescription(dimensionTarget, textContext)}
          width={requestedWidth}
          depth={requestedDepth}
          widthLabel={getWidthLabel(dimensionTarget)}
          depthLabel={getDepthLabel(dimensionTarget)}
          minWidth={minWidth}
          minDepth={minDepth}
          widthIsValid={widthIsValid}
          depthIsValid={depthIsValid}
          widthHasError={widthHasError}
          depthHasError={depthHasError}
          onWidthChange={onWidthChange}
          onDepthChange={onDepthChange}
        />
      )}

      {depthIsValid && buildType === "box" && (
        <BoxHeightInput
          boxHeight={boxHeight}
          boxHeightLabel={getBoxHeightLabel(dimensionTarget)}
          minimumHeight={minimumBoxHeight}
          boxHeightIsValid={boxHeightIsValid}
          boxHeightHasError={boxHeightHasError}
          onBoxHeightChange={onBoxHeightChange}
        />
      )}

      {depthIsValid && buildType === "system" && (
        <TrayHeightInput
          title={getTrayHeightTitle(dimensionStrategy)}
          description={getTrayHeightDescription(dimensionStrategy)}
          label={getTrayHeightLabel(dimensionStrategy)}
          value={requestedTrayHeight}
          minimumHeight={minimumTrayHeightExclusive}
          isValid={trayHeightIsValid}
          hasError={trayHeightHasError}
          onChange={onTrayHeightChange}
        />
      )}
    </>
  );
}
