import DimensionField from "@/components/DimensionField";
import DimensionInputs from "@/components/DimensionInputs";
import ParameterInput from "@/components/ParameterInput";
import type { CalculationResult } from "@/lib/engineering/types";

type Props = {
  outsideLed: boolean;
  rows: number;
  columns: number;
  width: string;
  depth: string;
  height: string;
  columnPercentages: string[];
  rowPercentages: string[];
  completeColumnPercentages: number[] | null;
  completeRowPercentages: number[] | null;
  usableColumnWidths: string[];
  usableRowDepths: string[];
  minWidth: number;
  minDepth: number;
  minHeight: number;
  widthRequirement: string;
  depthRequirement: string;
  heightRequirement: string;
  widthIsValid: boolean;
  depthIsValid: boolean;
  heightIsValid: boolean;
  widthHasError: boolean;
  depthHasError: boolean;
  heightHasError: boolean;
  calculationResult: CalculationResult | null;
  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onColumnPercentageChange: (index: number, value: string) => void;
  onRowPercentageChange: (index: number, value: string) => void;
  onUsableColumnWidthChange: (index: number, value: string) => void;
  onUsableRowDepthChange: (index: number, value: string) => void;
};

function isPositive(value: string) {
  return value !== "" && Number.isFinite(Number(value)) && Number(value) > 0;
}

function DistributionInputs({
  label,
  values,
  completeValues,
  onChange,
}: {
  label: "Column" | "Row";
  values: string[];
  completeValues: number[] | null;
  onChange: (index: number, value: string) => void;
}) {
  const count = values.length + 1;
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-900">
        {label} distribution
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => {
          const final = index === count - 1;
          return (
            <label
              key={index}
              className="block text-sm font-medium text-neutral-900"
            >
              {label} {index + 1}
              <div className="mt-1.5 flex overflow-hidden rounded-lg border border-neutral-300 bg-white">
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    final ? (completeValues?.[index] ?? "") : values[index]
                  }
                  readOnly={final}
                  aria-label={`${label} ${index + 1} percentage${final ? ", calculated" : ""}`}
                  onChange={(event) => onChange(index, event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-neutral-900 outline-none read-only:bg-neutral-100 read-only:text-neutral-600"
                />
                <span className="flex items-center border-l border-neutral-200 bg-neutral-50 px-3 text-neutral-500">
                  %
                </span>
              </div>
              {final && (
                <span className="mt-1 block text-xs font-normal text-neutral-500">
                  Calculated remainder
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SegmentFeedback({ result }: { result: CalculationResult | null }) {
  if (!result?.layoutSegments) return null;
  const formatDimensions = (values: number[]) =>
    values.map((value) => value.toFixed(1)).join(" mm · ");

  return (
    <div
      className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700"
      role="status"
    >
      <p>
        <span className="font-medium text-neutral-900">
          Calculated usable column widths:
        </span>{" "}
        {formatDimensions(result.layoutSegments.usableColumnWidths)} mm
      </p>
      <p className="mt-1">
        <span className="font-medium text-neutral-900">
          Calculated usable row depths:
        </span>{" "}
        {formatDimensions(result.layoutSegments.usableRowDepths)} mm
      </p>
    </div>
  );
}

export default function CustomLayoutInputs(props: Props) {
  if (props.outsideLed) {
    return (
      <div className="space-y-5">
        <DimensionInputs
          title="System Dimensions"
          description="Enter the maximum outside dimensions of the complete Tray Storage System."
          width={props.width}
          depth={props.depth}
          height={props.height}
          widthLabel="System width"
          depthLabel="System depth"
          heightLabel="System height"
          minWidth={props.minWidth}
          minDepth={props.minDepth}
          minHeight={props.minHeight}
          widthRequirement={props.widthRequirement}
          depthRequirement={props.depthRequirement}
          heightRequirement={props.heightRequirement}
          widthIsValid={props.widthIsValid}
          depthIsValid={props.depthIsValid}
          heightIsValid={props.heightIsValid}
          widthHasError={props.widthHasError}
          depthHasError={props.depthHasError}
          heightHasError={props.heightHasError}
          heightInputMode="decimal"
          onWidthChange={props.onWidthChange}
          onDepthChange={props.onDepthChange}
          onHeightChange={props.onHeightChange}
        />
        {props.heightIsValid && (
          <ParameterInput
            title="Compartment Distribution"
            description="Set the relative usable sizes. The final value is calculated automatically."
          >
            <div className="space-y-5">
              <DistributionInputs
                label="Column"
                values={props.columnPercentages}
                completeValues={props.completeColumnPercentages}
                onChange={props.onColumnPercentageChange}
              />
              <DistributionInputs
                label="Row"
                values={props.rowPercentages}
                completeValues={props.completeRowPercentages}
                onChange={props.onRowPercentageChange}
              />
              <SegmentFeedback result={props.calculationResult} />
            </div>
          </ParameterInput>
        )}
      </div>
    );
  }

  const segmentValues = [...props.usableColumnWidths, ...props.usableRowDepths];
  return (
    <ParameterInput
      title="Required Usable Space"
      description="Enter the usable size required for each column and row. Divider thickness and construction allowances are added automatically."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {props.usableColumnWidths.map((value, index) => {
          const sequenceIndex = index;
          const enabled = segmentValues
            .slice(0, sequenceIndex)
            .every(isPositive);
          return (
            <DimensionField
              key={`column-${index}`}
              id={`column-width-${index}`}
              label={`Column ${index + 1} width`}
              value={value}
              minimum={0.001}
              requirement="Enter a usable width greater than 0 mm."
              isValid={isPositive(value)}
              hasError={value !== "" && !isPositive(value)}
              inputMode="decimal"
              disabled={!enabled}
              onChange={(next) => props.onUsableColumnWidthChange(index, next)}
            />
          );
        })}
        {props.usableRowDepths.map((value, index) => {
          const sequenceIndex = props.usableColumnWidths.length + index;
          const enabled = segmentValues
            .slice(0, sequenceIndex)
            .every(isPositive);
          return (
            <DimensionField
              key={`row-${index}`}
              id={`row-depth-${index}`}
              label={`Row ${index + 1} depth`}
              value={value}
              minimum={0.001}
              requirement="Enter a usable depth greater than 0 mm."
              isValid={isPositive(value)}
              hasError={value !== "" && !isPositive(value)}
              inputMode="decimal"
              disabled={!enabled}
              onChange={(next) => props.onUsableRowDepthChange(index, next)}
            />
          );
        })}
        <DimensionField
          id="requested-height"
          label="Required usable tray height"
          value={props.height}
          minimum={props.minHeight}
          requirement={props.heightRequirement}
          isValid={props.heightIsValid}
          hasError={props.heightHasError}
          inputMode="decimal"
          disabled={!segmentValues.every(isPositive)}
          onChange={props.onHeightChange}
        />
      </div>
    </ParameterInput>
  );
}
