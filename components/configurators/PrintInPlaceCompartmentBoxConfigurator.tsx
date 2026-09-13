"use client";

import { useMemo, useState } from "react";

import DecisionStep from "@/components/DecisionStep";
import DimensionField from "@/components/DimensionField";
import MakerWorldParameterPreview from "@/components/MakerWorldParameterPreview";
import ParameterInput from "@/components/ParameterInput";
import WorkflowProgress from "@/components/WorkflowProgress";
import CompartmentBoxLayoutEditor, {
  createCompartmentLayoutDraft,
  getCompleteDistribution,
  type CompartmentLayoutDraft,
} from "@/components/configurators/CompartmentBoxLayoutEditor";
import { scrollToWorkflowSection } from "@/components/configurators/scrollToWorkflowSection";
import { calculatePrintInPlaceCompartmentBox } from "@/lib/engineering/calculations";
import type {
  OutsideLedHalfLayoutInput,
  UsableLedHalfLayoutInput,
} from "@/lib/engineering/calculations/printInPlaceCompartmentBox";
import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";
import {
  generatePrintInPlaceCompartmentBoxParameters,
  PRINT_IN_PLACE_COMPARTMENT_BOX_PARAMETER_ORDER,
} from "@/lib/engineering/makerworld";
import type { DimensionStrategy } from "@/lib/engineering/types";
import { PRODUCTS } from "@/lib/products";

const STRATEGIES = [
  {
    id: "outside-led",
    title: "Outside Dimensions",
    description: "Start with the outside dimensions of the box.",
    icon: "outside-size",
  },
  {
    id: "usable-space-led",
    title: "Required Usable Space",
    description: "Start with the usable space your items need.",
    icon: "usable-space",
  },
] as const;

const LID_OPTIONS = [
  {
    id: "same-as-base",
    title: "Use same layout as base",
    description: "Copy the base compartment layout to the lid.",
    icon: "same-layout-pair",
  },
  {
    id: "separate",
    title: "Configure lid separately",
    description: "Choose an independent layout for the lid compartments.",
    icon: "separate-layout-pair",
  },
] as const;

type DimensionValues = {
  width: string;
  depth: string;
  height: string;
  baseHeight: string;
  lidHeight: string;
};

const EMPTY_DIMENSIONS: DimensionValues = {
  width: "",
  depth: "",
  height: "",
  baseHeight: "",
  lidHeight: "",
};

function cleanDecimal(value: string) {
  if (!/^\d*(?:[.,]\d*)?$/.test(value)) return null;
  return value.replace(",", ".");
}

function within(value: string, minimum: number, maximum: number) {
  const numeric = Number(value);
  return (
    value !== "" &&
    Number.isFinite(numeric) &&
    numeric >= minimum &&
    numeric <= maximum
  );
}

function positiveWithin(value: string, maximum: number) {
  const numeric = Number(value);
  return value !== "" && Number.isFinite(numeric) && numeric > 0 && numeric <= maximum;
}

function toOutsideLayout(
  draft: CompartmentLayoutDraft,
): OutsideLedHalfLayoutInput {
  if (draft.method === "custom") {
    const columnPercentages = getCompleteDistribution(
      draft.columnValues,
      draft.columns,
    );
    const rowPercentages = getCompleteDistribution(draft.rowValues, draft.rows);
    if (!columnPercentages || !rowPercentages) {
      throw new Error("Complete the custom layout distributions.");
    }
    return {
      method: "custom",
      rows: draft.rows,
      columns: draft.columns,
      columnPercentages,
      rowPercentages,
    };
  }
  return {
    method: "equal",
    rows: draft.rows,
    columns: draft.columns,
  };
}

function toUsableLayout(
  draft: CompartmentLayoutDraft,
): UsableLedHalfLayoutInput {
  if (draft.method === "custom") {
    return {
      method: "custom",
      rows: draft.rows,
      columns: draft.columns,
      requiredColumnWidths: draft.columnValues.map(Number),
      requiredRowDepths: draft.rowValues.map(Number),
    };
  }
  return {
    method: "equal",
    rows: draft.rows,
    columns: draft.columns,
    requiredCompartmentWidth: Number(draft.columnValues[0]),
    requiredCompartmentDepth: Number(draft.rowValues[0]),
  };
}

function ResultRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-neutral-100 py-2.5 last:border-0">
      <dt className="text-sm text-neutral-600">{label}</dt>
      <dd className="text-sm font-medium tabular-nums text-neutral-950">
        {value.toFixed(2)} mm
      </dd>
    </div>
  );
}

