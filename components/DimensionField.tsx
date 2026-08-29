type DimensionFieldProps = {
  id: string;
  label: string;
  value: string;
  minimum: number;
  minimumIsExclusive?: boolean;
  requirement?: string;
  isValid: boolean;
  hasError: boolean;
  inputMode?: "numeric" | "decimal";
  disabled?: boolean;
  onChange: (value: string) => void;
};

export default function DimensionField({
  id,
  label,
  value,
  minimum,
  minimumIsExclusive = false,
  requirement,
  isValid,
  hasError,
  inputMode = "numeric",
  disabled = false,
  onChange,
}: DimensionFieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const minimumMessage =
    requirement ??
    (minimumIsExclusive
      ? `Must be greater than ${minimum} mm.`
      : `Minimum ${minimum} mm.`);

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
          "mt-1.5 flex overflow-hidden rounded-lg border bg-white transition",
          "focus-within:ring-2 focus-within:ring-neutral-900 focus-within:ring-offset-2",
          disabled ? "opacity-55" : "",
          hasError
            ? "border-red-500"
            : "border-neutral-300 hover:border-neutral-400",
        ].join(" ")}
      >
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          pattern={inputMode === "decimal" ? "[0-9]*[.]?[0-9]*" : "[0-9]*"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : helpId}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-neutral-900 outline-none disabled:cursor-not-allowed"
        />

        <span className="flex shrink-0 items-center border-l border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
          mm
        </span>
      </div>

      {hasError ? (
        <p id={errorId} className="mt-1.5 text-xs leading-4 text-red-600">
          {minimumMessage}
        </p>
      ) : disabled ? (
        <p id={helpId} className="mt-1.5 text-xs leading-4 text-neutral-500">
          Complete the previous dimension first.
        </p>
      ) : !isValid ? (
        <p id={helpId} className="mt-1.5 text-xs leading-4 text-neutral-500">
          {minimumMessage}
        </p>
      ) : null}
    </div>
  );
}
