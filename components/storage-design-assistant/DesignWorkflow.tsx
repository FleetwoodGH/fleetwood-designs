import DecisionStep from "@/components/DecisionStep";
import EqualGridInput from "@/components/EqualGridInput";
import TrayNumberInput from "@/components/TrayNumberInput";

import {
  buildOptions,
  dividerLayoutOptions,
  trayOptions,
} from "@/components/storage-design-assistant/workflowOptions";

import type {
  BuildType,
  DividerLayout,
  TrayType,
} from "@/components/storage-design-assistant/types";

type DesignWorkflowProps = {
  buildType: BuildType;
  trayType: TrayType;
  dividerLayout: DividerLayout;

  trayNumber: number;
  trayNumberConfirmed: boolean;

  rows: number;
  columns: number;
  gridConfirmed: boolean;

  equalGridSelected: boolean;
  customGridSelected: boolean;

  trayMinimum: number;
  trayMaximum: number;
  gridMinimum: number;
  gridMaximum: number;

  onBuildTypeSelect: (optionId: string) => void;
  onTrayTypeSelect: (optionId: string) => void;
  onTrayNumberChange: (value: number) => void;
  onTrayNumberConfirm: () => void;
  onDividerLayoutSelect: (optionId: string) => void;
  onRowsChange: (value: number) => void;
  onColumnsChange: (value: number) => void;
  onGridConfirm: () => void;
};

export default function DesignWorkflow({
  buildType,
  trayType,
  dividerLayout,
  trayNumber,
  trayNumberConfirmed,
  rows,
  columns,
  gridConfirmed,
  equalGridSelected,
  customGridSelected,
  trayMinimum,
  trayMaximum,
  gridMinimum,
  gridMaximum,
  onBuildTypeSelect,
  onTrayTypeSelect,
  onTrayNumberChange,
  onTrayNumberConfirm,
  onDividerLayoutSelect,
  onRowsChange,
  onColumnsChange,
  onGridConfirm,
}: DesignWorkflowProps) {
  return (
    <>
      <DecisionStep
        question="What would you like to build?"
        options={buildOptions}
        selectedOption={buildType}
        onSelect={onBuildTypeSelect}
      />

      {buildType === "system" && (
        <DecisionStep
          question="Which type of tray would you like to use?"
          options={trayOptions}
          selectedOption={trayType}
          onSelect={onTrayTypeSelect}
        />
      )}

      {buildType === "box" && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Storage box selected
          </h2>

          <p className="mt-2 text-neutral-600">
            Continue below to determine whether the outside size or the required
            usable space should lead the design.
          </p>
        </section>
      )}

      {buildType === "system" && trayType && (
        <TrayNumberInput
          value={trayNumber}
          min={trayMinimum}
          max={trayMaximum}
          confirmed={trayNumberConfirmed}
          onChange={onTrayNumberChange}
          onConfirm={onTrayNumberConfirm}
        />
      )}

      {trayType === "dividers" && trayNumberConfirmed && (
        <DecisionStep
          question="How would you like to organise the compartments?"
          options={dividerLayoutOptions}
          selectedOption={dividerLayout}
          onSelect={onDividerLayoutSelect}
        />
      )}

      {trayType && trayType !== "dividers" && trayNumberConfirmed && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Tray configuration complete
          </h2>

          <p className="mt-2 text-neutral-600">
            The storage system will contain {trayNumber}{" "}
            {trayNumber === 1 ? "tray" : "trays"}. Continue below to configure
            the dimensions.
          </p>
        </section>
      )}

      {equalGridSelected && trayNumberConfirmed && (
        <EqualGridInput
          rows={rows}
          columns={columns}
          min={gridMinimum}
          max={gridMaximum}
          confirmed={gridConfirmed}
          onRowsChange={onRowsChange}
          onColumnsChange={onColumnsChange}
          onConfirm={onGridConfirm}
        />
      )}

      {customGridSelected && trayNumberConfirmed && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Custom layout selected
          </h2>

          <p className="mt-2 text-neutral-600">
            The tray dimensions can be configured below. Manual guidance for
            custom divider positions will be added separately.
          </p>
        </section>
      )}

      {gridConfirmed && equalGridSelected && trayNumberConfirmed && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Equal grid configured
          </h2>

          <p className="mt-2 text-neutral-600">
            Each tray will contain {rows} rows and {columns} columns, creating{" "}
            {rows * columns} equally sized compartments.
          </p>
        </section>
      )}
    </>
  );
}