function LayoutSummary({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: number[];
  rows: number[];
}) {
  const format = (values: number[]) =>
    values.map((value) => `${value.toFixed(2)} mm`).join(" · ");

  return (
    <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1">
        <span className="font-medium">Usable column widths:</span>{" "}
        {format(columns)}
      </p>
      <p className="mt-1">
        <span className="font-medium">Usable row depths:</span> {format(rows)}
      </p>
    </div>
  );
}

export default function PrintInPlaceCompartmentBoxConfigurator() {
  const [strategy, setStrategy] = useState<DimensionStrategy | null>(null);
  const [dimensions, setDimensions] =
    useState<DimensionValues>(EMPTY_DIMENSIONS);
  const [baseLayout, setBaseLayout] = useState(createCompartmentLayoutDraft);
  const [lidMode, setLidMode] = useState<"same-as-base" | "separate" | null>(
    null,
  );
  const [lidLayout, setLidLayout] = useState(createCompartmentLayoutDraft);

  const limits = ENGINEERING_LIMITS.printInPlaceStorageBoxCompartments;
  const outsideLed = strategy === "outside-led";
  const outsideValidity = {
    width: within(
      dimensions.width,
      limits.outside.boxWidth.minimum,
      limits.outside.boxWidth.maximum,
    ),
    depth: within(
      dimensions.depth,
      limits.outside.boxDepth.minimum,
      limits.outside.boxDepth.maximum,
    ),
    height: within(
      dimensions.height,
      limits.outside.boxHeight.minimum,
      limits.outside.boxHeight.maximum,
    ),
  };
  const usableHeightValidity = {
    baseHeight: positiveWithin(
      dimensions.baseHeight,
      limits.usable.baseHeight.maximum,
    ),
    lidHeight: positiveWithin(
      dimensions.lidHeight,
      limits.usable.lidHeight.maximum,
    ),
  };
  const dimensionsComplete = outsideLed
    ? Object.values(outsideValidity).every(Boolean)
    : strategy === "usable-space-led" &&
      Object.values(usableHeightValidity).every(Boolean);
  const lidComplete =
    lidMode === "same-as-base" ||
    (lidMode === "separate" && lidLayout.confirmed);

  const calculation = useMemo(() => {
    if (!strategy || !dimensionsComplete || !baseLayout.confirmed || !lidComplete) {
      return { result: null, error: null };
    }

    try {
      const result =
        strategy === "outside-led"
          ? calculatePrintInPlaceCompartmentBox({
              strategy,
              dimensions: {
                width: Number(dimensions.width),
                depth: Number(dimensions.depth),
                height: Number(dimensions.height),
              },
              baseLayout: toOutsideLayout(baseLayout),
              lidLayout:
                lidMode === "same-as-base"
                  ? { mode: "same-as-base" }
                  : { mode: "separate", layout: toOutsideLayout(lidLayout) },
            })
          : calculatePrintInPlaceCompartmentBox({
              strategy,
              requiredHeights: {
                base: Number(dimensions.baseHeight),
                lid: Number(dimensions.lidHeight),
              },
              baseLayout: toUsableLayout(baseLayout),
              lidLayout:
                lidMode === "same-as-base"
                  ? { mode: "same-as-base" }
                  : { mode: "separate", layout: toUsableLayout(lidLayout) },
            });

      return {
        result,
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
  }, [baseLayout, dimensions, dimensionsComplete, lidComplete, lidLayout, lidMode, strategy]);

  const currentStage = !dimensionsComplete
    ? 0
    : !baseLayout.confirmed
      ? 1
      : !lidComplete
        ? 2
        : 3;

  function resetLayouts() {
    setBaseLayout(createCompartmentLayoutDraft());
    setLidMode(null);
    setLidLayout(createCompartmentLayoutDraft());
  }

  function selectStrategy(optionId: string) {
    if (optionId !== "outside-led" && optionId !== "usable-space-led") return;
    setStrategy(optionId);
    setDimensions(EMPTY_DIMENSIONS);
    resetLayouts();
    scrollToWorkflowSection('[data-workflow-section="dimension-inputs"]');
  }

  function updateDimension(
    key: keyof DimensionValues,
    rawValue: string,
    becameValid: (value: string) => boolean,
    nextSelector: string,
  ) {
    const value = cleanDecimal(rawValue);
    if (value === null) return;
    const wasValid =
      key in outsideValidity
        ? outsideValidity[key as keyof typeof outsideValidity]
        : usableHeightValidity[key as keyof typeof usableHeightValidity];
    setDimensions((current) => ({ ...current, [key]: value }));
    if (!wasValid && becameValid(value)) scrollToWorkflowSection(nextSelector);
  }

  function changeBaseLayout(next: CompartmentLayoutDraft) {
    setBaseLayout(next);
    setLidMode(null);
    setLidLayout(createCompartmentLayoutDraft());
  }

  function confirmBaseLayout() {
    setBaseLayout((current) => ({ ...current, confirmed: true }));
    scrollToWorkflowSection('[data-workflow-section="lid-choice"]');
  }

  function selectLidMode(optionId: string) {
    if (optionId !== "same-as-base" && optionId !== "separate") return;
    setLidMode(optionId);
    if (optionId === "separate") {
      setLidLayout(createCompartmentLayoutDraft());
      scrollToWorkflowSection('[data-workflow-section="lid-layout"]');
    } else {
      scrollToWorkflowSection('[data-workflow-section="calculated-output"]');
    }
  }

  function changeLidLayout(next: CompartmentLayoutDraft) {
    setLidLayout(next);
  }

  function confirmLidLayout() {
    setLidLayout((current) => ({ ...current, confirmed: true }));
    scrollToWorkflowSection('[data-workflow-section="calculated-output"]');
  }

  return (
    <div className="space-y-8 [overflow-anchor:none]">
      <WorkflowProgress
        currentStage={currentStage}
        stages={["Dimensions", "Base", "Lid", "Parameters"]}
      />

      <section className="space-y-5">
        <header>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Dimensions
          </h2>
          <p className="mt-1 text-xs leading-4 text-neutral-500">
            Choose the dimensions that should lead the design.
          </p>
        </header>
        <DecisionStep
          question="Which dimensions should lead the design?"
          options={[...STRATEGIES]}
          selectedOption={strategy}
          onSelect={selectStrategy}
        />
      </section>

      {strategy && (
        <div className="scroll-mt-20" data-workflow-section="dimension-inputs">
          <ParameterInput
            title={outsideLed ? "Outside Dimensions" : "Required Usable Heights"}
            description={
              outsideLed
                ? "Enter the physical outside dimensions of the closed box."
                : "Enter the minimum usable height required in each half. Width and depth are set with each compartment layout."
            }
          >
            {outsideLed ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ["width", "Box width", limits.outside.boxWidth, "depth"],
                  ["depth", "Box depth", limits.outside.boxDepth, "height"],
                  ["height", "Box height", limits.outside.boxHeight, "base-layout"],
                ] as const).map(([key, label, limit, next]) => (
                  <div key={key} data-workflow-field={key}>
                    <DimensionField
                      id={`compartment-box-${key}`}
                      label={label}
                      value={dimensions[key]}
                      minimum={limit.minimum}
                      maximum={limit.maximum}
                      requirement={`Supported range: ${limit.minimum}–${limit.maximum} mm.`}
                      isValid={outsideValidity[key]}
                      hasError={dimensions[key] !== "" && !outsideValidity[key]}
                      inputMode="decimal"
                      disabled={
                        key === "depth"
                          ? !outsideValidity.width
                          : key === "height"
                            ? !outsideValidity.depth
                            : false
                      }
                      onChange={(value) =>
                        updateDimension(
                          key,
                          value,
                          (candidate) =>
                            within(candidate, limit.minimum, limit.maximum),
                          next === "base-layout"
                            ? '[data-workflow-section="base-layout"]'
                            : `[data-workflow-field="${next}"]`,
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                  Base and lid height are linked by the total box height. The configurator calculates the smallest box height that satisfies both requirements, so one half may provide more usable height than requested.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div data-workflow-field="baseHeight">
                    <DimensionField
                      id="required-base-height"
                      label="Required usable base height"
                      value={dimensions.baseHeight}
                      minimum={0}
                      maximum={limits.usable.baseHeight.maximum}
                      minimumIsExclusive
                      requirement={`Maximum supported requirement: ${limits.usable.baseHeight.maximum} mm.`}
                      minimumErrorMessage="Required usable base height must be greater than 0 mm."
                      isValid={usableHeightValidity.baseHeight}
                      hasError={
                        dimensions.baseHeight !== "" &&
                        !usableHeightValidity.baseHeight
                      }
                      inputMode="decimal"
                      onChange={(value) =>
                        updateDimension(
                          "baseHeight",
                          value,
                          (candidate) =>
                            positiveWithin(
                              candidate,
                              limits.usable.baseHeight.maximum,
                            ),
                          '[data-workflow-field="lidHeight"]',
                        )
                      }
                    />
                  </div>
                  <div data-workflow-field="lidHeight">
                    <DimensionField
                      id="required-lid-height"
                      label="Required usable lid height"
                      value={dimensions.lidHeight}
                      minimum={0}
                      maximum={limits.usable.lidHeight.maximum}
                      minimumIsExclusive
                      requirement={`Maximum supported requirement: ${limits.usable.lidHeight.maximum} mm.`}
                      minimumErrorMessage="Required usable lid height must be greater than 0 mm."
                      isValid={usableHeightValidity.lidHeight}
                      hasError={
                        dimensions.lidHeight !== "" &&
                        !usableHeightValidity.lidHeight
                      }
                      inputMode="decimal"
                      disabled={!usableHeightValidity.baseHeight}
                      onChange={(value) =>
                        updateDimension(
                          "lidHeight",
                          value,
                          (candidate) =>
                            positiveWithin(
                              candidate,
                              limits.usable.lidHeight.maximum,
                            ),
                          '[data-workflow-section="base-layout"]',
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </ParameterInput>
        </div>
      )}

      {strategy && dimensionsComplete && (
        <div className="scroll-mt-20" data-workflow-section="base-layout">
          <CompartmentBoxLayoutEditor
            half="Base"
            strategy={strategy}
            value={baseLayout}
            onChange={changeBaseLayout}
            onConfirm={confirmBaseLayout}
          />
        </div>
      )}

      {baseLayout.confirmed && (
        <section
          className="scroll-mt-20 space-y-5 border-t border-neutral-200 pt-8"
          data-workflow-section="lid-choice"
        >
          <DecisionStep
            question="How should the lid compartments be configured?"
            options={[...LID_OPTIONS]}
            selectedOption={lidMode}
            onSelect={selectLidMode}
          />
          {lidMode === "same-as-base" && (
            <p className="text-xs leading-4 text-neutral-500">
              The compartment layout is copied; base and lid usable heights remain different.
            </p>
          )}
        </section>
      )}

      {strategy && baseLayout.confirmed && lidMode === "separate" && (
        <div className="scroll-mt-20" data-workflow-section="lid-layout">
          <CompartmentBoxLayoutEditor
            half="Lid"
            strategy={strategy}
            value={lidLayout}
            onChange={changeLidLayout}
            onConfirm={confirmLidLayout}
          />
        </div>
      )}

      {calculation.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {calculation.error}
        </p>
      )}

      {calculation.result && (
        <>
          <section
            className="scroll-mt-20 space-y-4 border-t border-neutral-200 pt-8"
            data-workflow-section="calculated-output"
          >
            <header>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                {outsideLed
                  ? "Calculated Usable Space"
                  : "Calculated Outside Dimensions"}
              </h2>
              <p className="mt-1 text-xs leading-4 text-neutral-500">
                Generated by the Engineering Calculation Engine.
              </p>
            </header>

            <dl className="max-w-xl rounded-lg border border-neutral-200 bg-white px-4">
              {outsideLed ? (
                <>
                  <ResultRow label="Usable width" value={calculation.result.usable.width} />
                  <ResultRow label="Usable depth" value={calculation.result.usable.depth} />
                  <ResultRow label="Usable base height" value={calculation.result.usable.baseHeight} />
                  <ResultRow label="Usable lid height" value={calculation.result.usable.lidHeight} />
                </>
              ) : (
                <>
                  <ResultRow label="Box width" value={calculation.result.outside.width} />
                  <ResultRow label="Box depth" value={calculation.result.outside.depth} />
                  <ResultRow label="Box height" value={calculation.result.outside.height} />
                </>
              )}
            </dl>

            {!outsideLed && calculation.result.requestedUsableHeights && (
              <div className="max-w-xl">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Resulting usable heights
                </h3>
                <dl className="mt-2 rounded-lg border border-neutral-200 bg-white px-4">
                  <ResultRow
                    label="Requested base minimum"
                    value={calculation.result.requestedUsableHeights.base}
                  />
                  <ResultRow
                    label="Resulting base"
                    value={calculation.result.usable.baseHeight}
                  />
                  <ResultRow
                    label="Requested lid minimum"
                    value={calculation.result.requestedUsableHeights.lid}
                  />
                  <ResultRow
                    label="Resulting lid"
                    value={calculation.result.usable.lidHeight}
                  />
                </dl>
              </div>
            )}

            <LayoutSummary
              title="Base compartment layout"
              columns={calculation.result.baseLayout.usableColumnWidths}
              rows={calculation.result.baseLayout.usableRowDepths}
            />
            {!calculation.result.lidUsesBaseLayout && (
              <LayoutSummary
                title="Lid compartment layout"
                columns={calculation.result.lidLayout.usableColumnWidths}
                rows={calculation.result.lidLayout.usableRowDepths}
              />
            )}
          </section>

          <MakerWorldParameterPreview
            parameters={generatePrintInPlaceCompartmentBoxParameters(
              calculation.result,
            )}
            inputOrder={PRINT_IN_PLACE_COMPARTMENT_BOX_PARAMETER_ORDER}
            makerWorldUrl={
              PRODUCTS.printInPlaceStorageBoxCompartments.makerWorldUrl
            }
            splitAcrossColumns={false}
          />
        </>
      )}
    </div>
  );
}
