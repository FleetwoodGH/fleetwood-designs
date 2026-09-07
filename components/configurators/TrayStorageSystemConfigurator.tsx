"use client";

import CalculationSection from "@/components/storage-design-assistant/CalculationSection";
import DesignWorkflow from "@/components/storage-design-assistant/DesignWorkflow";
import DimensionWorkflow from "@/components/storage-design-assistant/DimensionWorkflow";
import { useTrayStorageSystemState } from "@/components/storage-design-assistant/useTrayStorageSystemState";
import WorkflowProgress from "@/components/WorkflowProgress";
import { scrollToWorkflowSection } from "@/components/configurators/scrollToWorkflowSection";

export default function TrayStorageSystemConfigurator() {
  const { designWorkflow, dimensionWorkflow, calculationSection } =
    useTrayStorageSystemState();

  const currentStage = !dimensionWorkflow.designPhaseComplete
    ? 0
    : !calculationSection.calculationState.result
      ? 1
      : 2;

  function handleTrayTypeSelect(optionId: string) {
    designWorkflow.onTrayTypeSelect(optionId);
    scrollToWorkflowSection('[data-workflow-section="tray-number"]');
  }

  function handleTrayNumberConfirm() {
    designWorkflow.onTrayNumberConfirm();
    scrollToWorkflowSection(
      designWorkflow.trayType === "dividers"
        ? '[data-workflow-section="divider-layout"]'
        : '[data-workflow-section="dimensions"]',
    );
  }

  function handleDimensionStrategySelect(optionId: string) {
    dimensionWorkflow.onDimensionStrategySelect(optionId);
    scrollToWorkflowSection('[data-workflow-section="dimension-inputs"]');
  }

  function handleDividerLayoutSelect(optionId: string) {
    designWorkflow.onDividerLayoutSelect(optionId);
    scrollToWorkflowSection(
      optionId === "equal"
        ? '[data-workflow-section="divider-configuration"]'
        : '[data-workflow-section="divider-configuration"]',
    );
  }

  function handleGridConfirm() {
    designWorkflow.onGridConfirm();
    scrollToWorkflowSection('[data-workflow-section="dimensions"]');
  }

  return (
    <div className="space-y-8 [overflow-anchor:none]">
      <WorkflowProgress currentStage={currentStage} />

      <DesignWorkflow
        {...designWorkflow}
        onTrayTypeSelect={handleTrayTypeSelect}
        onTrayNumberConfirm={handleTrayNumberConfirm}
        onDividerLayoutSelect={handleDividerLayoutSelect}
        onGridConfirm={handleGridConfirm}
      />

      <DimensionWorkflow
        {...dimensionWorkflow}
        onDimensionStrategySelect={handleDimensionStrategySelect}
      />

      <CalculationSection {...calculationSection} />
    </div>
  );
}
