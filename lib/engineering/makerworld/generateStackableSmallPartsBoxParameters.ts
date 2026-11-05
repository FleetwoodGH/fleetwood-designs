import type { StackableBoxResult } from "../calculations/stackableSmallPartsBox";
import type { MakerWorldParameters } from "./types";

export const STACKABLE_PARAMETER_ORDER = [
  "unitDepth", "unitWidth", "unitHeight", "unitNumberDepth", "unitNumberWidth", "unitNumberHeight",
] as const;

export function generateStackableSmallPartsBoxParameters(result: StackableBoxResult): MakerWorldParameters {
  const roundedUnits = (["depth", "width", "height"] as const).map(axis => {
    let value = Number(result.units[axis].toFixed(2));
    if (value < result.units[axis]) value = Number((value + 0.01).toFixed(2));
    if (value * result.counts[axis] > 252) {
      throw new Error(`Two-decimal MakerWorld unit ${axis} would exceed 252 mm overall. Reduce the requested ${axis} or choose another grid count.`);
    }
    return value;
  });
  const values = [...roundedUnits,
    result.counts.depth, result.counts.width, result.counts.height];
  return {
    groups: [{ id: "box", title: "Shell and drawer", parameters: STACKABLE_PARAMETER_ORDER.map((name, index) => ({
      name, value: values[index], displayValue: String(values[index]),
      ...(index < 3 ? { unit: "mm" as const } : {}),
    })) }],
    warnings: [],
  };
}
