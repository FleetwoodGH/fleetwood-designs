import SelectionCard from "@/components/SelectionCard";

type DecisionOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type DecisionStepProps = {
  question: string;
  options: DecisionOption[];
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
};

export default function DecisionStep({
  question,
  options,
  selectedOption,
  onSelect,
}: DecisionStepProps) {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900">
        {question}
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {options.map((option) => (
          <SelectionCard
            key={option.id}
            icon={option.icon}
            title={option.title}
            description={option.description}
            selected={selectedOption === option.id}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
    </section>
  );
}
