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
  rowMinimum: number;
  rowMaximum: number;
  columnMinimum: number;
  columnMaximum: number;

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
  rowMinimum,
  rowMaximum,
  columnMinimum,
  columnMaximum,
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
        className={`scroll-mt-20 ${trayType ? "" : "min-h-[calc(100vh-5rem)]"}`}
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

      {(equalGridSelected || customGridSelected) && trayNumberConfirmed && (
        <div
          className={`scroll-mt-20 ${
            gridConfirmed ? "" : "min-h-[calc(100vh-5rem)]"
          }`}
          data-workflow-section="divider-configuration"
        >
          <EqualGridInput
            rows={rows}
            columns={columns}
            rowMin={rowMinimum}
            rowMax={rowMaximum}
            columnMin={columnMinimum}
            columnMax={columnMaximum}
            confirmed={gridConfirmed}
            custom={customGridSelected}
            onRowsChange={onRowsChange}
            onColumnsChange={onColumnsChange}
            onConfirm={onGridConfirm}
          />
        </div>
      )}

      {gridConfirmed &&
        (equalGridSelected || customGridSelected) &&
        trayNumberConfirmed && (
          <p className="text-xs leading-4 text-neutral-500">
            {customGridSelected ? "Custom layout" : "Equal grid"} configured:{" "}
            {rows} rows × {columns} columns ({rows * columns} compartments per
            tray).
          </p>
        )}
    </>
  );
}
