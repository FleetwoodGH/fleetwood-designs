"use client";

import CalculationSection from "@/components/storage-design-assistant/CalculationSection";
import DesignWorkflow from "@/components/storage-design-assistant/DesignWorkflow";
import DimensionWorkflow from "@/components/storage-design-assistant/DimensionWorkflow";
import { useStorageDesignState } from "@/components/storage-design-assistant/useStorageDesignState";

export default function StorageDesignAssistant() {
  const { designWorkflow, dimensionWorkflow, calculationSection } =
    useStorageDesignState();

  return (
    <div className="space-y-12">
      <DesignWorkflow {...designWorkflow} />

      <DimensionWorkflow {...dimensionWorkflow} />

      <CalculationSection {...calculationSection} />
    </div>
  );
}
