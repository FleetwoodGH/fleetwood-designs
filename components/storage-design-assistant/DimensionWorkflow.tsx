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
  getTrayHeightLabel,
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
  requestedTrayHeight: string;

  minWidth: number;
  minDepth: number;
  widthRequirement: string;
  depthRequirement: string;
  minimumTrayHeight: number;
  trayHeightRequirement: string;

  widthIsValid: boolean;
  depthIsValid: boolean;
  trayHeightIsValid: boolean;

  widthHasError: boolean;
  depthHasError: boolean;
  trayHeightHasError: boolean;

  onDimensionStrategySelect: (optionId: string) => void;
  onDimensionConfirm: () => void;
  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onTrayHeightChange: (value: string) => void;
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
  requestedTrayHeight,
  minWidth,
  minDepth,
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
  onDimensionStrategySelect,
  onDimensionConfirm,
  onWidthChange,
  onDepthChange,
  onTrayHeightChange,
}: DimensionWorkflowProps) {
  const textContext = {
    trayNumber,
    rows,
    columns,
  };
  const dimensionEntryComplete = trayHeightIsValid;

  return (
    <>
      {designPhaseComplete && (
        <section
          className={`scroll-mt-20 space-y-5 border-t border-neutral-200 pt-8 ${
            dimensionStrategy ? "" : "min-h-[calc(100vh-5rem)]"
          }`}
          data-workflow-section="dimensions"
        >
          <header>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
              Dimensions
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-4 text-neutral-500">
              What dimensions should your Tray Storage System have?
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
        <p className="text-xs leading-4 text-neutral-500">
          {getDimensionStrategyDescription(dimensionTarget, textContext)}
        </p>
      )}

      {dimensionStrategy && (
        <div
          className={`scroll-mt-20 ${
            dimensionEntryComplete ? "" : "min-h-[calc(100vh-5rem)]"
          }`}
          data-workflow-section="dimension-inputs"
        >
          <DimensionInputs
            title="Tray Dimensions"
            description={getDimensionDescription(dimensionTarget, textContext)}
            width={requestedWidth}
            depth={requestedDepth}
            height={requestedTrayHeight}
            widthLabel={getWidthLabel(dimensionTarget)}
            depthLabel={getDepthLabel(dimensionTarget)}
            heightLabel={getTrayHeightLabel(dimensionStrategy)}
            minWidth={minWidth}
            minDepth={minDepth}
            minHeight={minimumTrayHeight}
            widthRequirement={widthRequirement}
            depthRequirement={depthRequirement}
            heightRequirement={trayHeightRequirement}
            widthIsValid={widthIsValid}
            depthIsValid={depthIsValid}
            heightIsValid={trayHeightIsValid}
            widthHasError={widthHasError}
            depthHasError={depthHasError}
            heightHasError={trayHeightHasError}
            heightInputMode="decimal"
            onWidthChange={onWidthChange}
            onDepthChange={onDepthChange}
            onHeightChange={onTrayHeightChange}
            onConfirm={onDimensionConfirm}
          />
        </div>
      )}
    </>
  );
}
