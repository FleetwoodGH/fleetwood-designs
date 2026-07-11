"use client";

import { useState } from "react";
import DecisionStep from "@/components/DecisionStep";

type BuildType = "box" | "system" | null;

const buildOptions = [
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
      "A configurable storage system with trays and optional dividers.",
    icon: "🗃️",
  },
];

export default function StorageDesignAssistant() {
  const [buildType, setBuildType] = useState<BuildType>(null);

  function handleBuildTypeSelect(optionId: string) {
    if (optionId === "box" || optionId === "system") {
      setBuildType(optionId);
    }
  }

  return (
    <div>
      <DecisionStep
        question="What would you like to build?"
        options={buildOptions}
        selectedOption={buildType}
        onSelect={handleBuildTypeSelect}
      />

      {buildType && (
        <div className="mt-10 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <p className="text-sm font-medium text-neutral-900">
            Selected configuration
          </p>

          <p className="mt-2 text-neutral-600">
            {buildType === "box" ? "Storage Box" : "Storage System"}
          </p>
        </div>
      )}
    </div>
  );
}
