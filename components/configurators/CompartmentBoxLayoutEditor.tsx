import DecisionStep from "@/components/DecisionStep";
import DimensionField from "@/components/DimensionField";
import NumberSelector from "@/components/NumberSelector";
import ParameterInput from "@/components/ParameterInput";
import { scrollToWorkflowSection } from "@/components/configurators/scrollToWorkflowSection";
import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";
import type { DimensionStrategy } from "@/lib/engineering/types";

export type CompartmentLayoutDraft = {
  method: "equal" | "custom" | null;
  rows: number;
  columns: number;
  columnValues: string[];
  rowValues: string[];
  confirmed: boolean;
};

const METHODS = [
  {
    id: "equal",
    title: "Equal Grid",
    description: "Divide the available space into equally sized compartments.",
    icon: "equal-grid",
  },
  {
    id: "custom",
    title: "Custom Layout",
    description: "Set a custom distribution or individual usable sizes.",
    icon: "custom-grid",
  },
] as const;

export function createCompartmentLayoutDraft(): CompartmentLayoutDraft {
  return {
    method: null,
    rows: 1,
    columns: 1,
    columnValues: [],
    rowValues: [],
    confirmed: false,
  };
}

function cleanDecimal(value: string) {
  if (!/^\d*(?:[.,]\d*)?$/.test(value)) return null;
  return value.replace(",", ".");
}

function isPositive(value: string) {
  return value !== "" && Number.isFinite(Number(value)) && Number(value) > 0;
}

function completeDistribution(values: string[], segmentCount: number) {
  if (segmentCount === 1) return [100];
  if (values.length !== segmentCount - 1 || !values.every(isPositive)) {
    return null;
  }
  const remainder = Number(
    (100 - values.reduce((sum, value) => sum + Number(value), 0)).toFixed(3),
  );
  return remainder > 0 ? [...values.map(Number), remainder] : null;
}

function expectedValueCount(
  strategy: DimensionStrategy,
  method: "equal" | "custom",
  segmentCount: number,
) {
  if (strategy === "outside-led") {
    return method === "custom" ? Math.max(0, segmentCount - 1) : 0;
  }
  return method === "equal" ? 1 : segmentCount;
}

function resizeValues(values: string[], count: number) {
  return Array.from({ length: count }, (_, index) => values[index] ?? "");
}

function PercentageDistribution({
  label,
  values,
  segmentCount,
  onChange,
}: {
  label: "Column" | "Row";
  values: string[];
  segmentCount: number;
  onChange: (index: number, value: string) => void;
}) {
  const complete = completeDistribution(values, segmentCount);

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-900">
        {label} distribution
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: segmentCount }, (_, index) => {
          const final = index === segmentCount - 1;
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
                  value={final ? (complete?.[index] ?? "") : values[index]}
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
      {!complete && values.some((value) => value !== "") && (
        <p className="mt-2 text-xs text-red-600">
          Enter positive values that leave a positive final remainder.
        </p>
      )}
    </div>
  );
}

function SegmentInputs({
  half,
  label,
  values,
  onChange,
  disabledUntilPrevious = true,
}: {
  half: "Base" | "Lid";
  label: "Column width" | "Row depth";
  values: string[];
  onChange: (index: number, value: string) => void;
  disabledUntilPrevious?: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-900">
        Required usable {label === "Column width" ? "column widths" : "row depths"}
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value, index) => (
          <DimensionField
            key={index}
            id={`${half.toLowerCase()}-${label.toLowerCase().replaceAll(" ", "-")}-${index + 1}`}
            label={`${half} ${label.toLowerCase()} ${index + 1}`}
            value={value}
            minimum={0}
            minimumIsExclusive
            requirement="Enter a value greater than 0 mm."
            isValid={isPositive(value)}
            hasError={value !== "" && !isPositive(value)}
            inputMode="decimal"
            disabled={
              disabledUntilPrevious && index > 0 && !isPositive(values[index - 1])
            }
            onChange={(nextValue) => onChange(index, nextValue)}
          />
        ))}
      </div>
    </div>
  );
}

