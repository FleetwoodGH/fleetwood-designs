"use client";

import CalculationSection from "@/components/storage-design-assistant/CalculationSection";
import DesignWorkflow from "@/components/storage-design-assistant/DesignWorkflow";
import DimensionWorkflow from "@/components/storage-design-assistant/DimensionWorkflow";
import { useTrayStorageSystemState } from "@/components/storage-design-assistant/useTrayStorageSystemState";
import WorkflowProgress from "@/components/WorkflowProgress";

function scrollToWorkflowSection(selector: string) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const section = document.querySelector(selector);

      if (!section) {
        return;
      }

      const progressHeight =
        document
          .querySelector('nav[aria-label="Design progress"]')
          ?.getBoundingClientRect().height ?? 0;
      const sectionRect = section.getBoundingClientRect();

      window.scrollTo({
        top: Math.max(0, window.scrollY + sectionRect.top - progressHeight),
        behavior: "smooth",
      });
    });
  });
}

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
        : '[data-workflow-section="custom-layout-configuration"]',
    );
  }

  function handleGridConfirm() {
    designWorkflow.onGridConfirm();
    scrollToWorkflowSection('[data-workflow-section="dimensions"]');
  }

  function handleDimensionConfirm() {
    if (calculationSection.calculationState.result) {
      scrollToWorkflowSection('[data-workflow-section="makerworld-input"]');
    }
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
        onDimensionConfirm={handleDimensionConfirm}
      />

      <CalculationSection {...calculationSection} />
    </div>
  );
}
