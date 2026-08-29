import { Minus, Plus } from "lucide-react";

type NumberSelectorProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export default function NumberSelector({
  label,
  value,
  min,
  max,
  onChange,
}: NumberSelectorProps) {
  function decrease() {
    onChange(Math.max(min, value - 1));
  }

  function increase() {
    onChange(Math.min(max, value + 1));
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-neutral-900">{label}</p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrease}
          disabled={value <= min}
          className="flex h-11 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus size={20} strokeWidth={2} aria-hidden="true" />
        </button>

        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-label={label}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            if (
              Number.isInteger(nextValue) &&
              nextValue >= min &&
              nextValue <= max
            ) {
              onChange(nextValue);
            }
          }}
          className="h-11 w-16 shrink-0 appearance-none rounded-lg border border-neutral-300 bg-neutral-50 text-center text-xl font-semibold leading-none tabular-nums text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={increase}
          disabled={value >= max}
          className="flex h-11 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
