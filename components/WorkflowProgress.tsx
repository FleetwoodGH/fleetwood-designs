const stages = ["Configuration", "Dimensions", "Parameters"];

type WorkflowProgressProps = {
  currentStage: number;
};

export default function WorkflowProgress({
  currentStage,
}: WorkflowProgressProps) {
  return (
    <nav
      aria-label="Design progress"
      className="sticky top-0 z-20 w-full min-w-0 max-w-full border-y border-neutral-200 bg-white/95 py-2.5 shadow-sm backdrop-blur"
    >
      <ol className="flex w-full items-center justify-between text-[11px] sm:min-w-max sm:justify-start sm:gap-3 sm:text-sm">
        {stages.map((stage, index) => {
          const isCurrent = index === currentStage;
          const isComplete = index < currentStage;

          return (
            <li key={stage} className="flex min-w-0 items-center gap-1 sm:gap-3">
              {index > 0 && (
                <span className="text-neutral-300" aria-hidden="true">
                  →
                </span>
              )}

              <span
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${stage}${isComplete ? ", completed" : isCurrent ? ", current step" : ""}`}
                className={[
                  "whitespace-nowrap rounded-full px-1 py-1 font-medium sm:px-2",
                  isCurrent
                    ? "bg-neutral-900 text-white"
                    : isComplete
                      ? "text-neutral-700"
                      : "text-neutral-400",
                ].join(" ")}
              >
                {isComplete && (
                  <span className="mr-1" aria-hidden="true">
                    ✓
                  </span>
                )}
                {stage}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
