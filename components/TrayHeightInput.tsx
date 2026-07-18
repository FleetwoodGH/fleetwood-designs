import DimensionField from "@/components/DimensionField";
import ParameterInput from "@/components/ParameterInput";

type TrayHeightInputProps = {
  title: string;
  description: string;
  label: string;
  value: string;
  minimumHeight: number;
  isValid: boolean;
  hasError: boolean;
  onChange: (value: string) => void;
};

export default function TrayHeightInput({
  title,
  description,
  label,
  value,
  minimumHeight,
  isValid,
  hasError,
  onChange,
}: TrayHeightInputProps) {
  return (
    <ParameterInput title={title} description={description}>
      <div className="max-w-md">
        <DimensionField
          id="tray-height"
          label={label}
          value={value}
          minimum={minimumHeight}
          minimumIsExclusive
          isValid={isValid}
          hasError={hasError}
          inputMode="decimal"
          onChange={onChange}
        />
      </div>
    </ParameterInput>
  );
}
