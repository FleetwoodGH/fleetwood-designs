"use client";

import { useMemo, useState } from "react";

import DecisionStep from "@/components/DecisionStep";
import DimensionField from "@/components/DimensionField";
import MakerWorldParameterPreview from "@/components/MakerWorldParameterPreview";
import ParameterInput from "@/components/ParameterInput";
import WorkflowProgress from "@/components/WorkflowProgress";
import { scrollToWorkflowSection } from "@/components/configurators/scrollToWorkflowSection";
import {
  calculateStorageBoxLidBase,
  type StorageBoxLidBaseDimensions,
} from "@/lib/engineering/calculations";
import { ENGINEERING_LIMITS } from "@/lib/engineering/engineeringConstants";
import { generateStorageBoxLidBaseParameters } from "@/lib/engineering/makerworld";
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

const FIELD_KEYS = ["width", "depth", "baseHeight", "lidHeight"] as const;
type FieldKey = (typeof FIELD_KEYS)[number];
type FieldValues = Record<FieldKey, string>;

const EMPTY_VALUES: FieldValues = {
  width: "",
  depth: "",
  baseHeight: "",
  lidHeight: "",
};

function cleanDimensionInput(value: string) {
  const cleaned = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [whole = "", ...decimalParts] = cleaned.split(".");
  return decimalParts.length > 0
    ? `${whole}.${decimalParts.join("").slice(0, 3)}`
    : whole;
}

function formatDimension(value: number) {
  return value.toFixed(2);
}

function isDimensionValid(
  value: string,
  limit: { minimum: number; maximum: number },
) {
  const numericValue = Number(value);

  return (
    value !== "" &&
    Number.isFinite(numericValue) &&
    numericValue >= limit.minimum &&
    numericValue <= limit.maximum
  );
}

function ResultRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-neutral-100 py-2.5 last:border-0">
      <dt className="text-sm text-neutral-600">{label}</dt>
      <dd className="text-sm font-medium tabular-nums text-neutral-950">
        {formatDimension(value)} mm
      </dd>
    </div>
  );
}

