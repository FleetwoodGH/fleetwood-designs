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

  widthIsValid: boolean;
  depthIsValid: boolean;
  heightIsValid: boolean;

  widthHasError: boolean;
  depthHasError: boolean;
  heightHasError: boolean;

  onWidthChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
};

type DimensionFieldProps = {
  id: string;
  label: string;
  value: string;
  minimum: number;
  isValid: boolean;
  hasError: boolean;
  onChange: (value: string) => void;
};

function DimensionField({
  id,
  label,
  value,
  minimum,
  isValid,
  hasError,
  onChange,
}: DimensionFieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-900"
      >
        {label}
      </label>

      <div
        className={[
          "mt-2 flex overflow-hidden rounded-lg border bg-white transition",
          "focus-within:ring-2 focus-within:ring-neutral-900 focus-within:ring-offset-2",
          hasError
            ? "border-red-500"
            : "border-neutral-300 hover:border-neutral-400",
        ].join(" ")}
      >
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helpId}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-neutral-900 outline-none"
        />

        <span className="flex shrink-0 items-center border-l border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-500">
          mm
        </span>
      </div>

      {hasError ? (
        <p id={errorId} className="mt-2 text-sm text-red-600">
          Minimum: {minimum} mm.
        </p>
      ) : (
        <p id={helpId} className="mt-2 text-sm text-neutral-500">
          {isValid ? "Valid dimension." : `Minimum ${minimum} mm.`}
        </p>
      )}
    </div>
  );
}

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
  widthIsValid,
  depthIsValid,
  heightIsValid,
  widthHasError,
  depthHasError,
  heightHasError,
  onWidthChange,
  onDepthChange,
  onHeightChange,
}: DimensionInputsProps) {
  return (
    <ParameterInput title={title} description={description}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        <DimensionField
          id="requested-width"
          label={widthLabel}
          value={width}
          minimum={minWidth}
          isValid={widthIsValid}
          hasError={widthHasError}
          onChange={onWidthChange}
        />

        {widthIsValid && (
          <DimensionField
            id="requested-depth"
            label={depthLabel}
            value={depth}
            minimum={minDepth}
            isValid={depthIsValid}
            hasError={depthHasError}
            onChange={onDepthChange}
          />
        )}

        {depthIsValid && (
          <DimensionField
            id="requested-height"
            label={heightLabel}
            value={height}
            minimum={minHeight}
            isValid={heightIsValid}
            hasError={heightHasError}
            onChange={onHeightChange}
          />
        )}
      </div>
    </ParameterInput>
  );
}
