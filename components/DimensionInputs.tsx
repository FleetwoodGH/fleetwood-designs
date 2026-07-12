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
    <div className="w-full sm:w-[180px] sm:flex-none">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-900"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helpId}
          className={[
            "w-full rounded-lg border bg-white px-4 py-3 pr-12 text-neutral-900 outline-none transition",
            "focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2",
            hasError
              ? "border-red-500"
              : "border-neutral-300 hover:border-neutral-400",
          ].join(" ")}
        />

        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-neutral-500">
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
      <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-start">
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
