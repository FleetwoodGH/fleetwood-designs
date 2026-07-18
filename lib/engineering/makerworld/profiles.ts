import type { MakerWorldModelProfile } from "./types";

export const PARAMETRIC_STORAGE_SYSTEM_V1_PROFILE: MakerWorldModelProfile = {
  id: "parametric-storage-system-v1",
  productFamily: "parametric-storage-system",
  version: "1",
  displayName: "Parametric Storage System V1",

  capabilities: {
    supportsTrayParameters: true,
    supportsGridParameters: true,
    supportsDividerParameters: true,

    maximumVerticalDividers: 5,
    maximumHorizontalDividers: 3,
  },

  parameterNames: {
    strategy: "dimensionStrategy",

    box: {
      outsideWidth: "boxOutsideWidth",
      outsideDepth: "boxOutsideDepth",
      insideWidth: "boxInsideWidth",
      insideDepth: "boxInsideDepth",
    },

    tray: {
      outsideWidth: "trayOutsideWidth",
      outsideDepth: "trayOutsideDepth",
      usableWidth: "trayUsableWidth",
      usableDepth: "trayUsableDepth",
    },

    grid: {
      trayNumber: "trayNumber",
      rows: "rows",
      columns: "columns",
    },

    dividers: {
      vertical: [
        {
          position: "verticalDivider1Position",
          toggle: "verticalDivider1Toggle",
        },
        {
          position: "verticalDivider2Position",
          toggle: "verticalDivider2Toggle",
        },
        {
          position: "verticalDivider3Position",
          toggle: "verticalDivider3Toggle",
        },
        {
          position: "verticalDivider4Position",
          toggle: "verticalDivider4Toggle",
        },
        {
          position: "verticalDivider5Position",
          toggle: "verticalDivider5Toggle",
        },
      ],

      horizontal: [
        {
          position: "horizontalDivider1Position",
          toggle: "horizontalDivider1Toggle",
        },
        {
          position: "horizontalDivider2Position",
          toggle: "horizontalDivider2Toggle",
        },
        {
          position: "horizontalDivider3Position",
          toggle: "horizontalDivider3Toggle",
        },
      ],
    },
  },
};