export default function StorageBoxLidBaseConfigurator() {
  const [strategy, setStrategy] = useState<DimensionStrategy | null>(null);
  const [values, setValues] = useState<FieldValues>(EMPTY_VALUES);

  const outsideLed = strategy === "outside-led";
  const outsideLimits = ENGINEERING_LIMITS.storageBoxLidBase.outside;
  const usableLimits = ENGINEERING_LIMITS.storageBoxLidBase.usable;
  const fieldLimits = outsideLed
    ? {
        width: outsideLimits.boxWidth,
        depth: outsideLimits.boxDepth,
        baseHeight: outsideLimits.baseHeight,
        lidHeight: outsideLimits.lidHeight,
      }
    : {
        width: usableLimits.width,
        depth: usableLimits.depth,
        baseHeight: usableLimits.baseHeight,
        lidHeight: usableLimits.lidHeight,
      };
  const labels = outsideLed
    ? {
        width: "Box width",
        depth: "Box depth",
        baseHeight: "Base outside height",
        lidHeight: "Lid outside height",
      }
    : {
        width: "Usable box width",
        depth: "Usable box depth",
        baseHeight: "Required usable base height",
        lidHeight: "Required usable lid height",
      };
  const validity = Object.fromEntries(
    FIELD_KEYS.map((key) => {
      const value = Number(values[key]);
      const limit = fieldLimits[key];
      return [
        key,
        values[key] !== "" &&
          Number.isFinite(value) &&
          value >= limit.minimum &&
          value <= limit.maximum,
      ];
    }),
  ) as Record<FieldKey, boolean>;
  const complete = strategy !== null && FIELD_KEYS.every((key) => validity[key]);

  const result = useMemo(() => {
    if (!strategy || !complete) return null;

    const dimensions = Object.fromEntries(
      FIELD_KEYS.map((key) => [key, Number(values[key])]),
    ) as StorageBoxLidBaseDimensions;

    return calculateStorageBoxLidBase({ strategy, dimensions });
  }, [complete, strategy, values]);

  function selectStrategy(optionId: string) {
    setStrategy(optionId as DimensionStrategy);
    setValues(EMPTY_VALUES);
    scrollToWorkflowSection('[data-workflow-section="dimension-inputs"]');
  }

  function updateValue(key: FieldKey, value: string) {
    const cleanedValue = cleanDimensionInput(value);
    const becameValid =
      !validity[key] && isDimensionValid(cleanedValue, fieldLimits[key]);

    setValues((current) => ({
      ...current,
      [key]: cleanedValue,
    }));

    if (!becameValid) {
      return;
    }

    const fieldIndex = FIELD_KEYS.indexOf(key);
    const nextKey = FIELD_KEYS[fieldIndex + 1];

    scrollToWorkflowSection(
      nextKey
        ? `[data-workflow-field="${nextKey}"]`
        : '[data-workflow-section="calculated-output"]',
    );
  }

  return (
    <div className="space-y-8 [overflow-anchor:none]">
      <WorkflowProgress
        currentStage={result ? 1 : 0}
        stages={["Dimensions", "Parameters"]}
      />

      <section className="space-y-5">
        <header>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Dimensions
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-4 text-neutral-500">
            Choose the dimensions you know, then enter them in order.
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
        <div
          className="scroll-mt-20"
          data-workflow-section="dimension-inputs"
        >
          <ParameterInput
            title={outsideLed ? "Outside Dimensions" : "Required Usable Space"}
            description={
              outsideLed
                ? "Enter the physical outside dimensions of the base and lid."
                : "Enter the internal space your items require. Outside dimensions will be calculated automatically."
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELD_KEYS.map((key, index) => {
                const limit = fieldLimits[key];
                const disabled =
                  index > 0 && !validity[FIELD_KEYS[index - 1]];

                return (
                  <div key={key} data-workflow-field={key}>
                    <DimensionField
                      id={`storage-box-${strategy}-${key}`}
                      label={labels[key]}
                      value={values[key]}
                      minimum={limit.minimum}
                      maximum={limit.maximum}
                      requirement={`Supported range: ${limit.minimum}–${limit.maximum} mm.`}
                      isValid={validity[key]}
                      hasError={values[key] !== "" && !validity[key]}
                      inputMode="decimal"
                      disabled={disabled}
                      onChange={(value) => updateValue(key, value)}
                    />
                  </div>
                );
              })}
            </div>
          </ParameterInput>
        </div>
      )}

      {result && (
        <>
          <section
            className="scroll-mt-20 border-t border-neutral-200 pt-8"
            data-workflow-section="calculated-output"
          >
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
              {outsideLed
                ? "Calculated Usable Space"
                : "Calculated Outside Dimensions"}
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-4 text-neutral-500">
              Generated by the Engineering Calculation Engine.
            </p>

            <dl className="mt-4 max-w-xl rounded-lg border border-neutral-200 bg-white px-4">
              <ResultRow
                label={outsideLed ? "Usable width" : "Box width"}
                value={outsideLed ? result.usable.width : result.outside.width}
              />
              <ResultRow
                label={outsideLed ? "Usable depth" : "Box depth"}
                value={outsideLed ? result.usable.depth : result.outside.depth}
              />
              <ResultRow
                label={
                  outsideLed ? "Usable base height" : "Base outside height"
                }
                value={
                  outsideLed
                    ? result.usable.baseHeight
                    : result.outside.baseHeight
                }
              />
              <ResultRow
                label={
                  outsideLed ? "Usable lid height" : "Lid outside height"
                }
                value={
                  outsideLed
                    ? result.usable.lidHeight
                    : result.outside.lidHeight
                }
              />
              {!outsideLed && (
                <ResultRow
                  label="Total outside height"
                  value={result.totalOutsideHeight}
                />
              )}
            </dl>
          </section>

          <MakerWorldParameterPreview
            parameters={generateStorageBoxLidBaseParameters(result)}
            inputOrder={["boxWidth", "boxDepth", "baseHeight", "lidHeight"]}
            makerWorldUrl={PRODUCTS.storageBoxLidBase.makerWorldUrl}
            splitAcrossColumns={false}
          />
        </>
      )}
    </div>
  );
}
