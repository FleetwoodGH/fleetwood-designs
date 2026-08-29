import type { DecisionOption } from "@/components/storage-design-assistant/types";

export const trayOptions: DecisionOption[] = [
  {
    id: "open",
    title: "Open Tray",
    description: "Stackable trays for easy access.",
    icon: "open-tray",
  },
  {
    id: "lid",
    title: "Tray with Lid",
    description: "Close and use each tray separately.",
    icon: "lidded-tray",
  },
  {
    id: "dividers",
    title: "Tray with Lid & Compartments",
    description: "Organise smaller items in covered compartments.",
    icon: "compartment-tray",
  },
];

export const dividerLayoutOptions: DecisionOption[] = [
  {
    id: "equal",
    title: "Equal Grid",
    description: "Create evenly sized compartments.",
    icon: "equal-grid",
  },
  {
    id: "custom",
    title: "Custom Layout",
    description: "Create compartments of different sizes.",
    icon: "custom-grid",
  },
];

export const dimensionStrategyOptions: DecisionOption[] = [
  {
    id: "outside-led",
    title: "Overall Outside Size",
    description: "Start with the maximum outside dimensions.",
    icon: "outside-size",
  },
  {
    id: "usable-space-led",
    title: "Required Usable Space",
    description: "Start with the usable space your items need.",
    icon: "usable-space",
  },
];
