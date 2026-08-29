type SelectionCardProps = {
  title: string;
  description: string;
  icon: string;
  selected?: boolean;
  onSelect?: () => void;
};

function FunctionalIllustration({ type }: { type: string }) {
  const dimensionStrategy =
    type === "outside-size" || type === "usable-space";

  if (dimensionStrategy) {
    const outsideSize = type === "outside-size";

    return (
      <svg
        viewBox="0 0 96 58"
        className="h-10 w-20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="12" y="8" width="72" height="36" rx="4" />
        <rect x="18" y="14" width="60" height="24" rx="2" />

        {outsideSize ? (
          <path d="M12 51h72M12 51l5-3M12 51l5 3M84 51l-5-3M84 51l-5 3" />
        ) : (
          <path d="M20 26h56M20 26l5-3M20 26l5 3M76 26l-5-3M76 26l-5 3" />
        )}
      </svg>
    );
  }

  const grid = type === "equal-grid" || type === "custom-grid";
  if (grid) {
    const firstX = type === "equal-grid" ? 32 : 25;
    const secondX = type === "equal-grid" ? 56 : 62;
    const y = type === "equal-grid" ? 31 : 26;
    return (
      <svg
        viewBox="0 0 88 58"
        className="h-10 w-16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="8" y="12" width="72" height="38" rx="6" />
        <path d={`M${firstX} 12v38M${secondX} 12v38M8 ${y}h72`} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 88 58"
      className="h-10 w-16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 25h60v23H14z" />
      <path d="M14 29h60" strokeWidth="1.5" />
      {type !== "open-tray" && <path d="M12 19h64v6H12z" />}
      {type === "compartment-tray" && <path d="M34 29v19M54 29v19" />}
    </svg>
  );
}

export default function SelectionCard({
  title,
  description,
  icon,
  selected = false,
  onSelect,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "w-full touch-manipulation select-none rounded-xl border p-4 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
        selected
          ? "border-neutral-900 bg-neutral-100"
          : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50",
      ].join(" ")}
    >
      <span
        className="pointer-events-none mb-2 block text-neutral-700"
        aria-hidden="true"
      >
        <FunctionalIllustration type={icon} />
      </span>

      <h3 className="pointer-events-none mb-1 text-base font-semibold tracking-tight text-neutral-900">
        {title}
      </h3>

      <p className="pointer-events-none text-xs leading-4 text-neutral-500">
        {description}
      </p>
    </button>
  );
}
