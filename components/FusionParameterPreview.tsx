import type { CalculationResult } from "@/lib/engineering/types";

type FusionParameterPreviewProps = {
  result: CalculationResult;
};

type ParameterValue = number | string;

type ParameterRowProps = {
  name: string;
  value: ParameterValue;
  unit?: string;
};

type ParameterSectionProps = {
  title: string;
  children: React.ReactNode;
};

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(6).replace(/\.?0+$/, "");
}

function formatValue(value: ParameterValue) {
  return typeof value === "number" ? formatNumber(value) : value;
}

function ParameterRow({ name, value, unit }: ParameterRowProps) {
  return (
    <div className="grid gap-2 border-b border-neutral-200 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <dt className="font-mono text-sm text-neutral-700">{name}</dt>

      <dd className="text-sm font-medium tabular-nums text-neutral-900 sm:text-right">
        {formatValue(value)}
        {unit ? ` ${unit}` : ""}
      </dd>
    </div>
  );
}

function ParameterSection({ title, children }: ParameterSectionProps) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>

      <dl className="mt-3">{children}</dl>
    </section>
  );
}

function getToggleValue(values: number[], index: number) {
  return values[index] ?? 0;
}

function getPositionValue(values: number[], index: number) {
  return values[index] ?? 0;
}

export default function FusionParameterPreview({
  result,
}: FusionParameterPreviewProps) {
  const verticalPositions = result.dividers?.verticalPositions ?? [];

  const horizontalPositions = result.dividers?.horizontalPositions ?? [];

  const verticalToggles = result.dividers?.verticalToggles ?? [];

  const horizontalToggles = result.dividers?.horizontalToggles ?? [];

  return (
    <details className="group border-t border-neutral-200 pt-8">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-5 transition hover:border-neutral-300 hover:bg-neutral-100">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Developer tools
          </p>

          <h2 className="mt-1 text-xl font-semibold text-neutral-900">
            Fusion Parameter Preview
          </h2>
        </div>

        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-xl text-neutral-700 transition group-open:rotate-180"
          aria-hidden="true"
        >
          ↓
        </span>
      </summary>

      <div className="mt-8 space-y-6">
        <p className="max-w-2xl leading-7 text-neutral-600">
          This preview exposes the generated engineering values in a
          Fusion-oriented format for developer validation. These parameters are
          not intended for normal website users.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <ParameterSection title="Box Parameters">
            <ParameterRow
              name="boxOutsideWidth"
              value={result.box.outsideWidth}
              unit="mm"
            />

            <ParameterRow
              name="boxOutsideDepth"
              value={result.box.outsideDepth}
              unit="mm"
            />

            <ParameterRow
              name="boxInsideWidth"
              value={result.box.insideWidth}
              unit="mm"
            />

            <ParameterRow
              name="boxInsideDepth"
              value={result.box.insideDepth}
              unit="mm"
            />
          </ParameterSection>

          <ParameterSection title="Configuration Parameters">
            <ParameterRow name="trayNumber" value={result.trayNumber} />

            <ParameterRow name="rows" value={result.rows ?? 0} />

            <ParameterRow name="columns" value={result.columns ?? 0} />

            <ParameterRow name="calculationStrategy" value={result.strategy} />
          </ParameterSection>

          {result.tray && (
            <ParameterSection title="Tray Parameters">
              <ParameterRow
                name="trayOutsideWidth"
                value={result.tray.outsideWidth}
                unit="mm"
              />

              <ParameterRow
                name="trayOutsideDepth"
                value={result.tray.outsideDepth}
                unit="mm"
              />

              <ParameterRow
                name="trayUsableWidth"
                value={result.tray.usableWidth}
                unit="mm"
              />

              <ParameterRow
                name="trayUsableDepth"
                value={result.tray.usableDepth}
                unit="mm"
              />
            </ParameterSection>
          )}

          {result.compartment && (
            <ParameterSection title="Compartment Parameters">
              <ParameterRow
                name="compartmentWidth"
                value={result.compartment.width}
                unit="mm"
              />

              <ParameterRow
                name="compartmentDepth"
                value={result.compartment.depth}
                unit="mm"
              />
            </ParameterSection>
          )}
        </div>

        {result.dividers && (
          <div className="grid gap-6 lg:grid-cols-2">
            <ParameterSection title="Vertical Divider Positions">
              {Array.from({ length: 5 }, (_, index) => (
                <ParameterRow
                  key={`vertical-position-${index + 1}`}
                  name={`V${index + 1}Position`}
                  value={getPositionValue(verticalPositions, index)}
                />
              ))}
            </ParameterSection>

            <ParameterSection title="Horizontal Divider Positions">
              {Array.from({ length: 5 }, (_, index) => (
                <ParameterRow
                  key={`horizontal-position-${index + 1}`}
                  name={`H${index + 1}Position`}
                  value={getPositionValue(horizontalPositions, index)}
                />
              ))}
            </ParameterSection>

            <ParameterSection title="Vertical Divider Toggles">
              {Array.from({ length: 5 }, (_, index) => (
                <ParameterRow
                  key={`vertical-toggle-${index + 1}`}
                  name={`V${index + 1}`}
                  value={getToggleValue(verticalToggles, index)}
                />
              ))}
            </ParameterSection>

            <ParameterSection title="Horizontal Divider Toggles">
              {Array.from({ length: 5 }, (_, index) => (
                <ParameterRow
                  key={`horizontal-toggle-${index + 1}`}
                  name={`H${index + 1}`}
                  value={getToggleValue(horizontalToggles, index)}
                />
              ))}
            </ParameterSection>
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h3 className="font-semibold text-neutral-900">Validation status</h3>

          <p className="mt-1 text-sm leading-6 text-neutral-600">
            Width, depth, compartment geometry and divider centre positions are
            generated by the validated Engineering Calculation Engine. Height
            parameters are intentionally excluded until the height model has
            been implemented and validated.
          </p>
        </div>
      </div>
    </details>
  );
}
