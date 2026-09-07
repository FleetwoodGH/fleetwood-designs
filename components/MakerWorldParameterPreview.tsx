import type {
  MakerWorldParameter,
  MakerWorldParameters,
} from "@/lib/engineering/makerworld";
import { PRODUCTS } from "@/lib/products";

type MakerWorldParameterPreviewProps = {
  parameters: MakerWorldParameters;
  inputOrder?: readonly string[];
  makerWorldUrl?: string | null;
  splitAcrossColumns?: boolean;
};

const MAKERWORLD_INPUT_ORDER = [
  "boxWidth",
  "boxDepth",
  "lidHeight",
  "trayHeight",
  "trayNumber",
  "dividerV1",
  "dividerV2",
  "dividerV3",
  "dividerV4",
  "dividerV5",
  "dividerH1",
  "dividerH2",
  "dividerH3",
  "toggleV1",
  "toggleV2",
  "toggleV3",
  "toggleV4",
  "toggleV5",
  "toggleH1",
  "toggleH2",
  "toggleH3",
  "dividerH4",
  "dividerH5",
  "toggleH4",
  "toggleH5",
] as const;

function getOrderedParameters(
  parameters: MakerWorldParameters,
  inputOrder: readonly string[],
) {
  const parametersByName = new Map(
    parameters.groups
      .flatMap((group) => group.parameters)
      .map((parameter) => [parameter.name, parameter]),
  );

  return inputOrder.map((name) => {
    const parameter = parametersByName.get(name);

    if (!parameter) {
      throw new Error(`Missing MakerWorld input parameter: ${name}.`);
    }

    return parameter;
  });
}

function ParameterHeadings() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-neutral-200 bg-neutral-50 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-neutral-500">
      <span>Parameter</span>
      <span className="text-right">Value</span>
    </div>
  );
}

function ParameterRow({ parameter }: { parameter: MakerWorldParameter }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-neutral-100 bg-white px-3 py-1.5">
      <dt className="min-w-0 font-mono text-sm text-neutral-800">
        {parameter.name}
      </dt>

      <dd className="text-right text-sm font-medium tabular-nums text-neutral-950">
        {parameter.displayValue}
        {parameter.unit ? ` ${parameter.unit}` : ""}
      </dd>
    </div>
  );
}

export default function MakerWorldParameterPreview({
  parameters,
  inputOrder = MAKERWORLD_INPUT_ORDER,
  makerWorldUrl = PRODUCTS.trayStorageSystem.makerWorldUrl,
  splitAcrossColumns = true,
}: MakerWorldParameterPreviewProps) {
  const orderedParameters = getOrderedParameters(parameters, inputOrder);

  return (
    <section
      className="scroll-mt-20 space-y-3 border-t border-neutral-200 pt-8"
      data-workflow-section="makerworld-input"
    >
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
          MakerWorld Input
        </h2>

        <p className="mt-1 max-w-2xl text-xs leading-4 text-neutral-500">
          Enter these values into MakerWorld in the order shown.
        </p>

        {makerWorldUrl && (
          <div className="mt-3">
            <a
              href={makerWorldUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              Open model in MakerWorld
            </a>

            <p className="mt-2 max-w-2xl text-xs leading-4 text-neutral-500">
              Opens the configurable model in MakerWorld. Enter the parameters
              shown below manually.
            </p>
          </div>
        )}
      </header>

      <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
        {splitAcrossColumns ? (
          <>
            <div className="md:hidden">
              <ParameterHeadings />
            </div>
            <div className="hidden grid-cols-2 gap-x-2 md:grid">
              <ParameterHeadings />
              <ParameterHeadings />
            </div>
          </>
        ) : (
          <ParameterHeadings />
        )}

        <dl
          className={
            splitAcrossColumns
              ? "grid md:grid-flow-col md:grid-cols-2 md:grid-rows-[repeat(13,minmax(0,auto))] md:gap-x-2"
              : "grid"
          }
        >
          {orderedParameters.map((parameter) => (
            <ParameterRow key={parameter.name} parameter={parameter} />
          ))}
        </dl>
      </div>
    </section>
  );
}
