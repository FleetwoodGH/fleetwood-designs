import type { CalculationResult } from "@/lib/engineering/types";

export type BuildType = "box" | "system" | null;

export type TrayType = "open" | "lid" | "dividers" | null;

export type DividerLayout = "equal" | "custom" | null;

export type DimensionStrategy = "outside-led" | "usable-space-led" | null;

export type DimensionTarget =
  | "box-outside"
  | "box-inside"
  | "system-outside"
  | "tray-inside"
  | "compartment-inside"
  | "custom-tray-inside"
  | null;

export type CalculationState = {
  result: CalculationResult | null;
  error: string | null;
};

export type DecisionOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
};
