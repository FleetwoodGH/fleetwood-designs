import type { DimensionTarget } from "@/components/storage-design-assistant/types";

type WorkflowTextContext = {
  trayNumber: number;
  rows: number;
  columns: number;
};

export function getDimensionStrategyDescription(
  target: DimensionTarget,
  context: WorkflowTextContext,
) {
  switch (target) {
    case "box-outside":
      return "You will specify the total outside dimensions of the storage box. Its usable inside dimensions will be calculated automatically.";

    case "system-outside":
      return `You will specify the total outside dimensions of the complete storage system containing ${context.trayNumber} ${
        context.trayNumber === 1 ? "tray" : "trays"
      }. Tray, usable-space and compartment dimensions will be calculated automatically.`;

    case "box-inside":
      return "You will specify the usable inside dimensions required in the storage box. The outside dimensions will be calculated automatically.";

    case "tray-inside":
      return `You will specify the usable dimensions required inside one tray. The tray and complete ${context.trayNumber}-tray storage-system dimensions will be calculated automatically.`;

    case "compartment-inside":
      return `You will specify the usable dimensions required for one compartment. The complete ${context.rows} × ${context.columns} grid, tray and ${context.trayNumber}-tray storage-system dimensions will be calculated automatically.`;

    case "custom-tray-inside":
      return "You will specify the usable dimensions required inside the tray. Custom divider positions will be configured separately.";

    default:
      return "";
  }
}

export function getDimensionTitle(target: DimensionTarget) {
  switch (target) {
    case "box-outside":
      return "Specify the outside box dimensions";

    case "system-outside":
      return "Specify the overall system dimensions";

    case "box-inside":
      return "Specify the usable box dimensions";

    case "tray-inside":
      return "Specify the usable tray dimensions";

    case "compartment-inside":
      return "Specify the compartment dimensions";

    case "custom-tray-inside":
      return "Specify the usable tray dimensions";

    default:
      return "Specify the dimensions";
  }
}

export function getDimensionDescription(
  target: DimensionTarget,
  context: WorkflowTextContext,
) {
  switch (target) {
    case "box-outside":
      return "Enter the maximum outside width, depth and height of the storage box.";

    case "system-outside":
      return `Enter the maximum outside width, depth and height of the complete ${context.trayNumber}-tray storage system.`;

    case "box-inside":
      return "Enter the usable width, depth and height required inside the storage box.";

    case "tray-inside":
      return "Enter the usable width, depth and height required inside one tray.";

    case "compartment-inside":
      return `Enter the usable width, depth and height required for one compartment in the ${context.rows} × ${context.columns} grid.`;

    case "custom-tray-inside":
      return "Enter the usable width, depth and height required inside the divided tray.";

    default:
      return "";
  }
}

export function getWidthLabel(target: DimensionTarget) {
  switch (target) {
    case "box-outside":
      return "Outside box width";

    case "system-outside":
      return "Overall system width";

    case "box-inside":
      return "Usable box width";

    case "tray-inside":
    case "custom-tray-inside":
      return "Usable tray width";

    case "compartment-inside":
      return "Compartment width";

    default:
      return "Width";
  }
}

export function getDepthLabel(target: DimensionTarget) {
  switch (target) {
    case "box-outside":
      return "Outside box depth";

    case "system-outside":
      return "Overall system depth";

    case "box-inside":
      return "Usable box depth";

    case "tray-inside":
    case "custom-tray-inside":
      return "Usable tray depth";

    case "compartment-inside":
      return "Compartment depth";

    default:
      return "Depth";
  }
}

export function getHeightLabel(target: DimensionTarget) {
  switch (target) {
    case "box-outside":
      return "Outside box height";

    case "system-outside":
      return "Overall system height";

    case "box-inside":
      return "Usable box height";

    case "tray-inside":
    case "custom-tray-inside":
      return "Usable tray height";

    case "compartment-inside":
      return "Compartment height";

    default:
      return "Height";
  }
}
