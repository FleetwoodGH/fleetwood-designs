import type { DimensionTarget } from "@/components/storage-design-assistant/types";
import type { DimensionStrategy } from "@/components/storage-design-assistant/types";

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
    case "system-outside":
      return `You will specify the outside width, depth and height of the complete Tray Storage System containing ${context.trayNumber} ${
        context.trayNumber === 1 ? "tray" : "trays"
      }. Tray, usable-space and compartment width and depth will be calculated automatically.`;

    case "tray-inside":
      return `You will specify the usable width and depth required inside one tray. The tray and complete Tray Storage System dimensions for ${context.trayNumber} ${
        context.trayNumber === 1 ? "tray" : "trays"
      } will be calculated automatically.`;

    case "compartment-inside":
      return `You will specify the usable width and depth required for one compartment. The complete ${context.rows} × ${context.columns} grid, tray and Tray Storage System dimensions for ${context.trayNumber} ${
        context.trayNumber === 1 ? "tray" : "trays"
      } will be calculated automatically.`;

    case "custom-tray-inside":
      return "You will specify the usable width of each column, the usable depth of each row and the required usable tray height.";

    default:
      return "";
  }
}

export function getDimensionTitle(target: DimensionTarget) {
  switch (target) {
    case "system-outside":
      return "Specify the overall Tray Storage System width and depth";

    case "tray-inside":
      return "Specify the usable tray width and depth";

    case "compartment-inside":
      return "Specify the compartment width and depth";

    case "custom-tray-inside":
      return "Specify the usable tray width and depth";

    default:
      return "Specify the width and depth";
  }
}

export function getDimensionDescription(
  target: DimensionTarget,
  context: WorkflowTextContext,
) {
  switch (target) {
    case "system-outside":
      return `Enter the maximum outside dimensions of the complete Tray Storage System with ${context.trayNumber} ${
        context.trayNumber === 1 ? "tray" : "trays"
      }.`;

    case "tray-inside":
      return "Enter the usable width and depth required inside one tray.";

    case "compartment-inside":
      return `Enter the usable width and depth required for one compartment in the ${context.rows} × ${context.columns} grid.`;

    case "custom-tray-inside":
      return "Enter the usable width and depth required inside the divided tray.";

    default:
      return "";
  }
}

export function getWidthLabel(target: DimensionTarget) {
  switch (target) {
    case "system-outside":
      return "System width";

    case "tray-inside":
    case "custom-tray-inside":
      return "Usable tray width";

    case "compartment-inside":
      return "Usable compartment width";

    default:
      return "Width";
  }
}

export function getDepthLabel(target: DimensionTarget) {
  switch (target) {
    case "system-outside":
      return "System depth";

    case "tray-inside":
    case "custom-tray-inside":
      return "Usable tray depth";

    case "compartment-inside":
      return "Usable compartment depth";

    default:
      return "Depth";
  }
}

export function getTrayHeightTitle(strategy: DimensionStrategy) {
  return strategy === "outside-led"
    ? "Specify the tray outside height"
    : "Specify the required usable tray height";
}

export function getTrayHeightDescription(strategy: DimensionStrategy) {
  return strategy === "outside-led"
    ? "Enter the known outside height of each tray. The usable tray height and complete Tray Storage System height will be calculated automatically."
    : "Enter the usable internal height required in each tray. The tray outside height and complete Tray Storage System height will be calculated automatically.";
}

export function getTrayHeightLabel(strategy: DimensionStrategy) {
  return strategy === "outside-led"
    ? "System height"
    : "Required usable tray height";
}
