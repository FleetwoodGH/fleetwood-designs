import NumberSelector from "@/components/NumberSelector";
import ParameterInput from "@/components/ParameterInput";

type EqualGridInputProps = {
  rows: number;
  columns: number;
  min: number;
  max: number;
  confirmed: boolean;
  onRowsChange: (value: number) => void;
  onColumnsChange: (value: number) => void;
  onConfirm: () => void;
};

export default function EqualGridInput({
  rows,
  columns,
  min,
  max,
  confirmed,
  onRowsChange,
  onColumnsChange,
  onConfirm,
}: EqualGridInputProps) {
  return (
    <ParameterInput
      title="Configure the equal grid"
      description="Choose how many equally sized rows and columns the tray should contain."
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <NumberSelector
          label="Rows"
          value={rows}
          min={min}
          max={max}
          onChange={onRowsChange}
        />

        <NumberSelector
          label="Columns"
          value={columns}
          min={min}
          max={max}
          onChange={onColumnsChange}
        />
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-6">
        <p className="text-sm text-neutral-600">
          This creates {rows * columns} equally sized compartments.
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          Maximum: {max} rows × {max} columns.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        >
          {confirmed ? "Grid confirmed" : "Continue"}
        </button>
      </div>
    </ParameterInput>
  );
}
