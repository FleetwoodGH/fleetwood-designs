import DecisionStep from "@/components/DecisionStep";
import EqualGridInput from "@/components/EqualGridInput";
import TrayNumberInput from "@/components/TrayNumberInput";

import {
  dividerLayoutOptions,
  trayOptions,
} from "@/components/storage-design-assistant/workflowOptions";

import type {
  DividerLayout,
  TrayType,
} from "@/components/storage-design-assistant/types";

type DesignWorkflowProps = {
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

  onTrayTypeSelect: (optionId: string) => void;
  onTrayNumberChange: (value: number) => void;
  onTrayNumberConfirm: () => void;
  onDividerLayoutSelect: (optionId: string) => void;
  onRowsChange: (value: number) => void;
  onColumnsChange: (value: number) => void;
  onGridConfirm: () => void;
};

export default function DesignWorkflow({
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
      <div
        className={`scroll-mt-20 ${
          trayType ? "" : "min-h-[calc(100vh-5rem)]"
        }`}
        data-workflow-section="tray-type"
      >
        <DecisionStep
          question="Which type of tray would you like to use?"
          options={trayOptions}
          selectedOption={trayType}
          columns={3}
          onSelect={onTrayTypeSelect}
        />
      </div>

      {trayType && (
        <div
          className={`scroll-mt-20 ${
            trayNumberConfirmed ? "" : "min-h-[calc(100vh-5rem)]"
          }`}
          data-workflow-section="tray-number"
        >
          <TrayNumberInput
            value={trayNumber}
            min={trayMinimum}
            max={trayMaximum}
            confirmed={trayNumberConfirmed}
            onChange={onTrayNumberChange}
            onConfirm={onTrayNumberConfirm}
          />
        </div>
      )}

      {trayType === "dividers" && trayNumberConfirmed && (
        <div
          className={`scroll-mt-20 ${dividerLayout ? "" : "min-h-[calc(100vh-5rem)]"}`}
          data-workflow-section="divider-layout"
        >
          <DecisionStep
            question="How would you like to organise the compartments?"
            options={dividerLayoutOptions}
            selectedOption={dividerLayout}
            onSelect={onDividerLayoutSelect}
          />
        </div>
      )}

      {trayType && trayType !== "dividers" && trayNumberConfirmed && (
        <p className="text-xs leading-4 text-neutral-500">
          Configuration complete: {trayNumber}{" "}
          {trayNumber === 1 ? "tray" : "trays"}.
        </p>
      )}

      {equalGridSelected && trayNumberConfirmed && (
        <div
          className={`scroll-mt-20 ${
            gridConfirmed ? "" : "min-h-[calc(100vh-5rem)]"
          }`}
          data-workflow-section="divider-configuration"
        >
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
        </div>
      )}

      {customGridSelected && trayNumberConfirmed && (
        <div
          className="scroll-mt-20"
          data-workflow-section="custom-layout-configuration"
        >
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Custom layout configuration
          </h2>

          <p className="mt-1 text-xs leading-4 text-neutral-500">
            Divider positions are handled separately.
          </p>

          <p
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"
            role="status"
          >
            <span aria-hidden="true">✓</span>
            Custom layout selected
          </p>
        </div>
      )}

      {gridConfirmed && equalGridSelected && trayNumberConfirmed && (
        <p className="text-xs leading-4 text-neutral-500">
          Equal grid configured: {rows} rows × {columns} columns ({rows * columns}{" "}
          compartments per tray).
        </p>
      )}
    </>
  );
}
