import type { DecisionOption } from "@/components/storage-design-assistant/types";

export const buildOptions: DecisionOption[] = [
  {
    id: "box",
    title: "Storage Box",
    description: "A simple configurable storage box without trays.",
    icon: "📦",
  },
  {
    id: "system",
    title: "Storage System",
    description:
      "A configurable storage system with one or more storage trays.",
    icon: "🗃️",
  },
];

export const trayOptions: DecisionOption[] = [
  {
    id: "open",
    title: "Open Trays",
    description: "Stackable trays with easy access to their contents.",
    icon: "▱",
  },
  {
    id: "lid",
    title: "Trays with Lids",
    description: "Individual trays that can be closed and used separately.",
    icon: "▰",
  },
  {
    id: "dividers",
    title: "Trays with Dividers",
    description: "Organise smaller items in separate compartments.",
    icon: "▦",
  },
];

export const dividerLayoutOptions: DecisionOption[] = [
  {
    id: "equal",
    title: "Equal Grid",
    description: "Create evenly sized compartments automatically.",
    icon: "⬚",
  },
  {
    id: "custom",
    title: "Custom Layout",
    description:
      "Create compartments of different sizes. Manual guidance included.",
    icon: "◫",
  },
];

export const dimensionStrategyOptions: DecisionOption[] = [
  {
    id: "outside-led",
    title: "Overall Outside Size",
    description:
      "Start with the maximum outside size of the complete storage solution. Internal dimensions will be calculated automatically.",
    icon: "⬜",
  },
  {
    id: "usable-space-led",
    title: "Required Usable Space",
    description:
      "Start with the usable space required for the stored items. The overall outside dimensions will be calculated automatically.",
    icon: "◻️",
  },
];
