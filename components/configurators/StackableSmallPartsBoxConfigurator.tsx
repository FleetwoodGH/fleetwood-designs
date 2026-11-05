"use client";

import { useState } from "react";
import DecisionStep from "@/components/DecisionStep";
import DimensionField from "@/components/DimensionField";
import NumberSelector from "@/components/NumberSelector";
import { scrollToWorkflowSection } from "@/components/configurators/scrollToWorkflowSection";
import ParameterInput from "@/components/ParameterInput";
import MakerWorldParameterPreview from "@/components/MakerWorldParameterPreview";
import WorkflowProgress from "@/components/WorkflowProgress";
import { calculateStackableSmallPartsBox, STACKABLE_AXES, STACKABLE_CLEARANCES, STACKABLE_MINIMUM_UNITS, type StackableDimensions } from "@/lib/engineering/calculations/stackableSmallPartsBox";
import { generateStackableSmallPartsBoxParameters, STACKABLE_PARAMETER_ORDER } from "@/lib/engineering/makerworld/generateStackableSmallPartsBoxParameters";
import { PRODUCTS } from "@/lib/products";

const formatDimension = (value: number) => String(Number(value.toFixed(2)));

const label = (axis: string) => axis[0].toUpperCase() + axis.slice(1);

export default function StackableSmallPartsBoxConfigurator() {
  const [stage, setStage] = useState<"mode" | "strategy" | "dimensions" | "grid" | "results">("mode");
  function goTo(next: typeof stage) {
    setStage(next);
    const sections = { mode: "sizing-mode", strategy: "custom-strategy", dimensions: "dimension-inputs", grid: "grid-counts", results: "calculated-output" };
    scrollToWorkflowSection(`[data-workflow-section="${sections[next]}"]`);
  }
  const showDimensions = ["dimensions", "grid", "results"].includes(stage);
  const showGrid = ["grid", "results"].includes(stage);
  const [mode, setMode] = useState<"standard" | "custom">("standard");
  const [strategy, setStrategy] = useState<"outside" | "usable">("outside");
  const [values, setValues] = useState({ width: "", depth: "", height: "" });
  const [counts, setCounts] = useState<StackableDimensions>({ width: 1, depth: 1, height: 1 });
  const dimensions = Object.fromEntries(STACKABLE_AXES.map(axis => [axis, values[axis].trim() === "" ? NaN : Number(values[axis].replace(",", "."))])) as StackableDimensions;
  const dimensionsComplete = STACKABLE_AXES.every(axis => {
    const offset = strategy === "usable" ? STACKABLE_CLEARANCES[axis] : 0;
    return Number.isFinite(dimensions[axis]) && dimensions[axis] >= STACKABLE_MINIMUM_UNITS[axis] - offset && dimensions[axis] <= 252 - offset;
  });
  let result = null;
  let parameters = null;
  let error = "";
  try {
    result = calculateStackableSmallPartsBox(mode === "standard" ? { mode, counts } : { mode, strategy, counts, dimensions });
    parameters = generateStackableSmallPartsBoxParameters(result);
  } catch (caught) {
    result = null;
    error = caught instanceof Error ? caught.message : "Check the dimensions and grid counts.";
  }

  return (
    <div className="space-y-8 [overflow-anchor:none]">
      <WorkflowProgress stages={["Dimensions", "Parameters"]} currentStage={stage === "results" && result ? 1 : 0} />
      <p className="text-sm leading-6 text-neutral-600">Every configuration produces one outer shell and one sliding drawer. Grid counts describe dimensions and stacking geometry: even 2 × 1 × 1 is one box.</p>
      <div data-workflow-section="active-step" className="space-y-6 scroll-mt-20">
      <DecisionStep question="Choose a sizing mode" selectedOption={mode} onSelect={value => { setMode(value as typeof mode); goTo(value === "custom" ? "strategy" : "grid"); }} options={[
        { id: "standard", title: "Standard Grid", description: "Fixed units of 42 × 42 × 14 mm. Choose grid counts.", icon: "equal-grid" },
        { id: "custom", title: "Custom Size", description: "Choose the final size of the entire box, then divide it into grid units.", icon: "outside-size" },
      ]} />
      {mode === "custom" && <>
        {stage !== "mode" && <div data-workflow-section="custom-strategy" className={`space-y-4 scroll-mt-20 ${stage === "strategy" ? "min-h-[calc(100svh-4rem)]" : ""}`}>
        <p className="text-sm leading-6 text-neutral-600">Custom Size starts with the final dimensions of the entire box. First choose its overall outside size or the usable space inside its single drawer. Then choose how many grid units span that size. For example, a 120 mm total width divided across 3 units gives 40 mm per unit; the box stays 120 mm wide.</p>
        <DecisionStep question="1. Choose how to size the entire box" selectedOption={strategy} onSelect={value => { setStrategy(value as typeof strategy); goTo("dimensions"); }} options={[
          { id: "outside", title: "Outside Size", description: "Final outside size of the entire box, excluding stacking studs.", icon: "outside-size" },
          { id: "usable", title: "Required Usable Space", description: "Minimum usable space inside the entire drawer.", icon: "usable-space" },
        ]} />
        </div>}
        {showDimensions && <div data-workflow-section="dimension-inputs" className={`scroll-mt-20 ${stage === "dimensions" ? "min-h-[calc(100svh-4rem)]" : ""}`}>
        <ParameterInput title={strategy === "outside" ? "2. Set the entire box’s outside size" : "2. Set the entire drawer’s usable space"} description="Enter the final total width, depth and height. These dimensions apply to the complete box or drawer, not to one grid unit. Choosing grid counts in the next step will preserve this size.">
          <div className="grid gap-4 sm:grid-cols-3">
            {STACKABLE_AXES.map(axis => {
              const offset = strategy === "usable" ? STACKABLE_CLEARANCES[axis] : 0;
              const minimum = STACKABLE_MINIMUM_UNITS[axis] - offset;
              const maximum = 252 - offset;
              const valid = Number.isFinite(dimensions[axis]) && dimensions[axis] >= minimum && dimensions[axis] <= maximum;
              return <DimensionField key={axis} id={`stackable-${axis}`} label={`${strategy === "usable" ? "Required usable " : "Outside "}${axis}`} value={values[axis]} minimum={minimum} maximum={maximum} isValid={valid} hasError={values[axis] !== "" && !valid} inputMode="decimal" requirement={`Enter ${minimum}–${maximum} mm for the entire box or drawer.`} onChange={value => setValues(current => ({ ...current, [axis]: value }))} />;
            })}
          </div>
          <button type="button" disabled={!dimensionsComplete} onClick={() => goTo("grid")} className="mt-4 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-35">Continue to grid counts</button>
        </ParameterInput>
        </div>}
        {showDimensions && <p className="text-sm leading-6 text-neutral-600">Custom Size boxes stack with boxes using matching grid unit dimensions and alignment. They are not automatically compatible with the Standard Grid.</p>}
      </>}
      {showGrid && <div data-workflow-section="grid-counts" className={`scroll-mt-20 ${stage === "grid" ? "min-h-[calc(100svh-4rem)]" : ""}`}>
      <ParameterInput title={mode === "custom" ? "3. Divide the entire box into grid units" : "Choose grid counts"} description={mode === "custom" ? "Choose how many units span the total width, depth and height you entered. More units make each unit smaller; the complete box stays the same size. Width and depth use 0.5 steps; height uses whole units." : "Choose how many fixed 42 × 42 × 14 mm units span your box. More units make the complete box larger. Width and depth use 0.5 steps; height uses whole units."}>
        <div className="grid gap-5 sm:grid-cols-3">
          {STACKABLE_AXES.map(axis => {
            const step = axis === "height" ? 1 : 0.5;
            const total = dimensions[axis] + (strategy === "usable" ? STACKABLE_CLEARANCES[axis] : 0);
            const maximum = mode === "custom" && Number.isFinite(total)
              ? Math.max(1, Math.min(6, Math.floor(total / STACKABLE_MINIMUM_UNITS[axis] / step) * step)) : 6;
            return <NumberSelector key={axis} label={`${label(axis)} units`} value={counts[axis]} min={1} max={maximum} step={step} onChange={value => setCounts(current => ({ ...current, [axis]: value }))} />;
          })}
        </div>
        <button type="button" disabled={!result} onClick={() => goTo("results")} className="mt-4 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-35">Continue</button>
      </ParameterInput>
      </div>}
      {showGrid && error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error} MakerWorld parameters are unavailable until this is resolved.</p>}
      {stage === "results" && result && parameters && <>
        <div data-workflow-section="calculated-output" className="scroll-mt-20">
        <ParameterInput title="Calculated dimensions" description="Dimensions in millimeters, shown to at most two decimals. MakerWorld unit dimensions round upward when needed to preserve the required space.">
          <dl>
            {[
              ["Nominal outside size (W × D × H)", STACKABLE_AXES.map(axis => result.outside[axis]).map(formatDimension).join(" × ")],
              ["Conservative usable space (W × D × H)", STACKABLE_AXES.map(axis => result.usable[axis]).map(formatDimension).join(" × ")],
              ["Drawer Opening", result.drawerOpening.toFixed(2)],
              ["Maximum usable height (deeper region)", formatDimension(result.maximumUsableHeight)],
              ["Physical height including stacking studs", formatDimension(result.overallHeightIncludingStuds)],
              ["Individual grid unit (W × D × H)", STACKABLE_AXES.map(axis => formatDimension(result.units[axis])).join(" × ")],
            ].map(([name, value]) => <div key={name} className="flex flex-wrap justify-between gap-2 border-b border-neutral-100 py-3 last:border-0"><dt className="text-sm text-neutral-600">{name}{name === "Drawer Opening" && <span className="mt-1 block text-xs leading-5 text-neutral-500">Maximum accessible drawer opening with the built-in drawer stop.</span>}</dt><dd className="break-all text-sm font-medium tabular-nums">{value} mm</dd></div>)}
          </dl>
          <p className="mt-3 text-xs leading-5 text-neutral-500">The drawer bottom varies locally by 0.9 mm. Guaranteed fit uses the minimum height near the edges. Stacking studs add 1 mm above the nominal outside height; the 252 mm limit excludes studs.</p>
        </ParameterInput>
        </div>
        <MakerWorldParameterPreview parameters={parameters} inputOrder={STACKABLE_PARAMETER_ORDER} makerWorldUrl={PRODUCTS.stackableSmallPartsBox.makerWorldUrl} makerWorldLinkLabel="Open Model on MakerWorld" splitAcrossColumns={false} />
      </>}
      </div>
    </div>
  );
}
