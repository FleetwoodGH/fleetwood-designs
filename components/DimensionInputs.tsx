import DimensionField from "@/components/DimensionField";
import ParameterInput from "@/components/ParameterInput";

type DimensionInputsProps = {
  title: string;
  description: string;

  width: string;
  depth: string;
  height: string;

  widthLabel: string;
  depthLabel: string;
  heightLabel: string;

  minWidth: number;
  minDepth: number;
  minHeight: number;
  widthRequirement?: string;
  depthRequirement?: string;
  heightRequirement?: string;

  widthIsValid: boolean;
  depthIsValid: boolean;
  heightIsValid: boolean;

  widthHasError: boolean;
  depthHasError: boolean;
  heightHasError: boolean;

  heightInputMode?: "numeric" | "decimal";

  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
};

export default function DimensionInputs({
  title,
  description,
  width,
  depth,
  height,
  widthLabel,
  depthLabel,
  heightLabel,
  minWidth,
  minDepth,
  minHeight,
  widthRequirement,
  depthRequirement,
  heightRequirement,
  widthIsValid,
  depthIsValid,
  heightIsValid,
  widthHasError,
  depthHasError,
  heightHasError,
  heightInputMode = "numeric",
  onWidthChange,
  onDepthChange,
  onHeightChange,
}: DimensionInputsProps) {
  return (
    <ParameterInput title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-3">
        <DimensionField
          id="requested-width"
          label={widthLabel}
          value={width}
          minimum={minWidth}
          requirement={widthRequirement}
          isValid={widthIsValid}
          hasError={widthHasError}
          onChange={onWidthChange}
        />

        <DimensionField
          id="requested-depth"
          label={depthLabel}
          value={depth}
          minimum={minDepth}
          requirement={depthRequirement}
          isValid={depthIsValid}
          hasError={depthHasError}
          disabled={!widthIsValid}
          onChange={onDepthChange}
        />

        <DimensionField
          id="requested-height"
          label={heightLabel}
          value={height}
          minimum={minHeight}
          requirement={heightRequirement}
          isValid={heightIsValid}
          hasError={heightHasError}
          inputMode={heightInputMode}
          disabled={!depthIsValid}
          onChange={onHeightChange}
        />
      </div>
    </ParameterInput>
  );
}
