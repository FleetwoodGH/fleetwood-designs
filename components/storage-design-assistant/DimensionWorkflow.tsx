import CustomLayoutInputs from "@/components/CustomLayoutInputs";
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
import type { CalculationResult } from "@/lib/engineering/types";

type Props = {
  designPhaseComplete: boolean;
  dimensionStrategy: DimensionStrategy;
  dimensionTarget: DimensionTarget;
  trayNumber: number;
  rows: number;
  columns: number;
  customGridSelected: boolean;
  requestedWidth: string;
  requestedDepth: string;
  requestedTrayHeight: string;
  columnPercentages: string[];
  rowPercentages: string[];
  completeColumnPercentages: number[] | null;
  completeRowPercentages: number[] | null;
  usableColumnWidths: string[];
  usableRowDepths: string[];
  calculationResult: CalculationResult | null;
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
  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onTrayHeightChange: (value: string) => void;
  onColumnPercentageChange: (index: number, value: string) => void;
  onRowPercentageChange: (index: number, value: string) => void;
  onUsableColumnWidthChange: (index: number, value: string) => void;
  onUsableRowDepthChange: (index: number, value: string) => void;
};

export default function DimensionWorkflow(props: Props) {
  const textContext = {
    trayNumber: props.trayNumber,
    rows: props.rows,
    columns: props.columns,
  };
  const outsideLed = props.dimensionStrategy === "outside-led";

  return (
    <>
      {props.designPhaseComplete && (
        <section
          className={`scroll-mt-20 space-y-5 border-t border-neutral-200 pt-8 ${props.dimensionStrategy ? "" : "min-h-[calc(100vh-5rem)]"}`}
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
            selectedOption={props.dimensionStrategy}
            onSelect={props.onDimensionStrategySelect}
          />
        </section>
      )}

      {props.dimensionStrategy && (
        <p className="text-xs leading-4 text-neutral-500">
          {getDimensionStrategyDescription(props.dimensionTarget, textContext)}
        </p>
      )}

      {props.dimensionStrategy && (
        <div
          className={`scroll-mt-20 ${props.calculationResult ? "" : "min-h-[calc(100vh-5rem)]"}`}
          data-workflow-section="dimension-inputs"
        >
          {props.customGridSelected ? (
            <CustomLayoutInputs
              outsideLed={outsideLed}
              rows={props.rows}
              columns={props.columns}
              width={props.requestedWidth}
              depth={props.requestedDepth}
              height={props.requestedTrayHeight}
              columnPercentages={props.columnPercentages}
              rowPercentages={props.rowPercentages}
              completeColumnPercentages={props.completeColumnPercentages}
              completeRowPercentages={props.completeRowPercentages}
              usableColumnWidths={props.usableColumnWidths}
              usableRowDepths={props.usableRowDepths}
              minWidth={props.minWidth}
              minDepth={props.minDepth}
              minHeight={props.minimumTrayHeight}
              widthRequirement={props.widthRequirement}
              depthRequirement={props.depthRequirement}
              heightRequirement={props.trayHeightRequirement}
              widthIsValid={props.widthIsValid}
              depthIsValid={props.depthIsValid}
              heightIsValid={props.trayHeightIsValid}
              widthHasError={props.widthHasError}
              depthHasError={props.depthHasError}
              heightHasError={props.trayHeightHasError}
              calculationResult={props.calculationResult}
              onWidthChange={props.onWidthChange}
              onDepthChange={props.onDepthChange}
              onHeightChange={props.onTrayHeightChange}
              onColumnPercentageChange={props.onColumnPercentageChange}
              onRowPercentageChange={props.onRowPercentageChange}
              onUsableColumnWidthChange={props.onUsableColumnWidthChange}
              onUsableRowDepthChange={props.onUsableRowDepthChange}
            />
          ) : (
            <DimensionInputs
              title={outsideLed ? "System Dimensions" : "Required Usable Space"}
              description={getDimensionDescription(
                props.dimensionTarget,
                textContext,
              )}
              width={props.requestedWidth}
              depth={props.requestedDepth}
              height={props.requestedTrayHeight}
              widthLabel={getWidthLabel(props.dimensionTarget)}
              depthLabel={getDepthLabel(props.dimensionTarget)}
              heightLabel={getTrayHeightLabel(props.dimensionStrategy)}
              minWidth={props.minWidth}
              minDepth={props.minDepth}
              minHeight={props.minimumTrayHeight}
              widthRequirement={props.widthRequirement}
              depthRequirement={props.depthRequirement}
              heightRequirement={props.trayHeightRequirement}
              widthIsValid={props.widthIsValid}
              depthIsValid={props.depthIsValid}
              heightIsValid={props.trayHeightIsValid}
              widthHasError={props.widthHasError}
              depthHasError={props.depthHasError}
              heightHasError={props.trayHeightHasError}
              heightInputMode="decimal"
              onWidthChange={props.onWidthChange}
              onDepthChange={props.onDepthChange}
              onHeightChange={props.onTrayHeightChange}
            />
          )}
        </div>
      )}
    </>
  );
}