export default function CompartmentBoxLayoutEditor({
  half,
  strategy,
  value,
  onChange,
  onConfirm,
}: {
  half: "Base" | "Lid";
  strategy: Exclude<DimensionStrategy, null>;
  value: CompartmentLayoutDraft;
  onChange: (value: CompartmentLayoutDraft) => void;
  onConfirm: () => void;
}) {
  const gridLimits = ENGINEERING_LIMITS.printInPlaceStorageBoxCompartments.grid;
  const completeColumns = completeDistribution(value.columnValues, value.columns);
  const completeRows = completeDistribution(value.rowValues, value.rows);
  const ready =
    value.method === "equal"
      ? strategy === "outside-led" ||
        (value.columnValues.every(isPositive) && value.rowValues.every(isPositive))
      : value.method === "custom"
        ? strategy === "outside-led"
          ? completeColumns !== null && completeRows !== null
          : value.columnValues.every(isPositive) && value.rowValues.every(isPositive)
        : false;

  function selectMethod(optionId: string) {
    if (optionId !== "equal" && optionId !== "custom") return;
    onChange({
      ...value,
      method: optionId,
      columnValues: Array.from(
        { length: expectedValueCount(strategy, optionId, value.columns) },
        () => "",
      ),
      rowValues: Array.from(
        { length: expectedValueCount(strategy, optionId, value.rows) },
        () => "",
      ),
      confirmed: false,
    });
    scrollToWorkflowSection(
      `[data-workflow-layout-config="${half.toLowerCase()}"]`,
    );
  }

  function changeGrid(rows: number, columns: number) {
    if (!value.method) return;
    onChange({
      ...value,
      rows,
      columns,
      columnValues: resizeValues(
        value.columnValues,
        expectedValueCount(strategy, value.method, columns),
      ),
      rowValues: resizeValues(
        value.rowValues,
        expectedValueCount(strategy, value.method, rows),
      ),
      confirmed: false,
    });
  }

  function updateValue(axis: "column" | "row", index: number, raw: string) {
    const cleaned = cleanDecimal(raw);
    if (cleaned === null) return;
    const values = axis === "column" ? value.columnValues : value.rowValues;
    const nextValues = [...values];
    nextValues[index] = cleaned;
    onChange({
      ...value,
      ...(axis === "column"
        ? { columnValues: nextValues }
        : { rowValues: nextValues }),
      confirmed: false,
    });
  }

  return (
    <section className="space-y-5">
      <DecisionStep
        question={`How would you like to organise the ${half.toLowerCase()} compartments?`}
        options={[...METHODS]}
        selectedOption={value.method}
        onSelect={selectMethod}
      />

      {value.method && (
        <div
          className="scroll-mt-20 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
          data-workflow-layout-config={half.toLowerCase()}
        >
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Configure the {half.toLowerCase()} {value.method === "equal" ? "equal grid" : "custom layout"}
          </h2>
          <p className="mt-1 text-xs leading-4 text-neutral-500">
            Choose 1–{gridLimits.maximumRows} rows and 1–{gridLimits.maximumColumns} columns. A 1 × 1 layout uses no separators.
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <NumberSelector
              label={`${half} rows`}
              value={value.rows}
              min={gridLimits.minimumRows}
              max={gridLimits.maximumRows}
              onChange={(rows) => changeGrid(rows, value.columns)}
            />
            <NumberSelector
              label={`${half} columns`}
              value={value.columns}
              min={gridLimits.minimumColumns}
              max={gridLimits.maximumColumns}
              onChange={(columns) => changeGrid(value.rows, columns)}
            />
          </div>

          <div className="mt-5 space-y-5">
            {value.method === "custom" && strategy === "outside-led" && (
              <>
                <PercentageDistribution
                  label="Column"
                  values={value.columnValues}
                  segmentCount={value.columns}
                  onChange={(index, nextValue) =>
                    updateValue("column", index, nextValue)
                  }
                />
                <PercentageDistribution
                  label="Row"
                  values={value.rowValues}
                  segmentCount={value.rows}
                  onChange={(index, nextValue) =>
                    updateValue("row", index, nextValue)
                  }
                />
              </>
            )}

            {strategy === "usable-space-led" && value.method === "equal" && (
              <ParameterInput
                title="Required compartment size"
                description="Enter the minimum usable size required for every compartment."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <DimensionField
                    id={`${half.toLowerCase()}-equal-width`}
                    label="Required usable compartment width"
                    value={value.columnValues[0] ?? ""}
                    minimum={0}
                    minimumIsExclusive
                    isValid={isPositive(value.columnValues[0] ?? "")}
                    hasError={
                      value.columnValues[0] !== "" &&
                      !isPositive(value.columnValues[0])
                    }
                    inputMode="decimal"
                    onChange={(nextValue) => updateValue("column", 0, nextValue)}
                  />
                  <DimensionField
                    id={`${half.toLowerCase()}-equal-depth`}
                    label="Required usable compartment depth"
                    value={value.rowValues[0] ?? ""}
                    minimum={0}
                    minimumIsExclusive
                    isValid={isPositive(value.rowValues[0] ?? "")}
                    hasError={
                      value.rowValues[0] !== "" && !isPositive(value.rowValues[0])
                    }
                    inputMode="decimal"
                    disabled={!isPositive(value.columnValues[0] ?? "")}
                    onChange={(nextValue) => updateValue("row", 0, nextValue)}
                  />
                </div>
              </ParameterInput>
            )}

            {strategy === "usable-space-led" && value.method === "custom" && (
              <>
                <SegmentInputs
                  half={half}
                  label="Column width"
                  values={value.columnValues}
                  onChange={(index, nextValue) =>
                    updateValue("column", index, nextValue)
                  }
                />
                <SegmentInputs
                  half={half}
                  label="Row depth"
                  values={value.rowValues}
                  disabledUntilPrevious
                  onChange={(index, nextValue) =>
                    updateValue("row", index, nextValue)
                  }
                />
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {value.confirmed ? (
              <p className="text-sm font-medium text-emerald-700" role="status">
                ✓ {half} layout confirmed
              </p>
            ) : (
              <button
                type="button"
                disabled={!ready}
                onClick={onConfirm}
                className="touch-manipulation rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Continue
              </button>
            )}
            <p className="text-sm text-neutral-500">
              {value.rows * value.columns} compartments
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export function getCompleteDistribution(
  values: string[],
  segmentCount: number,
) {
  return completeDistribution(values, segmentCount);
}
