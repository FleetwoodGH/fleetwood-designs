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
      <p className="mb-3 text-sm font-medium text-neutral-900">{label}</p>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={decrease}
          disabled={value <= min}
          className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus size={24} strokeWidth={2} aria-hidden="true" />
        </button>

        <output
          className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 text-2xl font-semibold leading-none tabular-nums text-neutral-900"
          aria-live="polite"
        >
          {value}
        </output>

        <button
          type="button"
          onClick={increase}
          disabled={value >= max}
          className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus size={24} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
