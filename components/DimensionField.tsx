type DimensionFieldProps = {
  id: string;
  label: string;
  value: string;
  minimum: number;
  minimumIsExclusive?: boolean;
  isValid: boolean;
  hasError: boolean;
  inputMode?: "numeric" | "decimal";
  onChange: (value: string) => void;
};

export default function DimensionField({
  id,
  label,
  value,
  minimum,
  minimumIsExclusive = false,
  isValid,
  hasError,
  inputMode = "numeric",
  onChange,
}: DimensionFieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const minimumMessage = minimumIsExclusive
    ? `Must be greater than ${minimum} mm.`
    : `Minimum ${minimum} mm.`;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-900">
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
          inputMode={inputMode}
          pattern={inputMode === "decimal" ? "[0-9]*[.]?[0-9]*" : "[0-9]*"}
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
          {minimumMessage}
        </p>
      ) : (
        <p id={helpId} className="mt-2 text-sm text-neutral-500">
          {isValid ? "Valid dimension." : minimumMessage}
        </p>
      )}
    </div>
  );
}
