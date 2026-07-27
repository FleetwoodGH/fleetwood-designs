import type { DecisionOption } from "@/components/storage-design-assistant/types";

export const trayOptions: DecisionOption[] = [
  {
    id: "open",
    title: "Open Trays",
    description: "Stackable trays for easy access.",
    icon: "▱",
  },
  {
    id: "lid",
    title: "Trays with Lids",
    description: "Close and use each tray separately.",
    icon: "▰",
  },
  {
    id: "dividers",
    title: "Trays with Dividers",
    description: "Separate smaller items into compartments.",
    icon: "▦",
  },
];

export const dividerLayoutOptions: DecisionOption[] = [
  {
    id: "equal",
    title: "Equal Grid",
    description: "Create evenly sized compartments.",
    icon: "⬚",
  },
  {
    id: "custom",
    title: "Custom Layout",
    description: "Create compartments of different sizes.",
    icon: "◫",
  },
];

export const dimensionStrategyOptions: DecisionOption[] = [
  {
    id: "outside-led",
    title: "Overall Outside Size",
    description: "Start with the maximum outside dimensions.",
    icon: "⬜",
  },
  {
    id: "usable-space-led",
    title: "Required Usable Space",
    description: "Start with the usable space your items need.",
    icon: "◻️",
  },
];
