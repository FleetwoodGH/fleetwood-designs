import DecisionStep from "@/components/DecisionStep";
import DimensionInputs from "@/components/DimensionInputs";

import { dimensionStrategyOptions } from "@/components/storage-design-assistant/workflowOptions";

import type {
  DimensionStrategy,
  DimensionTarget,
} from "@/components/storage-design-assistant/types";

import {
  getDepthLabel,
  getDimensionDescription,
  getDimensionStrategyDescription,
  getDimensionTitle,
  getHeightLabel,
  getWidthLabel,
} from "@/components/storage-design-assistant/workflowText";

type DimensionWorkflowProps = {
  designPhaseComplete: boolean;

  dimensionStrategy: DimensionStrategy;
  dimensionTarget: DimensionTarget;

  trayNumber: number;
  rows: number;
  columns: number;

  requestedWidth: string;
  requestedDepth: string;
  requestedHeight: string;

  minWidth: number;
  minDepth: number;
  minHeight: number;

  widthIsValid: boolean;
  depthIsValid: boolean;
  heightIsValid: boolean;

  widthHasError: boolean;
  depthHasError: boolean;
  heightHasError: boolean;

  onDimensionStrategySelect: (optionId: string) => void;
  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
};

export default function DimensionWorkflow({
  designPhaseComplete,
  dimensionStrategy,
  dimensionTarget,
  trayNumber,
  rows,
  columns,
  requestedWidth,
  requestedDepth,
  requestedHeight,
  minWidth,
  minDepth,
  minHeight,
  widthIsValid,
  depthIsValid,
  heightIsValid,
  widthHasError,
  depthHasError,
  heightHasError,
  onDimensionStrategySelect,
  onWidthChange,
  onDepthChange,
  onHeightChange,
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
              Choose whether the overall outside size or the required usable
              space should determine the design.
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
          height={requestedHeight}
          widthLabel={getWidthLabel(dimensionTarget)}
          depthLabel={getDepthLabel(dimensionTarget)}
          heightLabel={getHeightLabel(dimensionTarget)}
          minWidth={minWidth}
          minDepth={minDepth}
          minHeight={minHeight}
          widthIsValid={widthIsValid}
          depthIsValid={depthIsValid}
          heightIsValid={heightIsValid}
          widthHasError={widthHasError}
          depthHasError={depthHasError}
          heightHasError={heightHasError}
          onWidthChange={onWidthChange}
          onDepthChange={onDepthChange}
          onHeightChange={onHeightChange}
        />
      )}
    </>
  );
}
